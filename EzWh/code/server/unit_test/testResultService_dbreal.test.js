const DBHandler = require('../modules/DBHandler');
const testResultDAO=require('../modules/testResultDAO');
const TestResultService=require('../services/testResultService')

const dbHandler=new DBHandler('EzWhDB.db');
const testResultHandler=new testResultDAO(dbHandler);
const testResultService=new TestResultService(testResultHandler);

describe('Test TestResultDAO',() =>{

    beforeAll(async()=>{
        await dbHandler.run('drop table if exists SKUITEM');
        await dbHandler.run('create table if not exists SKUITEM(RFID TEXT PRIMARY KEY,SKUID INTEGER, AVAILABLE INTEGER,DATEOFSTOCK TEXT,FOREIGN KEY(SKUID) REFERENCES SKU(ID))');
        
        await dbHandler.run("drop table if exists TESTDESCRIPTOR", []);
        await dbHandler.run("create table if not exists TESTDESCRIPTOR(ID INTEGER PRIMARY KEY,NAME TEXT,PROCEDUREDESCRIPTION TEXT, IDSKU INTEGER,FOREIGN KEY(IDSKU) REFERENCES  SKU(ID))");
        
        await testResultHandler.dropTableTESTRESULT()
        await testResultHandler.createTableTESTRESULT()

        await dbHandler.run("DELETE FROM TESTDESCRIPTOR"); 
        await dbHandler.run("DELETE FROM SKUITEM");
        await dbHandler.run("DELETE FROM SKU");

        await dbHandler.run("insert into SKU(DESCRIPTION,WEIGHT,VOLUME,NOTES,PRICE,AVAILABLEQUANTITY) VALUES(?,?,?,?,?,?)",['NEW SKU1',100,100,'notes1',250,40])
        await dbHandler.run("insert into SKU(DESCRIPTION,WEIGHT,VOLUME,NOTES,PRICE,AVAILABLEQUANTITY) VALUES(?,?,?,?,?,?)",['NEW SKU2',200,100,'notes2',300,400])
        
        await dbHandler.run("insert into TESTDESCRIPTOR(NAME,PROCEDUREDESCRIPTION, IDSKU) VALUES(?,?,?)",['test 1','method1',1])
        await dbHandler.run("insert into TESTDESCRIPTOR(NAME,PROCEDUREDESCRIPTION, IDSKU) VALUES(?,?,?)",['test 2','method2',1])

        await dbHandler.run("insert into SKUITEM(RFID,SKUID,AVAILABLE,DATEOFSTOCK) VALUES(?,?,0,?)",['12345678963214587412032145698741',1,'2022-02-12'])
        await dbHandler.run("insert into SKUITEM(RFID,SKUID,AVAILABLE,DATEOFSTOCK) VALUES(?,?,0,?)",['12345678963214587412032145698000',1,'2022-04-12'])
    });

    testNewTestResult('12345678963214587412032145698741',1,'2021-05-05',1)
    testNewTestResult('12345678963214587412032145698741',2,'2021-05-05',0)
    testUpdateTestResult(1,'12345678963214587412032145698741',2,'2022-05-15',0)
    testUpdateTestResult(2,'12345678963214587412032145698741',2,'2022-05-15',1)
    testDeleteTestResult('12345678963214587412032145698741',2)

})

function testNewTestResult(rfid,idTestDescriptor,date,result)
{
    test('Add new TestResult', async ()=>{

        let lastID = await testResultService.addTestResult(rfid,idTestDescriptor,date,result);
        expect(lastID.id).toBeTruthy();

        var res = await testResultService.getTestResults(rfid);
        expect(res.length).toBeGreaterThan(0);    

        let testResult = await testResultService.findTestResult(rfid,lastID.id);
        expect(testResult.id).toStrictEqual(lastID.id);
        expect(testResult.idTestDescriptor).toStrictEqual(idTestDescriptor);
        expect(testResult.Date).toStrictEqual(date);
        expect(testResult.Result).toStrictEqual(result);

    })
}

function testUpdateTestResult(id,rfid,idTestDescriptor,date,result)
{
    test('Update a TestResult', async ()=>{

        let change = await testResultService.updateTestResult(rfid,id,idTestDescriptor,date,result);
        expect(change.id).toBe(1);

        let testResult = await testResultService.findTestResult(rfid,id);
        expect(testResult.idTestDescriptor).toStrictEqual(idTestDescriptor);
        expect(testResult.Date).toStrictEqual(date);
        expect(testResult.Result).toStrictEqual(result);

    })
}

function testDeleteTestResult(rfid,id)
{
    test('Delete a TestResult', async ()=>{

        let res = await testResultService.deleteTestResult(rfid,id);
        expect(res).toBe(true);

        let testResult = await testResultService.findTestResult(rfid,id);
        expect(testResult).toBeUndefined();


    })
}
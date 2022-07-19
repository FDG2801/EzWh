const DBHandler = require('../modules/DBHandler');
const dbHandler = new DBHandler('EzWhDB.db');
const TestDescriptorDAO = require('../modules/testDescriptionDAO');
const testDescriptorHandler = new TestDescriptorDAO(dbHandler);

describe('Test TestDescriptorDAO',() =>{
    beforeAll(async()=>{
        await testDescriptorHandler.dropTableTESTDESCRIPTOR()
        await testDescriptorHandler.createTableTESTDESCRIPTOR()

        await dbHandler.run("drop table if exists SKU"); 
        await dbHandler.run("create table if not exists SKU(ID INTEGER PRIMARY KEY AUTOINCREMENT,DESCRIPTION TEXT,WEIGHT REAL,VOLUME REAL,NOTES TEXT,POSITION INTEGER,AVAILABLEQUANTITY INTEGER,PRICE REAL)");

        await dbHandler.run("insert into SKU(DESCRIPTION,WEIGHT,VOLUME,NOTES,PRICE,AVAILABLEQUANTITY) VALUES(?,?,?,?,?,?)",['NEW SKU1',100,100,'notes1',250,40])
        await dbHandler.run("insert into SKU(DESCRIPTION,WEIGHT,VOLUME,NOTES,PRICE,AVAILABLEQUANTITY) VALUES(?,?,?,?,?,?)",['NEW SKU2',200,100,'notes2',300,400])

    });

    afterAll(async()=>{
        await testDescriptorHandler.dropTableTESTDESCRIPTOR()
        await testDescriptorHandler.createTableTESTDESCRIPTOR()

        await dbHandler.run("drop table if exists SKU"); 
        await dbHandler.run("create table if not exists SKU(ID INTEGER PRIMARY KEY AUTOINCREMENT,DESCRIPTION TEXT,WEIGHT REAL,VOLUME REAL,NOTES TEXT,POSITION INTEGER,AVAILABLEQUANTITY INTEGER,PRICE REAL)");

    });

    test('delete db', async ()=>{
        var res=await testDescriptorHandler.getAll()
        expect(res.length).toBe(0);
    })

    testNewTestDescriptor('test 1','method1',1)
    testNewTestDescriptor('test 2','method2',1)
    testUpdateTestDescriptor(1,'test 1 edited','method1',1)
    testUpdateTestDescriptor(2,'test 2','method 2 edited',2)
    testDeleteTestDescriptor(1)

})

function testNewTestDescriptor(name,procedureDescription,idSKU)
{
    test('Add new TestDescriptor', async ()=>{

        let lastID = await testDescriptorHandler.addTESTDESCRIPTOR(name,procedureDescription,idSKU);
        expect(lastID.id).toBeTruthy();

        var res = await testDescriptorHandler.getAll();
        expect(res.length).toBeGreaterThan(0);    

        let test = await testDescriptorHandler.find(lastID.id);
        expect(test.id).toStrictEqual(lastID.id);
        expect(test.name).toStrictEqual(name);
        expect(test.procedureDescription).toStrictEqual(procedureDescription);
        expect(test.idSKU).toStrictEqual(idSKU);

    })
}

function testUpdateTestDescriptor(id,name,procedureDescription,idSKU)
{
    test('Update a TestDescriptor', async ()=>{

        let change = await testDescriptorHandler.updateTESTDESCRIPTOR(id,name,procedureDescription,idSKU);
        expect(change.id).toBe(1);

        let test = await testDescriptorHandler.find(id);
        expect(test.name).toStrictEqual(name);
        expect(test.procedureDescription).toStrictEqual(procedureDescription);
        expect(test.idSKU).toStrictEqual(idSKU);

    })
}

function testDeleteTestDescriptor(id)
{
    test('Delete a TestDescriptor', async ()=>{

        let res = await testDescriptorHandler.deleteTESTDESCRIPTOR(id);
        expect(res).toBeTruthy();

        let test = await testDescriptorHandler.find(id);
        expect(test).toBeUndefined();


    })
}


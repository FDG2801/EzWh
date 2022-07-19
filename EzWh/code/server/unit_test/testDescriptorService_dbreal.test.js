const DBHandler = require('../modules/DBHandler');
const testDescriptorDAO=require('../modules/testDescriptionDAO');
const TestDescriptorService=require('../services/testDescriptorService')

const dbHandler=new DBHandler('EzWhDB.db');
const testDescriptorHandler=new testDescriptorDAO(dbHandler);
const testDescriptorService=new TestDescriptorService(testDescriptorHandler);

describe('Test TestDescriptorDAO',() =>{

    beforeAll(async()=>{
        await testDescriptorHandler.dropTableTESTDESCRIPTOR()
        await testDescriptorHandler.createTableTESTDESCRIPTOR()

        await dbHandler.run("DELETE FROM SKU"); 
        await dbHandler.run("insert into SKU(DESCRIPTION,WEIGHT,VOLUME,NOTES,PRICE,AVAILABLEQUANTITY) VALUES(?,?,?,?,?,?)",['NEW SKU1',100,100,'notes1',250,40])
        await dbHandler.run("insert into SKU(DESCRIPTION,WEIGHT,VOLUME,NOTES,PRICE,AVAILABLEQUANTITY) VALUES(?,?,?,?,?,?)",['NEW SKU2',200,100,'notes2',300,400])

    });

    testNewTestDescriptor('test 1','method1',1)
    testNewTestDescriptor('test 3','method3',2)
    testUpdateTestDescriptor(1,'test 1 edited','method1',1)
    testUpdateTestDescriptor(2,'test 2','method 2 edited',2)
    testDeleteTestDescriptor(1)

})

function testNewTestDescriptor(name,procedureDescription,idSKU)
{
    test('Add new TestDescriptor', async ()=>{

        let lastID = await testDescriptorService.addTestDescriptor(name,procedureDescription,idSKU);
        expect(lastID.id).toBeTruthy();

        var res = await testDescriptorService.getTestDescriptors();
        expect(res.length).toBeGreaterThan(0);    

        let test = await testDescriptorService.findTestDescriptor(lastID.id);
        expect(test.id).toStrictEqual(lastID.id);
        expect(test.name).toStrictEqual(name);
        expect(test.procedureDescription).toStrictEqual(procedureDescription);
        expect(test.idSKU).toStrictEqual(idSKU);

    })
}

function testUpdateTestDescriptor(id,name,procedureDescription,idSKU)
{
    test('Update a TestDescriptor', async ()=>{

        let change = await testDescriptorService.updateTestDescriptor(id,name,procedureDescription,idSKU);
        expect(change.id).toBe(1);

        let test = await testDescriptorService.findTestDescriptor(id);
        expect(test.name).toStrictEqual(name);
        expect(test.procedureDescription).toStrictEqual(procedureDescription);
        expect(test.idSKU).toStrictEqual(idSKU);

    })
}

function testDeleteTestDescriptor(id)
{
    test('Delete a TestDescriptor', async ()=>{

        let res = await testDescriptorService.deleteTestDescriptor(id);
        expect(res).toBeTruthy();

        let test = await testDescriptorService.findTestDescriptor(id);
        expect(test).toBeUndefined();


    })
}
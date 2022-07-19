const DBHandler = require('../modules/DBHandler');
const SKUDAO=require('../modules/SKUDAO');
const PositionDAO=require('../modules/positionDAO');
const SKUService=require('../services/SKUService')

const dbHandler=new DBHandler('EzWhDB.db');
const SKUHandler=new SKUDAO(dbHandler);
const PositionHandler=new PositionDAO(dbHandler);
const skuService=new SKUService(SKUHandler,PositionHandler);

describe('test adding a new sku via service',()=>{

    beforeAll(async () => {
        await SKUHandler.dropTableSKU();
        await SKUHandler.createTableSKU();

        await dbHandler.run("DELETE FROM POSITION"); 
        await dbHandler.run("INSERT INTO POSITION VALUES (?,?,?,?,?,?,?,?)",['123445677412',1234,4567,7412,15000,15000])
        await dbHandler.run("INSERT INTO POSITION VALUES (?,?,?,?,?,?,?,?)",['123420209632',1234,2020,9632,15000,15000])
    });

    testNewSKU('NEW SKU 1 with service test',100,100,'notes',250,40)
    testNewSKU('NEW SKU 2 with service test',200,200,'notes',2500,40)
    testNewSKU('NEW SKU 3 with service test',150,100,'notes',850,70)
});

describe('test setting position for an existing sku via service',()=>{
    testSetPosition(1,123420209632)
});

function testNewSKU(descrition,weight,volume,notes,price,availableQuantity)
{
    test('Adding a new SKU', async () => {

        let lastID = await skuService.addSKU(descrition,weight,volume,notes,price,availableQuantity);
        expect(lastID.id).toBeTruthy();

        var res = await skuService.getSKUs();
        expect(res.length).toBeGreaterThan(0);    

        let sku = await skuService.findSKU(lastID.id);
      
        expect(sku.description).toStrictEqual(descrition);
        expect(sku.weight).toStrictEqual(weight);
        expect(sku.volume).toStrictEqual(volume);
        expect(sku.notes).toStrictEqual(notes);
        expect(sku.position).toStrictEqual(null);
        expect(sku.availableQuantity).toStrictEqual(availableQuantity);
        expect(sku.price).toStrictEqual(price);
    })
}

function testSetPosition(id,positionId)
{
    test('Setting Position', async () => {

        let res = await skuService.setPosition(id,positionId);
        expect(res).toBeDefined()

        if(res.id)
        {
            let sku = await skuService.findSKU(id);
            expect(sku.position).toStrictEqual(positionId);
        }

       
    })
}
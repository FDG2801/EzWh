const DBHandler = require('../modules/DBHandler');
const dbHandler = new DBHandler('EzWhDB.db');
const SKUDAO = require('../modules/SKUDAO');
const SKUHandler = new SKUDAO(dbHandler);


describe('TEST SKUDAO', () => {
    beforeAll(async () => {
      
        await SKUHandler.dropTableSKU();
        await SKUHandler.createTableSKU();

        await dbHandler.run('DROP TABLE IF EXISTS POSITION');
        await dbHandler.run('CREATE TABLE IF NOT EXISTS POSITION(POSITIONID VARCHAR PRIMARY KEY, AISLEID VARCHAR, ROW VARCHAR,COL VARCHAR,MAXWEIGHT VARCHAR,MAXVOLUME VARCHAR,OCCUPIEDWEIGHT VARCHAR,OCCUPIEDVOLUME VARCHAR)');

        await dbHandler.run("INSERT INTO POSITION VALUES (?,?,?,?,?,?,?,?)",['123445677412',1234,4567,7412,15000,15000])
        await dbHandler.run("INSERT INTO POSITION VALUES (?,?,?,?,?,?,?,?)",['123420209632',1234,2020,9632,15000,15000])
    });

    afterAll(async()=>{
                
                 await SKUHandler.dropTableSKU();
                 await SKUHandler.createTableSKU();
                
                 await dbHandler.run('DROP TABLE IF EXISTS POSITION');
                 await dbHandler.run('CREATE TABLE IF NOT EXISTS POSITION(POSITIONID VARCHAR PRIMARY KEY, AISLEID VARCHAR, ROW VARCHAR,COL VARCHAR,MAXWEIGHT VARCHAR,MAXVOLUME VARCHAR,OCCUPIEDWEIGHT VARCHAR,OCCUPIEDVOLUME VARCHAR)');
            })  

    test('delete db', async () => {
        var res = await SKUHandler.getAll();
        expect(res.length).toStrictEqual(0);
    });

    testNewSKU('NEW SKU1',100,100,'notes1',250,40)
    testNewSKU('NEW SKU2',200,100,'notes2',300,400)
    testNewSKU('NEW SKU3',300,150,'notes3',50,145)

    testSetPosition(1,123445677412)
    testSetPosition(2,123420209632)
})

function testNewSKU(descrition,weight,volume,notes,price,availableQuantity)
{
    test('Add new SKU', async () => {

        let lastID = await SKUHandler.addSKU(descrition,weight,volume,notes,price,availableQuantity);
        expect(lastID.id).toBeTruthy();

        var res = await SKUHandler.getAll();
        expect(res.length).toBeGreaterThan(0);    

        let sku = await SKUHandler.find(lastID.id);
        expect(sku.id).toStrictEqual(lastID.id);
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
    test('Set Position', async () => {

        let change = await SKUHandler.setPosition(id,positionId);
        expect(change.id).toStrictEqual(1);     

        let sku = await SKUHandler.find(id);
        expect(sku.id).toStrictEqual(id);
        expect(sku.position).toStrictEqual(positionId);
       
    })
}




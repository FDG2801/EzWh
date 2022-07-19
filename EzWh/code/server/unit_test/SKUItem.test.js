const DBHandler = require('../modules/DBHandler');
const dbHandler = new DBHandler('EzWhDB.db');
const SKUItemDAO = require('../modules/SKUItemDAO');
const SKUItemHandler = new SKUItemDAO(dbHandler);


describe('Test SKUItemDAO', () => {
    beforeAll(async()=> {
        await SKUItemHandler.dropTableSKUITEM();
        await SKUItemHandler.createTableSKUITEM();

        await dbHandler.run("drop table if exists SKU"); 
        await dbHandler.run("create table if not exists SKU(ID INTEGER PRIMARY KEY AUTOINCREMENT,DESCRIPTION TEXT,WEIGHT REAL,VOLUME REAL,NOTES TEXT,POSITION INTEGER,AVAILABLEQUANTITY INTEGER,PRICE REAL)");
        await dbHandler.run("insert into SKU(DESCRIPTION,WEIGHT,VOLUME,NOTES,PRICE,AVAILABLEQUANTITY) VALUES(?,?,?,?,?,?)",['NEW SKU1',100,100,'notes1',250,40])
        await dbHandler.run("insert into SKU(DESCRIPTION,WEIGHT,VOLUME,NOTES,PRICE,AVAILABLEQUANTITY) VALUES(?,?,?,?,?,?)",['NEW SKU2',200,100,'notes2',300,400])
    });

    afterAll(async()=> {
        await SKUItemHandler.dropTableSKUITEM();
        await SKUItemHandler.createTableSKUITEM();

        await dbHandler.run("drop table if exists SKU"); 
        await dbHandler.run("create table if not exists SKU(ID INTEGER PRIMARY KEY AUTOINCREMENT,DESCRIPTION TEXT,WEIGHT REAL,VOLUME REAL,NOTES TEXT,POSITION INTEGER,AVAILABLEQUANTITY INTEGER,PRICE REAL)");
    });

    test('delete db', async () => {
        var res = await SKUItemHandler.getAll();
        expect(res.length).toStrictEqual(0);
    });

    testNewSKUItem('12345678963214587412032145698741',1,'2022-02-12')
    testNewSKUItem('12345678963214587412032145698000',1,'2022-04-12')
    testNewSKUItem('65421369852147852025874120025874',2,'2022-02-25')
    testUpdateSKUItem('12345678963214587412032145698741','12345678963214587412032145698740',1,'2022-02-12')
    testUpdateSKUItem('65421369852147852025874120025874','65421369852147852025874120025874',1,'2022-03-12')
    testGetbySKUId(1)
    testGetbySKUId(2)

})


function testNewSKUItem(rfid,skuId,stockDate)
{
    test('Add new SKUItem', async () => {

        let lastID = await SKUItemHandler.addSKUITEM(rfid,skuId,stockDate);
        expect(lastID.id).toBeTruthy();

        var res = await SKUItemHandler.getAll();
        expect(res.length).toBeGreaterThan(0);    

        let skuItem = await SKUItemHandler.find(rfid);
        expect(skuItem.RFID).toStrictEqual(rfid);
        expect(skuItem.SKUId).toStrictEqual(skuId);
        expect(skuItem.Available).toBe(0);
        expect(skuItem.DateOfStock).toStrictEqual(stockDate);
    })
}

function testUpdateSKUItem(rfid,newRfid,available,stockDate)
{
    test('Update SKUItem', async () => {

        let change = await SKUItemHandler.updateSKUITEM(rfid,newRfid,available,stockDate);
        expect(change.id).toStrictEqual(1);   

        let skuItem = await SKUItemHandler.find(newRfid);
        expect(skuItem.RFID).toStrictEqual(newRfid);
        expect(skuItem.Available).toBe(available);
        expect(skuItem.DateOfStock).toStrictEqual(stockDate);
    })
}

function testGetbySKUId(id)
{
    test('Get SKUItem by SKUId', async () => {

        let res = await SKUItemHandler.getbySKUId(id);
        for (let item of res) {
            expect(item.SKUId).toStrictEqual(id);
        }
    })
}
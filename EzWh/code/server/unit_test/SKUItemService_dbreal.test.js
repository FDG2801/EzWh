const DBHandler = require('../modules/DBHandler');
const SKUItemDAO=require('../modules/SKUItemDAO');
const SKUItemService = require('../services/SKUItemService');

const dbHandler=new DBHandler('EzWhDB.db');
const SKUItemHandler=new SKUItemDAO(dbHandler);
const skuItemService=new SKUItemService(SKUItemHandler);




describe('Test SKUItem service', () => {

    beforeAll(async()=> {
        await SKUItemHandler.dropTableSKUITEM();
        await SKUItemHandler.createTableSKUITEM();

        await dbHandler.run("DELETE FROM SKU"); 
        await dbHandler.run("insert into SKU(DESCRIPTION,WEIGHT,VOLUME,NOTES,PRICE,AVAILABLEQUANTITY) VALUES(?,?,?,?,?,?)",['NEW SKU1',100,100,'notes1',250,40])
        await dbHandler.run("insert into SKU(DESCRIPTION,WEIGHT,VOLUME,NOTES,PRICE,AVAILABLEQUANTITY) VALUES(?,?,?,?,?,?)",['NEW SKU2',200,100,'notes2',300,400])
    });
 
    testNewSKUItem('98745632101478523698521477896541',1,'2021-02-12')
    testUpdateSKUItem('98745632101478523698521477896541','98745632101478523698521477896540',1,'2021-02-12')
    testGetbySKUId(1)

})

function testNewSKUItem(rfid,skuId,stockDate)
{
    test('Add new SKUItem', async () => {

        let lastID = await skuItemService.addSKUItem(rfid,skuId,stockDate);
        expect(lastID.id).toBeTruthy();

        var res = await skuItemService.getSKUItems();
        expect(res.length).toBeGreaterThan(0);    

        let skuItem = await skuItemService.findSKUItem(rfid);
        expect(skuItem.RFID).toStrictEqual(rfid);
        expect(skuItem.SKUId).toStrictEqual(skuId);
        expect(skuItem.Available).toBe(0);
        expect(skuItem.DateOfStock).toStrictEqual(stockDate);
    })
}

function testUpdateSKUItem(rfid,newRfid,available,stockDate)
{
    test('Update SKUItem', async () => {

        let change = await skuItemService.updateSKUItem(rfid,newRfid,available,stockDate);
        expect(change.id).toStrictEqual(1);   

        let skuItem = await skuItemService.findSKUItem(newRfid);
        expect(skuItem.RFID).toStrictEqual(newRfid);
        expect(skuItem.Available).toBe(available);
        expect(skuItem.DateOfStock).toStrictEqual(stockDate);
    })
}

function testGetbySKUId(id)
{
    test('Get SKUItem by SKUId', async () => {

        let res = await skuItemService.getSKUsbySKUId(id);
        for (let item of res) {
            expect(item.SKUId).toStrictEqual(id);
        }
    })
}
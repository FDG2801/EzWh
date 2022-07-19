const DBHandler = require('../modules/DBHandler');
const dbHandler = new DBHandler('InternalReturnTestDb.db');




const returnOrdDAO = require('../modules/returnOrdDAO');
const PositionDAO = require('../modules/positionDAO')
const internalOrdDAO = require('../modules/internalOrdDAO');
const restockOrdDAO = require('../modules/restockOrdDAO');
const ItemDAO = require('../modules/itemDAO');
const SKUDAO = require('../modules/SKUDAO');
const SKUItemDAO = require('../modules/SKUItemDAO');
const testDescriptorDAO = require('../modules/testDescriptionDAO');
const testResultDAO = require('../modules/testResultDAO');
const userDAO = require('../modules/userDAO');

const internalOrderHandler = new internalOrdDAO(dbHandler);
const returnOrderHandler = new returnOrdDAO(dbHandler);
const positionHandler = new PositionDAO(dbHandler)
const restockHandler = new restockOrdDAO(dbHandler);
const itemHandler = new ItemDAO(dbHandler);
const SKUHandler = new SKUDAO(dbHandler);
const SKUItemHandler = new SKUItemDAO(dbHandler);
const testDescriptorHandler = new testDescriptorDAO(dbHandler);
const testResultHandler = new testResultDAO(dbHandler);
const userHandler = new userDAO(dbHandler);


const dayjs = require('dayjs')
describe('Test add internal order', () => {
    beforeAll(async () => {
        await recreateDB();
/*         await internalOrderHandler.dropTableIssuedItems();
        await internalOrderHandler.dropTableInternalOrders();
        await internalOrderHandler.dropTableCompletedItems();
        await internalOrderHandler.newTableInternalOrders();
        await internalOrderHandler.newTableIssuedItems();
        await internalOrderHandler.newTableCompletedItems(); */
        await populateDB();
    });

    testNewInternalOrder('2021/11/29 09:33', 1);
    testNewInternalOrder('2021/11/29 09:33', 1);
    afterAll(async () => {
        await recreateDB();
    });

})

function testNewInternalOrder(issueDate, customerId) {
    test('Add new restock order', async () => {
        let date = await new dayjs(issueDate);
        let order = await internalOrderHandler.addInternalOrder(date.format('YYYY-MM-DD HH:mm'), customerId);

        expect(order.id).toBeTruthy();

        let res = await internalOrderHandler.getInternalOrderByID(order.id);
        expect(res.IOID).toStrictEqual(order.id);
        expect(res.ISSUEDATE).toStrictEqual(issueDate);
        expect(res.CUSTOMERID).toStrictEqual(customerId);
    });
}

describe('Test get products, get internal order, modify state and add completed item', () => {
    beforeAll(async () => {
 /*        await internalOrderHandler.dropTableIssuedItems();
        await internalOrderHandler.dropTableInternalOrders();
        await internalOrderHandler.dropTableCompletedItems();
        await internalOrderHandler.newTableInternalOrders();
        await internalOrderHandler.newTableIssuedItems();
        await internalOrderHandler.newTableCompletedItems(); */
        await recreateDB();
        await populateDB();
        let order1 = await internalOrderHandler.addInternalOrder(dayjs('2022/11/29 09:33').format('YYYY-MM-DD HH:mm'), 1)
        await internalOrderHandler.addIOtem(order1.id, 8, 20)
        await internalOrderHandler.addIOtem(order1.id, 9, 20)

        let rowID = await dbHandler.run("INSERT INTO INTERNAL_ORDERS(ISSUEDATE, STATE, CUSTOMERID) VALUES ('2021/11/29 09:33', 'COMPLETED', 1);");
        await dbHandler.run("INSERT INTO ISSUED_ITEM (IOID, SKUID, QUANTITY) VALUES (?, 1, 20);", [rowID.id]);
        await dbHandler.run("INSERT INTO COMPLETED_ITEM (IOID, SKUID, RFID) VALUES (?, 8, '12345678901234567890123456789016');", [rowID.id]);
        await dbHandler.run("INSERT INTO COMPLETED_ITEM (IOID, SKUID, RFID) VALUES (?, 9, '12345678901234567890123456789038');", [rowID.id]);


    });

    afterAll(async () => {
        await recreateDB();
    });
 
    testGetProductByID(1, "ISSUED");
    testGetProductByID(2, "COMPLETED")
    testGetInternalOrderByID(1);
    testModifyStateByID(1, "ACCEPTED")
    testModifyStateByID(1, "COMPLETED")
    testAddCompletedItem(1, 1, "12345678901234567890123456789015")
})

function testGetProductByID(ID, STATE) {
    test('retrieve products by id', async () => {
        let items = await internalOrderHandler.getProductsByID(ID, STATE);
        expect(items.length).toStrictEqual(2);
    });
}

function testGetInternalOrderByID(id) {
    test('test retrieve internal order by id', async () => {
        let res = await internalOrderHandler.getInternalOrderByID(id);
        expect(res.IOID).toStrictEqual(1);
        expect(res.ISSUEDATE).toStrictEqual(dayjs('2022/11/29 09:33').format('YYYY/MM/DD HH:mm'));
        expect(res.CUSTOMERID).toStrictEqual(1);

    })
}

function testModifyStateByID(id, newState) {
    test('test modify state by id', async () => {
        await internalOrderHandler.modifyStateByID(id, newState)

        let res = await internalOrderHandler.getInternalOrderByID(id);

        expect(res.IOID).toStrictEqual(1);
        expect(res.STATE).toStrictEqual(newState);


    })
}

function testAddCompletedItem(id, skuid, rfid) {
    test('test add completed item', async () => {
        let res = await internalOrderHandler.addCompletedItem(id, skuid, rfid);

        let completed_item = await dbHandler.get("SELECT IOID,SKUID, RFID FROM COMPLETED_ITEM WHERE IOID=? AND SKUID=? AND RFID=?;", [id, skuid, rfid])
        expect(completed_item.IOID).toStrictEqual(id);
        expect(completed_item.SKUID).toStrictEqual(skuid);
        expect(completed_item.RFID).toStrictEqual(rfid);
    })




}


async function recreateDB() {
    await dbHandler.run("DROP TABLE IF EXISTS RETURN_ITEM;")
    await dbHandler.run("DROP TABLE IF EXISTS RETURN_ORDER;")

    await dbHandler.run("DROP TABLE IF EXISTS RESTOCK_SKUITEMS;")
    await dbHandler.run("DROP TABLE IF EXISTS RESTOCK_ITEMS;")
    await dbHandler.run("DROP TABLE IF EXISTS RESTOCK_ORDERS;")

    await dbHandler.run("DROP TABLE IF EXISTS COMPLETED_ITEM;")
    await dbHandler.run("DROP TABLE IF EXISTS ISSUED_ITEM;")
    await dbHandler.run("DROP TABLE IF EXISTS INTERNAL_ORDERS;")

    await dbHandler.run("DROP TABLE IF EXISTS SKUITEM;")
    await dbHandler.run("DROP TABLE IF EXISTS SKU;")

    await dbHandler.run("DROP TABLE IF EXISTS POSITION;")

    await dbHandler.run("DROP TABLE IF EXISTS TESTRESULT;")
    await dbHandler.run("DROP TABLE IF EXISTS TESTDESCRIPTOR;")
    await dbHandler.run("DROP TABLE IF EXISTS USERS;")
    await dbHandler.run("DROP TABLE IF EXISTS ITEMS;")


    await returnOrderHandler.newTableReturnOrd();
    await returnOrderHandler.newTableReturnSkuItem();
    await restockHandler.newTableROSKUItems();
    await restockHandler.newTableROProducts();
    await restockHandler.newTableRestockOrders();

    await internalOrderHandler.newTableCompletedItems();
    await internalOrderHandler.newTableIssuedItems();
    await internalOrderHandler.newTableInternalOrders();

    await SKUItemHandler.createTableSKUITEM();
    await SKUHandler.createTableSKU();

    await positionHandler.newTablePositions();
    
    await testResultHandler.createTableTESTRESULT();
    await testDescriptorHandler.createTableTESTDESCRIPTOR();

    await userHandler.newTableUsers();
    await itemHandler.createTableItem(); 
}


async function populateDB() {

    await dbHandler.run("INSERT INTO USERS (ID,USERNAME,NAME,SURNAME,PASSWORD,TYPE) VALUES (1,'user1@ezwh.com','customer','test','testpassword','Customer')");
    await dbHandler.run("INSERT INTO USERS (ID,USERNAME,NAME,SURNAME,PASSWORD,TYPE) VALUES (2,'dd','supplier','supplr','testpassword','Supplier');");
    await dbHandler.run("INSERT INTO SKU (ID,DESCRIPTION,WEIGHT,VOLUME,NOTES,POSITION,AVAILABLEQUANTITY,PRICE) VALUES (1,'an edited new sku',100.0,50.0,'first SKU',NULL,50,10.99)")
    await dbHandler.run("INSERT INTO SKU (ID,DESCRIPTION,WEIGHT,VOLUME,NOTES,POSITION,AVAILABLEQUANTITY,PRICE) VALUES (2,'another new sku',100.0,50.0,'second SKU',NULL,20,69.99)")
    await dbHandler.run("INSERT INTO SKU (ID,DESCRIPTION,WEIGHT,VOLUME,NOTES,POSITION,AVAILABLEQUANTITY,PRICE) VALUES (3,'a new new sku',100.0,50.0,'third SKU',NULL,30,10.99)")
    await dbHandler.run("INSERT INTO SKU (ID,DESCRIPTION,WEIGHT,VOLUME,NOTES,POSITION,AVAILABLEQUANTITY,PRICE) VALUES (4,'a fourth new sku',100.0,32.0,'fourth SKU',NULL,10,52.99)")
    await dbHandler.run("INSERT INTO SKU (ID,DESCRIPTION,WEIGHT,VOLUME,NOTES,POSITION,AVAILABLEQUANTITY,PRICE) VALUES (5,'a fifth new sku',100.0,32.0,'fifth SKU',NULL,10,52.99)")
    await dbHandler.run("INSERT INTO SKU (ID,DESCRIPTION,WEIGHT,VOLUME,NOTES,POSITION,AVAILABLEQUANTITY,PRICE) VALUES (6,'a fifth new sku',100.0,32.0,'fifth SKU',NULL,10,52.99)")
    await dbHandler.run("INSERT INTO SKU (ID,DESCRIPTION,WEIGHT,VOLUME,NOTES,POSITION,AVAILABLEQUANTITY,PRICE) VALUES (7,'a fifth new sku',100.0,32.0,'fifth SKU',NULL,10,52.99)")
    await dbHandler.run("INSERT INTO SKU (ID,DESCRIPTION,WEIGHT,VOLUME,NOTES,POSITION,AVAILABLEQUANTITY,PRICE) VALUES (8,'a product',NULL,NULL,NULL,NULL,NULL,10.99)")
    await dbHandler.run("INSERT INTO SKU (ID,DESCRIPTION,WEIGHT,VOLUME,NOTES,POSITION,AVAILABLEQUANTITY,PRICE) VALUES (9,'another product',NULL,NULL,NULL,NULL,NULL,11.99);")
    await dbHandler.run("INSERT INTO SKUITEM (RFID,SKUID,AVAILABLE,DATEOFSTOCK) VALUES ('12345678901234567890123456789015',1,1,'2021/11/29 12:30')")
    await dbHandler.run("INSERT INTO SKUITEM (RFID,SKUID,AVAILABLE,DATEOFSTOCK) VALUES ('1234567890123456789012345678876555',2,1,'2021/11/29 12:30')")
    await dbHandler.run("INSERT INTO SKUITEM (RFID,SKUID,AVAILABLE,DATEOFSTOCK) VALUES ('12345678901234567890123456789016',8,NULL,NULL)")
    await dbHandler.run("INSERT INTO SKUITEM (RFID,SKUID,AVAILABLE,DATEOFSTOCK) VALUES ('12345678901234567890123456789038',9,NULL,NULL);")
    await dbHandler.run("INSERT INTO RESTOCK_ORDERS (ROID,ISSUEDATE,STATE,SUPPLIERID,TN_DATE) VALUES (1,'2022/11/12 12:00','ISSUED',1,NULL)")
    await dbHandler.run("INSERT INTO RESTOCK_ORDERS (ROID,ISSUEDATE,STATE,SUPPLIERID,TN_DATE) VALUES (2,'2022/11/12 12:00','ISSUED',1,NULL);")



}
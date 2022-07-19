const RestockOrderService = require('../services/restockOrderService');
const DBHandler = require('../modules/DBHandler');
const restockOrdDAO = require('../modules/restockOrdDAO');
const ItemDAO = require('../modules/itemDAO');
const SKUDAO = require('../modules/SKUDAO');
const SKUItemDAO = require('../modules/SKUItemDAO');
const testDescriptorDAO = require('../modules/testDescriptionDAO');
const testResultDAO = require('../modules/testResultDAO');
const userDAO = require('../modules/userDAO');

const dbHandler = new DBHandler('EzWhDBanotherServTest.db');
const restockHandler = new restockOrdDAO(dbHandler);
const itemHandler = new ItemDAO(dbHandler);
const SKUHandler = new SKUDAO(dbHandler);
const SKUItemHandler = new SKUItemDAO(dbHandler);
const testDescriptorHandler = new testDescriptorDAO(dbHandler);
const testResultHandler = new testResultDAO(dbHandler);
const userHandler = new userDAO(dbHandler);

const restockService = new RestockOrderService(restockHandler, SKUHandler, SKUItemHandler, testResultHandler, itemHandler);

describe('Test Restock Orders Service', () => {
    jest.setTimeout(30000);
    beforeAll(async () => {
        // drop and re-create all useful tables (hard-code some data)
        try {
        await recreateDBforRestockOrders();
        await populateDBforRestockOrders();
        } catch (error) {
            console.log(error)
        }
    });
    describe('Get orders', () => {
        testGetAll();
        testGetIssued();
        testGetByID(); // Test order with ID = 5
        testGetReturnItems() // Test order with ID = 5
    });

    describe('New order / Delete order', () => {
        testNewOrder('2019/01/31 12:12', [
            { SKUId: 1, itemId: 1, description: 'item 1', price: 5.95, qty: 10 },
            { SKUId: 2, itemId: 2, description: 'item 2', price: 5.96, qty: 5 },
            { SKUId: 3, itemId: 3, description: 'item 3', price: 5.97, qty: 3 }],
            1);
    });

    describe('Modify orders', () => {
        testAddTransportNote(3, '2014/04/12', true);
        testAddTransportNote(1, '2014/01/11', false);

        testModifyState(4, 'DELIVERY');
        testAddSKUItems(2, [{ SKUId: 1, itemId: 1, rfid: '71830963309524474178686449687806' },
        { SKUId: 1, itemId: 2, rfid: '36624602441505861666757273091100' }]);
    });
});

async function recreateDBforRestockOrders() {

    await itemHandler.dropTable();
    await itemHandler.createTableItem();

    await restockHandler.dropTableRstckOrders();
    await restockHandler.dropTableROProducts();
    await restockHandler.dropTableROSKUItems();
    await restockHandler.newTableRestockOrders();
    await restockHandler.newTableROProducts();
    await restockHandler.newTableROSKUItems();

    await SKUHandler.dropTableSKU();
    await SKUHandler.createTableSKU();

    await SKUItemHandler.dropTableSKUITEM();
    await SKUItemHandler.createTableSKUITEM();

    await testDescriptorHandler.dropTableTESTDESCRIPTOR();
    await testDescriptorHandler.createTableTESTDESCRIPTOR();

    await testResultHandler.dropTableTESTRESULT();
    await testResultHandler.createTableTESTRESULT();

    await userHandler.dropTableUser();
    await userHandler.newTableUsers();
}

async function populateDBforRestockOrders() {
    //id,description,price,SKUId,supplierId
    const itemPK1 = (await itemHandler.createNewItem(1, 'item 1', 5.95, 1, 1)).id;
    const itemPK2 = (await itemHandler.createNewItem(2, 'item 2', 5.96, 2, 1)).id;
    const itemPK3 = (await itemHandler.createNewItem(3, 'item 3', 5.97, 3, 1)).id;

    const SKUID1 = (await SKUHandler.addSKU('sku 1', 5, 10, 'note1', 6.1, 10)).id;
    const SKUID2 = (await SKUHandler.addSKU('sku 2', 5, 10, 'note1', 6.2, 10)).id;
    const SKUID3 = (await SKUHandler.addSKU('sku 3', 5, 10, 'note1', 6.3, 10)).id;


    const userID = (await userHandler.newUser('supplier1', 'Omar', 'Ormachea', 'password', 'supplier')).id;

    const testDescrID1 = (await testDescriptorHandler.addTESTDESCRIPTOR('test 1', 'procedure 1', SKUID1)).id;
    const testDescrID2 = (await testDescriptorHandler.addTESTDESCRIPTOR('test 2', 'procedure 2', SKUID1)).id;

    const rfid1 = '51837156615693130190109878678843';
    const rfid2 = '42301732530180561219375341537609';
    const rfid3 = '47072248861977435546561070598869';
    const rfid4 = '71830963309524474178686449687806';
    const rfid5 = '36624602441505861666757273091100';

    await SKUItemHandler.addSKUITEM(rfid1, SKUID1, null);
    await SKUItemHandler.addSKUITEM(rfid2, SKUID1, null);
    await SKUItemHandler.addSKUITEM(rfid3, SKUID1, null);
    await SKUItemHandler.addSKUITEM(rfid4, SKUID1, null);
    await SKUItemHandler.addSKUITEM(rfid5, SKUID1, null);

    const roID1 = (await restockHandler.addRestockOrder('2022/03/14 18:00', 1)).id;
    await restockHandler.addROProduct(roID1, itemPK1, 5);
    await restockHandler.addROProduct(roID1, itemPK2, 5);
    await restockHandler.addROProduct(roID1, itemPK3, 3);

    const roID2 = (await restockHandler.addRestockOrder('2022/03/14 16:32', 1)).id;
    await dbHandler.run("UPDATE RESTOCK_ORDERS SET STATE='DELIVERED' WHERE ROID=?", [roID2]);
    await restockHandler.addROProduct(roID2, itemPK1, 3);
    await restockHandler.addROProduct(roID2, itemPK2, 5);
    await restockHandler.addROProduct(roID2, itemPK3, 3);

    const roID3 = (await restockHandler.addRestockOrder('2014/03/14 12:00', 1)).id;
    await dbHandler.run("UPDATE RESTOCK_ORDERS SET STATE='DELIVERY' WHERE ROID=?", [roID3]);
    await restockHandler.addROProduct(roID3, itemPK1, 3);
    await restockHandler.addROProduct(roID3, itemPK2, 5);
    await restockHandler.addROProduct(roID3, itemPK3, 3);

    const roID4 = (await restockHandler.addRestockOrder('2022/03/14 09:45', 1)).id;
    await restockHandler.addROProduct(roID4, itemPK1, 3);
    await restockHandler.addROProduct(roID4, itemPK2, 5);
    await restockHandler.addROProduct(roID4, itemPK3, 3);

    const roID5 = (await restockHandler.addRestockOrder('2016/04/21 12:00', 1)).id;
    await dbHandler.run("UPDATE RESTOCK_ORDERS SET STATE='COMPLETEDRETURN' WHERE ROID=?", [roID5]);
    await dbHandler.run("UPDATE RESTOCK_ORDERS SET TN_DATE='2019/05/10' WHERE ROID=?", [roID5]);
    await restockHandler.addROProduct(roID5, itemPK1, 3);
    await restockHandler.addROSKUItem(roID5, rfid1, 1, 1);
    await restockHandler.addROSKUItem(roID5, rfid2, 1, 1);
    await restockHandler.addROSKUItem(roID5, rfid3, 1, 1);

    await testResultHandler.addTESTRESULT(rfid1, testDescrID1, '2022/12/03', true);
    await testResultHandler.addTESTRESULT(rfid1, testDescrID2, '2022/12/03', false);
    await testResultHandler.addTESTRESULT(rfid2, testDescrID1, '2022/12/03', true);
}

function testGetAll() {
    test('All orders', async () => {
        const orders = await restockService.getAll();
        expect(orders.length).toStrictEqual(5);
        for (let order of orders) {
            expect(order.id).toBeTruthy();
            expect(order.issueDate).toBeDefined();
            expect(order.state).toBeDefined();
            expect(order.products.length).toBeGreaterThan(0);
            expect(order.supplierId).toBeTruthy();
            expect(order.transportNote).toBeDefined();
            expect(order.skuItems.length).toBeGreaterThanOrEqual(0);
        }
    });
}

function testGetIssued() {
    test('ISSUED orders', async () => {
        const orders = await restockService.getIssued();
        expect(orders.length).toStrictEqual(2);
        for (let order of orders) {
            expect(order.id).toBeTruthy();
            expect(order.issueDate).toBeDefined();
            expect(order.state).toStrictEqual('ISSUED');
            expect(order.products.length).toBeGreaterThan(0);
            expect(order.supplierId).toBeTruthy();
            expect(order.transportNote).toBeDefined();
            expect(order.skuItems.length).toBeGreaterThanOrEqual(0);
        }
    });
}

function testGetByID() {
    test('by ID', async () => {
        const order = await restockService.findOrder(5);
        const referenceObj = {
            id: 5,
            issueDate: '2016/04/21 12:00',
            state: 'COMPLETEDRETURN',
            products: [{ SKUId: 1, itemId: 1, description: 'item 1', price: 5.95, qty: 3}],
            supplierId: 1,
            transportNote: { deliveryDate: '2019/05/10' },
            skuItems: [{ SKUId: 1, itemId: 1, rfid: '51837156615693130190109878678843' },
            { SKUId: 1, itemId: 1, rfid: '42301732530180561219375341537609' },
            { SKUId: 1, itemId: 1, rfid: '47072248861977435546561070598869' }]
        };
        expect(order).toStrictEqual(referenceObj);
    });
}

function testGetReturnItems() {
    test('get Return Items', async () => {
        const skuitems = await restockService.findFailedSKU(5);
        const referenceObj = [{ SKUId: 1, itemId: 1, rfid: '51837156615693130190109878678843' }];
        expect(skuitems).toStrictEqual(referenceObj);
    });
}

function testNewOrder(issuedate, products, supplierid) {
    test('create and delete new order', async () => {
        const lastID = await restockService.addOrder(issuedate, products, supplierid);
        const referenceObj = {
            id: lastID,
            issueDate: issuedate,
            state: 'ISSUED',
            products: products,
            supplierId: supplierid,
            transportNote: {},
            skuItems: []
        };
        order = await restockService.findOrder(lastID);
        expect(order).toStrictEqual(referenceObj);
        // await restockService.deleteOrder(lastID);
    });
}

function testAddTransportNote(ID, deliverydate, expectedValid) {
    test('Add transport note', async () => {
        let order = await restockService.findOrderFromTable(ID);
        await restockService.addTransportNote(ID, order.issuedate, deliverydate);
        order = await restockService.findOrderFromTable(ID);
        // console.log('delivery date: ' + deliverydate);
        // console.log('issuedate: ' + order.issuedate);
        if (expectedValid === true) {
            expect(order.tn_date).toStrictEqual(deliverydate);
        }
        else {
            expect(order.tn_date).toStrictEqual(null);
        }
        // await dbHandler.run('UPDATE RESTOCK_ORDERS SET TN_DATE=NULL WHERE ROID=?', [ID]);
    });
}

function testModifyState(ID, newState) {
    test('Modify state', async () => {
        let order = await restockService.findOrderFromTable(ID);
        const previousState = order.state;
        await restockService.setState(ID, newState);
        order = await restockService.findOrderFromTable(ID);
        expect(order.state).toStrictEqual(newState);
        // await dbHandler.run("UPDATE RESTOCK_ORDERS SET STATE=? WHERE ROID=?", [previousState, ID]);
    });
}

function testAddSKUItems(ID, skuitems) {
    test('Add SKU Items', async () => {
        await restockService.addSKUItems(ID, skuitems);
        const order = await restockService.findOrder(ID);
        expect(order.skuItems).toStrictEqual(skuitems);
    });
}
const DBHandler = require('../modules/DBHandler');
const dbHandler = new DBHandler('EzWhDBtestagain.db');
const restockOrderDAO = require('../modules/restockOrdDAO');
const restockHandler = new restockOrderDAO(dbHandler);

describe('Test RestockDAO --- RESTOCK_ORDERS', () => {
    beforeAll(async () => {
        await restockHandler.dropTableRstckOrders();
        await restockHandler.dropTableROProducts();
        await restockHandler.dropTableROSKUItems();
        await restockHandler.newTableRestockOrders();
        await restockHandler.newTableROProducts();
        await restockHandler.newTableROSKUItems();
    });

    testNewRestockOrder('2012/04/13 13:20', 1);
    testNewRestockOrder('2020/04/20 16:20', 2);
    // testNewRestockOrder('2014/01/12 16:25', 3);

    testModifyState(2, 'DELIVERY');

    testAddTNote(2, '2022/10/21');

    testNewROProduct(2, 4,  3);

    testNewROProduct(1, 7, 52);

    testNewROSKUItem(2, '1546581358', 2);

    testNewROSKUItem(2, '987654321', 3);

    test('Get ISSUED orders', async () => {
        const orders = await restockHandler.getIssuedOrders();
        expect(orders).toBeDefined();
        for (let order of orders) {
            expect(order.state).toStrictEqual('ISSUED');
        }
    });

    test('Get SKUItems and Items by ROID', async () => {
        const order = await restockHandler.getOrderByID(2);
        const skuitems = await restockHandler.getSKUItems(order.ROID);
        const items = await restockHandler.getProducts(order.ROID, order.supplierid);
        expect(skuitems).toBeDefined();
        expect(items).toBeDefined();
        for (let skuitem of skuitems) {
            expect(skuitem.ROID).toStrictEqual(order.ROID);
        }
        for (let item of items) {
            expect(item.ROID).toStrictEqual(order.ROID);
        }
    });

    test('Delete RESTOCK_SKUITEMS entries', async () => {
        const orders = await restockHandler.getAllOrders();
        for (let order of orders) {
            await restockHandler.deleteRestockSKUItems(order.ROID);
        }
        const result = await dbHandler.all('SELECT * FROM RESTOCK_SKUITEMS');
        expect(result.length).toStrictEqual(0);
    });

    test('Delete RESTOCK_PRODUCTS entries', async () => {
        const orders = await restockHandler.getAllOrders();
        for (let order of orders) {
            await restockHandler.deleteRestockProducts(order.ROID);
        }
        const result = await dbHandler.all('SELECT * FROM RESTOCK_PRODUCTS');
        expect(result.length).toStrictEqual(0);
    });

    test('Delete RESTOCK_ORDERS entries', async () => {
        const orders = await restockHandler.getAllOrders();
        for (let order of orders) {
            await restockHandler.deleteOrder(order.ROID);
        }
        const result = await dbHandler.all('SELECT * FROM RESTOCK_ORDERS');
        expect(result.length).toStrictEqual(0);
    });
});


function testDeleteTable(tableName) { // Define explicitly on each test suite, this doesn't work (idk why)
    test('Delete all entries', async () => {
        await dbHandler.run('DELETE FROM ?', [tableName]);
        let result = await dbHandler.all('SELECT * FROM ?', [tableName]);
        expect(result.length).toStrictEqual(0);
    });
}

function testNewRestockOrder(issuedate, supplierid) {
    test('Add new restock order', async () => {
        let lastID = await restockHandler.addRestockOrder(issuedate, supplierid);
        expect(lastID.id).toBeTruthy();

        let res = await restockHandler.getOrderByID(lastID.id);
        expect(res.ROID).toStrictEqual(lastID.id);
        expect(res.issuedate).toStrictEqual(issuedate);
        expect(res.supplierid).toStrictEqual(supplierid);
    });
}

function testModifyState(ID, state) {
    test('Change state of order', async () => {
        await restockHandler.modifyStateByID(ID, state);
        let res = await restockHandler.getOrderByID(ID);
        expect(res.state).toStrictEqual(state);
    });
}

function testAddTNote(ID, date) {
    test('Add transport note', async () => {
        await restockHandler.addTransportNote(ID, date);
        let res = await restockHandler.getOrderByID(ID);
        expect(res.tn_date).toStrictEqual(date);
    })
}

function testNewROProduct(ID, itemidPK, qty) {
    test('Add ROProduct', async () => {
        let lastID = await restockHandler.addROProduct(ID, itemidPK, qty);
        expect(lastID.id).toBeTruthy;
        let res = await dbHandler.get("SELECT * FROM RESTOCK_PRODUCTS WHERE ROID=? AND itemid_pk=? AND quantity=?",
        [ID, itemidPK, qty]);
        expect(res.ROID).toStrictEqual(ID);
        expect(res.itemid_pk).toStrictEqual(itemidPK);
        expect(res.quantity).toStrictEqual(qty);
    });
}

function testNewROSKUItem(ID, RFID, skuID) {
    test('Add ROSKUItem', async () => {
        let lastID = await restockHandler.addROSKUItem(ID, RFID, skuID);
        expect(lastID.id).toBeTruthy;
        let res = await dbHandler.get("SELECT * FROM RESTOCK_SKUITEMS WHERE ROID=? AND RFID=?",
        [ID, RFID]);
        expect(res.ROID).toStrictEqual(ID);
        expect(res.RFID).toStrictEqual(RFID);
    });
}
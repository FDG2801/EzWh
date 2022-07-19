'use strict';

const DBHandler = require('./modules/DBHandler');
const SKUDAO = require('./modules/SKUDAO');
const SKUItemDAO = require('./modules/SKUItemDAO');
const positionDAO = require('./modules/positionDAO');
const testDescriptorDAO = require('./modules/testDescriptionDAO');
const testResultDAO=require('./modules/testResultDAO');
const UserDAO = require('./modules/userDAO');
const restockDAO = require('./modules/restockOrdDAO');
const returOrdDAO = require('./modules/returnOrdDAO');
const internalOrdDAO = require('./modules/internalOrdDAO');
const itemDAO = require('./modules/itemDAO');

const dbHandler = new DBHandler('EzWhDB.db');
const SKUHandler = new SKUDAO(dbHandler);
const SKUItemHandler = new SKUItemDAO(dbHandler);
const positionHandler = new positionDAO(dbHandler);
const testDescriptorHandler = new testDescriptorDAO(dbHandler);
const testResultHandler = new testResultDAO(dbHandler);
const userHandler = new UserDAO(dbHandler);
const restockHandler = new restockDAO(dbHandler);
const returnHandler = new returOrdDAO(dbHandler);
const internalOrderHandler = new internalOrdDAO(dbHandler);
const itemHandler = new itemDAO(dbHandler);

const restockOrders = [
    {issuedate: '2012-04-13 13:20', supplierid: 1},
    {issuedate: '2020-04-20 16:20', supplierid: 2},
    {issuedate: '2014-01-12 16:25', supplierid: 3},
    {issuedate: '2016-04-21 12:00', supplierid: 1},
    {issuedate: '2019-10-30 12:45', supplierid: 2}
];
const restockItems = [
    {roid: 1, itemid: 1, qty: 2},
    {roid: 1, itemid: 2, qty: 3},
    {roid: 2, itemid: 3, qty: 2},
    {roid: 2, itemid: 4, qty: 3},
    {roid: 2, itemid: 5, qty: 4},
    {roid: 2, itemid: 6, qty: 5},
    {roid: 3, itemid: 7, qty: 3},
    {roid: 4, itemid: 1, qty: 2},
    {roid: 4, itemid: 2, qty: 3},
    {roid: 5, itemid: 4, qty: 3}
]
const restockSKUItems = [
    {roid: 4, rfid: 123},
    {roid: 4, rfid: 234},
    {roid: 4, rfid: 345},
    {roid: 4, rfid: 456},
    {roid: 4, rfid: 567},
    {roid: 5, rfid: 135},
    {roid: 5, rfid: 246},
    {roid: 5, rfid: 357},
];

// for restock orders DAO
const createRestockTables = async () => {
    await restockHandler.newTableRestockOrders();
    await restockHandler.newTableROItems();
    await restockHandler.newTableROSKUItems();
}

const populateRestock = async (restockOrders, restockItems, restockSKUItems) => {
    for (let order of restockOrders) {
        await restockHandler.addRestockOrder(order.issuedate, order.supplierid);
    }
    for (let roItem of restockItems) {
        await restockHandler.addROItem(roItem.roid, roItem.itemid, roItem.qty);
    }
    for (let roSKUItem of restockSKUItems) {
        await restockHandler.addSKUItem(roSKUItem.roid, roSKUItem.rfid);
    }
}

const main = async () => {
    await createRestockTables();
    await populateRestock(restockOrders, restockItems, restockSKUItems);

    await restockHandler.addTransportNote(2, '2022-10-21');
    await restockHandler.addTransportNote(5, '2019-05-10');
    await restockHandler.modifyStateByID(5, 'COMPLETEDRETURN');

    await testDescriptorHandler.createTableTESTDESCRIPTOR();
    await testDescriptorHandler.addTESTDESCRIPTOR('speed test', 'vroomvroom', 1);
    await testDescriptorHandler.addTESTDESCRIPTOR('range test', 'woosh', 1);
    await testDescriptorHandler.addTESTDESCRIPTOR('covid test', 'positivo', 1);

    await testResultHandler.createTableTESTRESULT();
    await testResultHandler.addTESTRESULT(135, 1, '2021-01-14', 1);
    await testResultHandler.addTESTRESULT(135, 2, '2020-02-26', 0);
    await testResultHandler.addTESTRESULT(357, 3, '2022-07-16', 1);

    await itemHandler.createTableItem();
    await itemHandler.createNewItem(1, 'item 1', 6.1, 1, 1);
    await itemHandler.createNewItem(2, 'item 2', 6.2, 1, 1);
    await itemHandler.createNewItem(3, 'item 3', 6.3, 1, 1);
    await itemHandler.createNewItem(4, 'item 4', 6.4, 1, 2);
    await itemHandler.createNewItem(5, 'item 5', 6.5, 1, 1);
    await itemHandler.createNewItem(6, 'item 6', 6.6, 1, 1);
    await itemHandler.createNewItem(7, 'item 7', 6.7, 1, 1);
    await itemHandler.createNewItem(8, 'a product', 10.99, 12, 1);
    await itemHandler.createNewItem(9, 'another product', 11.99, 180, 1);

    await SKUItemHandler.createTableSKUITEM();
    await SKUItemHandler.addSKUITEM(123, 1, '2021-04-23');
    await SKUItemHandler.addSKUITEM(234, 1, '2021-04-23');
    await SKUItemHandler.addSKUITEM(345, 1, '2021-04-23');
    await SKUItemHandler.addSKUITEM(456, 1, '2021-04-23');
    await SKUItemHandler.addSKUITEM(567, 1, '2021-04-23');
    await SKUItemHandler.addSKUITEM(135, 1, '2021-04-23');
    await SKUItemHandler.addSKUITEM(246, 1, '2021-04-23');
    await SKUItemHandler.addSKUITEM(357, 1, '2021-04-23');
    await SKUItemHandler.addSKUITEM('12345678901234567890123456789016', 1, '2020-05-12');
    await SKUItemHandler.addSKUITEM('12345678901234567890123456789017', 1, '2020-05-12');
}

main();



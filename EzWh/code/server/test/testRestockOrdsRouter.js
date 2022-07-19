const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

const DBHandler = require('../modules/DBHandler');
const dbHandler = new DBHandler('EzWhDB.db');

const restockOrdDAO = require('../modules/restockOrdDAO');
const ItemDAO = require('../modules/itemDAO');
const SKUDAO = require('../modules/SKUDAO');
const SKUItemDAO = require('../modules/SKUItemDAO');
const testDescriptorDAO = require('../modules/testDescriptionDAO');
const testResultDAO = require('../modules/testResultDAO');
const userDAO = require('../modules/userDAO');

const restockHandler = new restockOrdDAO(dbHandler);
const itemHandler = new ItemDAO(dbHandler);
const SKUHandler = new SKUDAO(dbHandler);
const SKUItemHandler = new SKUItemDAO(dbHandler);
const testDescriptorHandler = new testDescriptorDAO(dbHandler);
const testResultHandler = new testResultDAO(dbHandler);
const userHandler = new userDAO(dbHandler);

describe('Test RESTOCK ORDERS APIs', () => {
    before(async () => {
        await recreateDBforRestockOrders();
        await populateDBforRestockOrders();
    });
    // after(async () => {
    //     await recreateDBforRestockOrders();
    // });

    describe('POST / GET Restock order by ID', () => {
        testGetPostRestockOrder(201, 200, '2021/11/29 09:33',
        [
            { SKUId: 1, itemId: 1, description: 'item 1', price: 5.95, qty: 10 },
            { SKUId: 2, itemId: 2, description: 'item 2', price: 5.96, qty: 5 },
            { SKUId: 3, itemId: 3, description: 'item 3', price: 5.97, qty: 3 }
        ],
            1);
        testGetPostRestockOrder(422, undefined, '2021/10/15', []);
    });
    
    describe('GET items to return', () => {
        testGetReturnItems(422, 4, true);
        testGetReturnItems(200, 5, false);
    });
    
    describe('PUT', async () => {
        testAddTransportNote(422, 1, {transportNote: {deliveryDate: "2021/12/29"}}); // will fail because of state
        testAddTransportNote(404, 10, {transportNote: {deliveryDate: "2021/12/29"}}); // will not find order id
        testAddTransportNote(422, 3, {transportNote: {deliveryDate: "2010/12/29"}}); // will find the delivery date incompatible with issue date
        testAddTransportNote(422, 3, {transportNote: {deliveryDate: "2020-05-20"}}); // will find the date format wrong (YYYY-MM-DD)
        testAddTransportNote(200, 3, {transportNote: {deliveryDate: "2020/05/20"}}); // will work
        
        testAddSKUItemsByID(200, 2, {skuItems: [{SKUId: 1, itemId: 1, rfid: "51837156615693130190109878678843"}, 
            {SKUId: 1, itemId: 2, rfid: "42301732530180561219375341537609"}]});
        testAddSKUItemsByID(200, 2, {skuItems: [{SKUId: 1, itemId: 3, rfid: "47072248861977435546561070598869"}]});
        testAddSKUItemsByID(422, 1, {skuItems: [{SKUid: 1, itemId: 1, rfid: '47072248861977435546561070598869'}]});
        testAddSKUItemsByID(404, 10, {skuItems: [{SKUid: 1, itemId: 2, rfid: '47072248861977435546561070598869'}]});
    
        // await dbHandler.run("DELETE FROM RESTOCK_SKUITEMS WHERE ROID=2"); // delete the sku items when finished
    
    });
})

async function recreateDBforRestockOrders() {
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

    await itemHandler.dropTable();
    await itemHandler.createTableItem();

    await testDescriptorHandler.dropTableTESTDESCRIPTOR();
    await testDescriptorHandler.createTableTESTDESCRIPTOR();

    await testResultHandler.dropTableTESTRESULT();
    await testResultHandler.createTableTESTRESULT();

    await userHandler.dropTableUser();
    await userHandler.newTableUsers();
}

async function populateDBforRestockOrders() {
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

function testGetPostRestockOrder(expectedStatus1, expectedStatus2, issueDateTime, products, supplierId) {
    it('tries to create a new restock order and retrieve it', function (done) {
        if (issueDateTime !== undefined && products !== undefined && products.length !== 0 && supplierId !== undefined) {
            agent.post(`/api/restockOrder/`)
                .send({
                    issueDate: issueDateTime,
                    products: products,
                    supplierId: supplierId
                })
                .then(function (res) {
                    console.log(res.body);
                    res.should.have.status(expectedStatus1);
                    const lastID = res.body.lastID;
                    agent.get(`/api/restockOrders/${lastID}`)
                        .then(async function (r) {
                            // console.log(res.body);
                            r.should.have.status(expectedStatus2);
                            r.body.issueDate.should.equal(issueDateTime);
                            r.body.state.should.equal('ISSUED'); // 'equal' for value equality (===)
                            r.body.products.should.eql(products); // 'eql' for object equality
                            r.body.supplierId.should.equal(supplierId);
                            r.body.transportNote.should.eql({});
                            r.body.skuItems.should.be.empty;
                            // await dbHandler.run("DELETE FROM RESTOCK_ORDERS WHERE ROID=?", [lastID]);
                            // await dbHandler.run("DELETE FROM RESTOCK_ITEMS WHERE ROID=?", [lastID]);
                            done();
                        }).catch(done);
                }).catch(done);
        }
        else {
            agent.post(`/api/restockOrder/`)
                .then(function (res) {
                    res.should.have.status(expectedStatus1);
                    done();
                }).catch(done);
        }
    });
}

function testGetReturnItems(expectedStatus, orderID, emptyListBoolean) {
    it('tries to get list of items to return to the supplier', function (done) {
        agent.get(`/api/restockOrders/${orderID}/returnItems`)
            .then(function (res) {
                // console.log(res.body);
                res.should.have.status(expectedStatus);
                if (res.status === 422 || res.status === 404) {
                    done();
                }
                else {
                    if (emptyListBoolean) res.body.should.be.empty;
                    else res.body.should.be.an('array').that.is.not.empty;
                    done();
                }
            }).catch(done);
    });
}

function testAddSKUItemsByID(expectedStatus, orderID, skuItems) {
    it('tries to add SKU items to a restock order', function (done) {
        agent.put(`/api/restockOrder/${orderID}/skuItems`)
            .send(skuItems) 
            .then(function (res) {
                // console.log(res.body);
                res.should.have.status(expectedStatus);
                if (res.status === 422 || res.status === 404) {
                    done();
                }
                else {
                    agent.get(`/api/restockOrders/${orderID}`)
                        .then(async function (res) {
                            for (let skuitem of skuItems.skuItems) {
                                res.body.skuItems.should.deep.include(skuitem); // deep.include only way this works
                            }
                            // await dbHandler.run("DELETE FROM RESTOCK_SKUITEMS WHERE ROID=2"); // delete the sku items when finished
                            done();
                        }).catch(done);
                }
            }
        ).catch(done);
    });
}

function testAddTransportNote(expectedStatus, orderID, transportNote) {
    it('tries to add transport note and retreives to check', function (done) {
        agent.put(`/api/restockOrder/${orderID}/transportNote`)
            .send(transportNote)
            .then(function (res) {
                // console.log(res.body);
                res.should.have.status(expectedStatus);
                if (res.status === 422 || res.status === 404) {
                    // console.log(res.body);
                    done();
                }
                else {
                    agent.get(`/api/restockOrders/${orderID}`)
                        .then(async function (res) {
                            res.body.transportNote.should.eql(transportNote.transportNote);

                            // comment this line to see the note after the test on the db.
                            // await dbHandler.run("UPDATE RESTOCK_ORDERS SET TN_DATE=NULL WHERE ROID=?", orderID);
                            done();
                        }).catch(done);
                }
            }
        ).catch(done);
    });
}
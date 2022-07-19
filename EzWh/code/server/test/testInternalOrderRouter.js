 const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
chai.expect();



const DBHandler = require('../modules/DBHandler');
const dbHandler = new DBHandler('EzWhDB.db');


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



const app = require('../server.js');
var agent = chai.request.agent(app);


describe('test get internal order by id', () => {
    before(async () => {
        await recreateDB();
        await populateDB();
        let rowID = await dbHandler.run("INSERT INTO INTERNAL_ORDERS(ISSUEDATE, STATE, CUSTOMERID) VALUES ('2021/11/29 09:33', 'ISSUED', 1);");
        await dbHandler.run("INSERT INTO ISSUED_ITEM (IOID, SKUID, QUANTITY) VALUES (?, 1, 20);", [rowID.id]);

    })



    after(async () => {
        await recreateDB();
    });



    testGetInternalOrderByID(422, undefined)
    testGetInternalOrderByID(200, 1)
    testModifyOrderState(200, 1, { "newState": "ISSUED" })
    testModifyOrderState(200, 1,
        {
            "newState": "COMPLETED",
            "products": [{ "SkuID": 1, "RFID": "12345678901234567890123456789016" }, { "SkuID": 1, "RFID": "12345678901234567890123456789038" }]
        }
    )
    /*     testModifyOrderState(404, null,
            {
                "newState": "COMPLETED",
                "products": [{ "SkuID": 1, "RFID": "12345678901234567890123456789016" }, { "SkuID": 1, "RFID": "12345678901234567890123456789038" }]
            }) */
})


function testGetInternalOrderByID(expectedStatus, id) {
    it('gets an internal order knowing the id', function (done) {
        if (id !== undefined) {
            agent.get(`/api/internalOrders/${id}`)
                .then(function (res) {
                    res.should.have.status(expectedStatus);
                    done();
                }).catch(done)
        } else {
            agent.get(`/api/internalOrders/${id}`)
                .then(function (res) {
                    res.should.have.status(expectedStatus);
                    done();
                }).catch(done)
        }
    })
}

function testModifyOrderState(expectedStatus, id, req) {
    it('modify an order state knowing the id', function (done) {

        if (id !== undefined) {
            agent.put(`/api/internalOrders/${id}`)
                .send(req)
                .then(function (res) {
                    res.should.have.status(expectedStatus);
                    done();
                }).catch(done);
        } else {
            agent.put(`/api/internalOrders/${id}`)
                .then(function (res) {
                    res.should.have.status(expectedStatus);
                    done();
                }).catch(done);
        }

    })
}


//api testing


describe('test scenario 9-1 Internal Order IO accepted', () => {
    before(async () => {
        await recreateDB();
        await populateDB();
    })


    testAddInteranlOrder(201, '2021-11-29 09:33', [
        { SKUId: 8, description: "a product", price: '10.99', qty: 30 },
        { SKUId: 9, description: "another product", price: '11.99', qty: 20 }
    ],
        1)

    testModifyOrderState(200, 1, { "newState": "ACCEPTED" })



})


function testAddInteranlOrder(expectedStatus, issueDate, products, customerId) {
    it('add an internal order', function (done) {
        if (issueDate !== undefined && products !== undefined && products.length !== 0 && customerId !== undefined) {
            agent.post(`/api/internalOrders`)
                .send({
                    "issueDate": issueDate,
                    "products": products,
                    "customerId": customerId
                })
                .then(function (res) {
                    res.should.have.status(expectedStatus);
                    done();
                }).catch(done)

        } else {
            agent.post(`/api/internalOrders`)
                .then(function (res) {
                    res.should.have.status(expectedStatus);
                    done();
                }).catch(done)
        }

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
    await dbHandler.run("INSERT INTO RETURN_ORDER (REOID,RETURNDATE,ROID) VALUES (1,'2021/11/29 09:33',1);")
    await dbHandler.run("INSERT INTO RETURN_ITEM (REOID,RFID) VALUES (1,'12345678901234567890123456789015');")


} 
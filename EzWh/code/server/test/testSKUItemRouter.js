 const chai = require('chai');
 const chaiHttp = require('chai-http');
 chai.use(chaiHttp);
 chai.should();
 chai.expect();

 const app = require('../server');
 var agent = chai.request.agent(app);

const DBHandler = require('../modules/DBHandler');
const dbHandler = new DBHandler('EzWhDB.db');
const SKUItemDAO = require('../modules/SKUItemDAO');
const SKUItemHandler = new SKUItemDAO(dbHandler);

const SKUDAO = require('../modules/SKUDAO');
const SKUHandler = new SKUDAO(dbHandler);

const TestDescriptorDAO = require('../modules/testDescriptionDAO');
const testHandler = new TestDescriptorDAO(dbHandler);

const TestResultDAO = require('../modules/testResultDAO');
const testResultHandler = new TestResultDAO(dbHandler);


describe('test skuItem apis', () => {

    before(async()=> {
        await SKUItemHandler.dropTableSKUITEM()
        await SKUItemHandler.createTableSKUITEM()

        await SKUHandler.dropTableSKU();
        await SKUHandler.createTableSKU();

        await dbHandler.run("insert into SKU(description,weight,volume,notes,price,availableQuantity) VALUES(?,?,?,?,?,?)",['NEW SKU1',100,100,'notes1',250,40])
        await dbHandler.run("insert into SKU(description,weight,volume,notes,price,availableQuantity) VALUES(?,?,?,?,?,?)",['NEW SKU2',200,100,'notes2',300,400])
    });

      after(async()=>{
        await SKUItemHandler.dropTableSKUITEM()
        await SKUItemHandler.createTableSKUITEM()

        await SKUHandler.dropTableSKU();
        await SKUHandler.createTableSKU();
    })  

    addSKUItem(201,'12345678900085211144477788855522',1,'2021-05-12');
    addSKUItem(503,'12345678900085211144477788855522',1,'2021-05-12');
    addSKUItem(422,'123456789000852',10,'2021-05-12');
    addSKUItem(404,'12345678900085211144477788855566',50,'2021-05-12');
    addSKUItem(422);
});

function addSKUItem(expectedHTTPStatus,rfid,SKUId,dateOfStock) {
    it('adding a new SKUItme', function (done) {
        if (rfid !== undefined) {
            let skuItem = { RFID: rfid, SKUId: SKUId, DateOfStock: dateOfStock }
            agent.post(`/api/skuitem`)
                .send(skuItem)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(done);
        } else {
            agent.post(`/api/skuitem`) //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(done);
        }

    });
}
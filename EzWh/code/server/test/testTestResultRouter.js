const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
chai.expect();

const app = require('../server');
var agent = chai.request.agent(app);

const DBHandler = require('../modules/DBHandler');
const dbHandler = new DBHandler('EzWhDB.db');
const TestResultDAO = require('../modules/testResultDAO');
const testResultHandler = new TestResultDAO(dbHandler);

const SKUItemDAO = require('../modules/SKUItemDAO');
const SKUItemHandler = new SKUItemDAO(dbHandler);

const SKUDAO = require('../modules/SKUDAO');
const SKUHandler = new SKUDAO(dbHandler);

const TestDescriptorDAO = require('../modules/testDescriptionDAO');
const testHandler = new TestDescriptorDAO(dbHandler);

describe('test testResult apis', () => {

    before(async()=>{
        await testResultHandler.dropTableTESTRESULT()
        await testResultHandler.createTableTESTRESULT()

        await testHandler.dropTableTESTDESCRIPTOR()
        await testHandler.createTableTESTDESCRIPTOR()

        await SKUItemHandler.dropTableSKUITEM()
        await SKUItemHandler.createTableSKUITEM()

        await SKUHandler.dropTableSKU();
        await SKUHandler.createTableSKU();

        await dbHandler.run("insert into SKU(DESCRIPTION,WEIGHT,VOLUME,NOTES,PRICE,AVAILABLEQUANTITY) VALUES(?,?,?,?,?,?)",['NEW SKU1',100,100,'notes1',250,40])
        await dbHandler.run("insert into SKU(DESCRIPTION,WEIGHT,VOLUME,NOTES,PRICE,AVAILABLEQUANTITY) VALUES(?,?,?,?,?,?)",['NEW SKU2',200,100,'notes2',300,400])
        
        await dbHandler.run("insert into TESTDESCRIPTOR(NAME,PROCEDUREDESCRIPTION, IDSKU) VALUES(?,?,?)",['test 1','method1',1])
        await dbHandler.run("insert into TESTDESCRIPTOR(NAME,PROCEDUREDESCRIPTION, IDSKU) VALUES(?,?,?)",['test 2','method2',1])

        await dbHandler.run("insert into SKUITEM(RFID,SKUID,AVAILABLE,DATEOFSTOCK) VALUES(?,?,0,?)",['12345678963214587412032145698741',1,'2022-02-12'])
        await dbHandler.run("insert into SKUITEM(RFID,SKUID,AVAILABLE,DATEOFSTOCK) VALUES(?,?,0,?)",['12345678963214587412032145698000',1,'2022-04-12'])
    });

      after(async()=>{
        await testResultHandler.dropTableTESTRESULT()
        await testResultHandler.createTableTESTRESULT()

        await testHandler.dropTableTESTDESCRIPTOR()
        await testHandler.createTableTESTDESCRIPTOR()

        await SKUItemHandler.dropTableSKUITEM()
        await SKUItemHandler.createTableSKUITEM()

        await SKUHandler.dropTableSKU();
        await  SKUHandler.createTableSKU();
    })  

    addTestResult(201,'12345678963214587412032145698741',1,'2022-05-12',1);
    addTestResult(404,'12345678900085211144477788855500',1,'2022-05-12',1);
    addTestResult(422);
    findTestResult(200,'12345678963214587412032145698741',1)
    findTestResult(422,1)
    findTestResult(422,'12345678963214587412032145698741')
    findTestResult(404,'12345678963214587412032145698741',8)


});

function addTestResult(expectedHTTPStatus,rfid,IdTestDescriptor,date,result) {
    it('adding a Test Result', function (done) {
        if (rfid !== undefined) {
            let testresult = { rfid: rfid, idTestDescriptor: IdTestDescriptor, Date: date, Result: result }
            agent.post(`/api/skuitems/testResult`)
                .send(testresult)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(done);
        } else {
            agent.post(`/api/skuitems/testResult`) //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(done);
        }

    });
}

function findTestResult(expectedStatus,rfid,id){
    it('finding a testResult by rfid and id',function(done){

            agent.get(`/api/skuitems/${rfid}/testResults/${id}`)
            .then(function(res){
                res.should.have.status(expectedStatus);
                done();
            }).catch(done);
    })
}
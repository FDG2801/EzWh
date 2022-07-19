const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
chai.expect();

const app = require('../server');
var agent = chai.request.agent(app);

const DBHandler = require('../modules/DBHandler');
const dbHandler = new DBHandler('EzWhDB.db');
const SKUDAO = require('../modules/SKUDAO');
const SKUHandler = new SKUDAO(dbHandler);

const PositionDAO = require('../modules/positionDAO');
const poHandler = new PositionDAO(dbHandler);

const TestResultDAO = require('../modules/testResultDAO');
const testResultHandler = new TestResultDAO(dbHandler);

const SKUItemDAO = require('../modules/SKUItemDAO');
const SKUItemHandler = new SKUItemDAO(dbHandler);

const TestDescriptorDAO = require('../modules/testDescriptionDAO');
const testHandler = new TestDescriptorDAO(dbHandler);

describe('test sku apis', () => {

    before( async()=> {

/*         await testResultHandler.dropTableTESTRESULT()
        await testResultHandler.createTableTESTRESULT()

        await testHandler.dropTableTESTDESCRIPTOR()
        await testHandler.createTableTESTDESCRIPTOR()

        await SKUItemHandler.dropTableSKUITEM()
        await SKUItemHandler.createTableSKUITEM() */

        await SKUHandler.dropTableSKU();
        await SKUHandler.createTableSKU();

        await dbHandler.run("insert into SKU(DESCRIPTION,WEIGHT,VOLUME,NOTES,PRICE,AVAILABLEQUANTITY) VALUES(?,?,?,?,?,?)",['NEW SKU1',100,100,'notes1',250,40])
        await dbHandler.run("insert into SKU(DESCRIPTION,WEIGHT,VOLUME,NOTES,PRICE,AVAILABLEQUANTITY) VALUES(?,?,?,?,?,?)",['NEW SKU2',200,100,'notes2',300,400])

        await poHandler.dropTablePositions()
        await poHandler.newTablePositions()
        await dbHandler.run("INSERT INTO POSITION VALUES (?,?,?,?,?,?,?,?)",['123445677412',1234,4567,7412,15000,15000])
        await dbHandler.run("INSERT INTO POSITION VALUES (?,?,?,?,?,?,?,?)",['123420209632',1234,2020,9632,1000,1000])
    });

      after(async()=>{
        
         await SKUHandler.dropTableSKU();
         await SKUHandler.createTableSKU();
        
         await poHandler.dropTablePositions()
         await poHandler.newTablePositions()
    })  
    
    //addSKU(201,"new sku 1",100,100,"note 1",250,50)
    //addSKU(201,"new sku 2",150,200,"note 2",250,100)
    //addSKU(422,"new sku 3",150,200,"note 3",-900,30)
    //addSKU(422)
    updateSKU(200,1, 'edited sku with integration test', 100,100, "integration test",500,50);
    updateSKU(422);
    updateSKU(422,2);
    setPosition(200,1,'123445677412')
    setPosition(422,2,'123445677412')
    setPosition(404,2,'123445677415')
    setPosition(422,2,'123420209632')
    setPosition(422,3)
    setPosition(422) 

});


function addSKU(expectedHTTPStatus, description, weight, volume,notes,price,availableQuantity) {
    it('adding a new SKU', function (done) {
        if (description !== undefined) {
            let sku = { description: description, weight: weight, volume: volume, notes: notes, price: price,availableQuantity: availableQuantity }
            agent.post(`/api/sku`)
                .send(sku)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(done);
        } else {
            agent.post(`/api/sku`) //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(done);
        }

    });
}

function updateSKU(expectedHTTPStatus,id, description, weight, volume,notes,price,availableQuantity) {
    it('updating a SKU', function (done) {
        if (description !== undefined) {
            console.log(id)
            let sku = { newDescription: description, newWeight: weight, newVolume: volume, newNotes: notes, newPrice: price,newAvailableQuantity: availableQuantity }
            agent.put(`/api/sku/${id}`)
                .send(sku)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(done);
        } else {
            agent.put(`/api/sku/${id}`) //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(done);
        }

    });
}

function setPosition(expectedHTTPStatus,id,positionId) {
    it('setting position for SKU', function (done) {
        if (positionId !== undefined) {
            let position = { position : positionId }
            agent.put(`/api/sku/${id}/position`)
                .send(position)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(done);
        } 
        else 
        {
            agent.put(`/api/sku/${id}/position`) //we are not sending any data
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(done);
        }

    });
}
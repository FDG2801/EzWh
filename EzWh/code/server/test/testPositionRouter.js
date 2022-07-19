const chai = require('chai');
const chaiHttp = require('chai-http');
const DBHandler = require('../modules/DBHandler');
const PositionDAO = require('../modules/positionDAO');
chai.use(chaiHttp);
chai.should();
chai.expect();
const app = require('../server');
const dbHandler=new DBHandler('EzWhDB.db')
const positionHandler=new PositionDAO(dbHandler)
var agent = chai.request.agent(app);

describe('Modify a position by its old id',()=>{
    before(async()=>{
        try{
            await positionHandler.dropTablePositions()
            await positionHandler.newTablePositions();
            await dbHandler.run("DELETE FROM POSITION")
            let res=await positionHandler.createNewPosition("336533653365",1,2,3,4,5);
            // console.log("rs")
            // console.log(res)
            // res=await positionHandler.getPositions()
            // console.log(res)
        }
        catch(e){
            console.log(e)
        }
        //positionID,aisleID,row,col,maxWeight,maxVolume -> parameters
        //let res=positionHandler.getPositions(); //verify that are not zero
    })
    //positionHandler.createNewPosition(3337,1,2,3,4,5);
    testModifyAPositionByitsOldID(422,"336533653365",1040,1112,1213,12,13,14,15);
    testGetAllPositions(200);
    //expectedStatus,positionId,newAisleID,newRow,newCol,newMaxWeight,newMaxVolume,newOccupiedWeight,newOccupiedVolume
    testDeletePosition(204,"336533653365");
})

function testModifyAPositionByitsOldID(expectedStatus,positionId,newAisleID,newRow,newCol,newMaxWeight,newMaxVolume,newOccupiedWeight,newOccupiedVolume){
    it('should modify the information of a position',function(done){
        if (positionId!==undefined){
            //console.log('position id confermato');
            let position={
                positionId:positionId,
                newAisleID:newAisleID,
                newRow:newRow,
                newCol:newCol,
                newMaxWeight:newMaxWeight,
                newMaxVolume:newMaxVolume,
                newOccupiedWeight:newOccupiedWeight,
                newOccupiedVolume:newOccupiedVolume
            }
            agent.put(`/api/position/${positionId}`)
            .send(position)
            .then(function(res){
                res.should.have.status(expectedStatus);
                done();
            }).catch(done);
        }
    })
}

function testGetAllPositions(expectedStatus){
    it('should list all the positions',function(done){
        agent.get(`/api/positions`)
        .then(function(res){
            res.should.have.status(expectedStatus);
            done();
        }).catch(done);
    })
}

function testDeletePosition(expectedStatus,positionID){
    it('should delete an existing position',function(done){
        if(positionID!==undefined){
            agent.delete(`/api/position/${positionID}`)
            .then(function(res){
                res.should.have.status(expectedStatus);
                done();
            }).catch(done);
        }
        else{
            agent.put(`/api/position/${positionID}`) //not sending data
            .then(function(res){
                res.should.have.status(expectedStatus);
                done();
            }).catch(done);
        }
    })
}
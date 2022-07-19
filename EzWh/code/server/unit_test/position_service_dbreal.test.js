const DBHandler = require('../modules/DBHandler');
const PositionService=require('../services/positionService');
const PositionDAO=require('../modules/positionDAO')
const dbHandler=new DBHandler('EzWhDB.db');
const positionHandler=new PositionDAO(dbHandler)
const position_service=new PositionService(positionHandler);


describe("Add a new position",()=>{
    beforeEach(async()=>{
        //I add a position
        await positionHandler.dropTablePositions()
        await positionHandler.newTablePositions();
        await positionHandler.createNewPosition(123456,8,9,10,50,60);
        //positionID,aisleID,row,col,maxWeight,maxVolume -> parameters
        let res=positionHandler.getPositions(); //verify that are not zero
        if (res.length==0){
            throw new Error("seems there was a mistake adding the position");
        }
    })
    testAddNewPosition(1245971,9,10,12,51,61); //ok
    //testAddNewPosition(); //should fail - ok
})

async function testAddNewPosition(positionID,aisleID,row,col,maxWeight,maxVolume){
    test('adding a new position',async()=>{
        let res=await position_service.addPosition(positionID,aisleID,row,col,maxWeight,maxVolume);
        expect(res.id).toBeTruthy();
    })
}

describe("Get a position given its id",()=>{
    beforeEach(async()=>{
        //I add a position
        await positionHandler.dropTablePositions()
        await positionHandler.newTablePositions();
        await positionHandler.createNewPosition(123456,8,9,10,50,60);
        //positionID,aisleID,row,col,maxWeight,maxVolume -> parameters
        let res=positionHandler.getPositions(); //verify that are not zero
        if (res.length==0){
            throw new Error("seems there was a mistake adding the position");
        }
    })
    testGetPosition(123456) //ok
    //testGetPosition(); //should fail - ok
})

async function testGetPosition(id){
    test('finding a position that already exists by its id',async()=>{
        let res=await position_service.findPosition(id);
        expect(parseInt(res.positionid)).toEqual(id);
    })
}

describe("Modify a positionID given its old id",()=>{
    beforeEach(async()=>{
        //I add a position
        await positionHandler.dropTablePositions()
        await positionHandler.newTablePositions();
        await positionHandler.createNewPosition(123456,8,9,10,50,60);
        //positionID,aisleID,row,col,maxWeight,maxVolume -> parameters
        let res=positionHandler.getPositions(); //verify that are not zero
        if (res.length==0){
            throw new Error("seems there was a mistake adding the position");
        }
    })
    testChangePositionID(123456,"654321") //ok
    testChangePositionID(123456,654321) //can be under " " or a simple number
})

async function testChangePositionID(formerId,newId){
    test('finding a position that already exists by its id',async()=>{
        let res=await position_service.changePositionId(formerId,newId);
        expect(res.id).toBeTruthy(); //rows changed
    })
}

describe("Modify a position given its old id and new informations",()=>{
    beforeEach(async()=>{
        //I add a position
        await positionHandler.dropTablePositions()
        await positionHandler.newTablePositions();
        await positionHandler.createNewPosition(123456,8,9,10,50,60);
        //positionID,aisleID,row,col,maxWeight,maxVolume -> parameters
        let res=positionHandler.getPositions(); //verify that are not zero
        if (res.length==0){
            throw new Error("seems there was a mistake adding the position");
        }
    })
    testModifyPosition(123456,21,22,23,24,25,26,27);
    //positionId,newAisleID,newRow,newCol,newMaxWeight,newMaxVolume,newOccupiedWeight,newOccupiedVolume
    //testModifyPosition(); //should fail - ok
})

async function testModifyPosition(positionId,newAisleID,newRow,newCol,newMaxWeight,newMaxVolume,newOccupiedWeight,newOccupiedVolume){
    test('finding a position that already exists by its id',async()=>{
        let res=await position_service.updatePosition(positionId,newAisleID,newRow,newCol,newMaxWeight,newMaxVolume,newOccupiedWeight,newOccupiedVolume);
        expect(res.id).toBeTruthy(); //rows changed
    })
}
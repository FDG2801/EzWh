const DBHandlerDAO = require('../modules/DBHandler');
const dbHandler=new DBHandlerDAO('EzWhDB');
const PositionDAO=require("../modules/positionDAO");
const positionDAOHandler=new PositionDAO(dbHandler);

describe('Test position DAO',()=>{
    beforeAll(async()=>{
        await positionDAOHandler.dropTablePositions();
        await positionDAOHandler.newTablePositions();
        await dbHandler.run("DELETE FROM POSITION");
    });

    test('Delete all entries',async()=>{
        let res=await positionDAOHandler.getPositions();
        expect(res.length).toStrictEqual(0);
    });

    testNewPosition(809010,"9","8","7","6","5"); //ok
    //int varchar
    testModifyPositionByID(809010,"10","9","8","7","6","5","4"); //ok
    //id,aisle,row,col,maxw,maxv,occw,occv
    testModifyPositionIDByOldPos(809010,819110); //ok
    testDeletePosition("819110"); //ok
    //test that have to fail: 
    //testNewPosition("90q4");
    //testModifyPositionByID()
    //testModifyPositionIDByOldPos("809010")
    //testDeletePosition("90100")
})

function testNewPosition(positionID,aisleID,row,col,maxWeight,maxVolume){
    test('Add a new position',async()=>{
        let res=await positionDAOHandler.createNewPosition(positionID,aisleID,row,col,maxWeight,maxVolume);
        expect(res.id).toBeTruthy();
    });
}

function testModifyPositionByID(id,newAisleID,newRow,newCol,newMaxWeight,newMaxVolume,newOccupiedWeight,newOccupiedVolume){
    test('Modify row,col,maxweight,maxvolume,occupiedweight,occupiedvolume',async()=>{
        let res=await positionDAOHandler.modifyPostionByID(id,newAisleID,newRow,newCol,newMaxWeight,newMaxVolume,newOccupiedWeight,newOccupiedVolume)
        expect(res.ID).toStrictEqual(this.id)
        expect(res.aisleID).toStrictEqual(this.newAisleID)
        expect(res.row).toStrictEqual(this.newRow)
        expect(res.col).toStrictEqual(this.newCol)
        expect(res.maxWeight).toStrictEqual(this.newMaxWeight)
        expect(res.maxVolume).toStrictEqual(this.newMaxVolume)
        expect(res.newOccupiedVolume).toStrictEqual(this.newOccupiedVolume)
        expect(res.newOccupiedWeight).toStrictEqual(this.newOccupiedWeight)
    })
}

function testModifyPositionIDByOldPos(id,newId){
    test('Modify a position id given its former id',async()=>{
        let res=await positionDAOHandler.modifyPostionIDByOldPos(id,newId);
        expect(res.ID).toStrictEqual(this.id);
    })
}

function testDeletePosition(id){
    test('delete a position identified by its id',async()=>{
        let res=await positionDAOHandler.deletePosition(id);
        expect(res.ID).toStrictEqual(this.id)
    })
}
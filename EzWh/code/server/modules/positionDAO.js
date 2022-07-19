class PositionDAO{
    constructor(dbHandler) {
        this.dbHandler = dbHandler;
    }
    newTablePositions(){
        return this.dbHandler.run("CREATE TABLE IF NOT EXISTS POSITION(positionID VARCHAR, AISLEID VARCHAR, ROW VARCHAR,COL VARCHAR,MAXWEIGHT VARCHAR,MAXVOLUME VARCHAR,OCCUPIEDWEIGHT VARCHAR,OCCUPIEDVOLUME VARCHAR)")
    }

    dropTablePositions(){
        return this.dbHandler.run('DROP TABLE IF EXISTS POSITION');
    }
    //GET ALL POSITIONS
    getPositions(){
        return  this.dbHandler.all("SELECT * FROM POSITION");
    }
    //POST - NEW POSITION
    createNewPosition(positionID,aisleID,row,col,maxWeight,maxVolume){
        const sql="INSERT INTO POSITION VALUES (?,?,?,?,?,?,?,?)";
        return this.dbHandler.run(sql,[positionID,aisleID,row,col,maxWeight,maxVolume,'0','0']);
    }

    /**
     * PUT
     * - modifyPosition(id)
     * - modifyPositionGivenItsOldPosition
     * - deletePosition(id)
     */
    
    //modifyPosition
    modifyPostionByID(id,newAisleID,newRow,newCol,newMaxWeight,newMaxVolume,newOccupiedWeight,newOccupiedVolume){
        //const newPositionId=newAisleID+newRow+newCol;
        const sql="UPDATE POSITION SET positionID=? , AISLEID=?,ROW=?,COL=?,MAXWEIGHT=?,MAXVOLUME=?,OCCUPIEDWEIGHT=?,OCCUPIEDVOLUME=? WHERE positionID=?"
        return this.dbHandler.update(sql,[id,newAisleID,newRow,newCol,newMaxWeight,newMaxVolume,newOccupiedWeight,newOccupiedVolume,id])
    }

    modifyPostionIDByOldPos(id,newId){
            const aisleID=newId.toString().substring(0,4);
            const row=newId.toString().substring(4,8);
            const col=newId.toString().substring(8,12);
            const sql="UPDATE POSITION SET positionID=?,AISLEID=?,ROW=?,COL=? WHERE positionID=?"
            return this.dbHandler.update(sql,[newId,aisleID,row,col,id]);
    }

    //DELETE
    deletePosition(id){
                const sql="DELETE FROM POSITION WHERE positionID=?"
                return this.dbHandler.delete(sql,[id])
    }

    
    modifyPositionOccupiedInfo(id,newOccupiedWeight,newOccupiedVolume)
    {
        const sql="UPDATE POSITION SET OCCUPIEDWEIGHT=?,OCCUPIEDVOLUME=? WHERE positionID=?"
        return this.dbHandler.run(sql,[newOccupiedWeight,newOccupiedVolume,id])
    }

    findPosition(id)
    {
        const sql="SELECT * FROM POSITION WHERE positionID=(?)"
        return this.dbHandler.get(sql,[id]);
    }

    doesPositionExists(id){
        const sql="SELECT POSITIONID FROM POSITION WHERE positionID=?"
        const res= this.dbHandler.get(sql,[id]);
        return res;
    }
}
module.exports=PositionDAO;
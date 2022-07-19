class PositionService{
    dao;

    constructor(dao){
        this.dao=dao;
    }

    findPosition=async(id)=>{
        const position=await this.dao.findPosition(id);
        let positionDTO=undefined;
        console.log("positionservice position",position)
        if(position!=undefined)
        {
            positionDTO={
                positionid:position.positionID,
                aisleid:position.AISLEID,
                row:position.ROW,
                col:position.COL,
                maxweight:position.MAXWEIGHT,
                maxvolume:position.MAXVOLUME,
                occupiedweight:position.OCCUPIEDWEIGHT,
                occupiedvolume:position.OCCUPIEDVOLUME
            }
        }    
        return positionDTO;
    }

    getPositions=async ()=>
    {
        const result=await this.dao.getPositions();
        return result;
    }

    addPosition= async (positionID,aisleID,row,col,maxWeight,maxVolume)=>
    {
        const result=await this.dao.createNewPosition(positionID,aisleID,row,col,maxWeight,maxVolume)
        return result;
    }

    updatePosition= async(positionId,newAisleID,newRow,newCol,newMaxWeight,newMaxVolume,newOccupiedWeight,newOccupiedVolume)=>
    {
        const allPositions=await this.getPositions();
        let position=undefined;
        for(let i=0;i<allPositions.length;i++){
                if (allPositions[i].positionID==positionId){
                    position=allPositions[i];
                    break;
                }
            }
        console.log('position of update pos serv ',position) 
        if (position==undefined){
            return undefined;
        }
        const result=await this.dao.modifyPostionByID(position.positionID,newAisleID,newRow,newCol,newMaxWeight,newMaxVolume,newOccupiedWeight,newOccupiedVolume)
        return result;
        // //check position exists
        // const position=await this.findPosition(positionId);
        // const allPositions=await this.getPositions()
        // console.log('this is position',position)
        // console.log('all positions', allPositions)
        // for(let i=0;i<allPositions.length;i++){
        //     if (allPositions[i].POSITIONID==positionId){
        //         position=allPositions[i];
        //         return position;
        //     }
        // }
        // if(position===undefined)
        //     return -1;

        // const result=await this.dao.modifyPostionByID(positionId,newAisleID,newRow,newCol,newMaxWeight,newMaxVolume,newOccupiedWeight,newOccupiedVolume)
        // return result;
    }

    changePositionId= async (positionId,newPositionId)=>
    {
        //check position exists
        const position=await this.findPosition(positionId);
        console.log("this is position from position service", position)
        if(position===undefined)
            return -1;
        
        const result=await this.dao.modifyPostionIDByOldPos(positionId,newPositionId)
        console.log("this is result from position service", result)
        return result;
    }

    deletePosition= async (id)=>
    {
        //check position exists
        const position=await this.findPosition(id);
        if(position===undefined)
            return -1;
        
        const result=await this.dao.deletePosition(id);
        if (result !== true) {
            return false;
        } 
        return true;
    }
    
}

module.exports=PositionService;

class SKUService
{
    dao;
    positiondao;

    constructor(dao,positiondao)
    {
        this.dao=dao;
        this.positiondao=positiondao;
    }

    getSKUs= async()=>
    {
        const result=await this.dao.getAll();
        return result;
    }

    findSKU= async(id)=>
    {
        const result=await this.dao.find(id);
        let sku=undefined;
        if(result!=undefined && result.id !=null)
        {
           sku={
            description:result.description,
            weight:result.weight,
            volume:result.volume,
            notes:result.notes,
            position:result.position,
            availableQuantity:result.availableQuantity,
            price:result.price,
            testDescriptors : result.testDescriptors
          }
        }
        return sku;
    }

    addSKU= async(descrition,weight,volume,notes,price,availableQuantity)=>
    {
        const result=await this.dao.addSKU(descrition,weight,volume,notes,price,availableQuantity)
        return result;
    }

    updateSKU=async(id,newDescrition,newWeight,newVolume,newNotes,newPrice,newAvailableQuantity)=>
    {
        //check sku exists
        const sku=await this.findSKU(id);
        if(sku===undefined)
            return -1;

        //check with newAvailableQuantity, position is capable enough in weight or in volume 
        if(sku.position  && newAvailableQuantity!=null)
        {
            const position=await this.positiondao.findPosition(sku.position)
            const maxWeight=position.MAXWEIGHT;
            const maxVolume=position.MAXVOLUME;
            if(sku.weight*newAvailableQuantity>maxWeight || sku.volume*newAvailableQuantity>maxVolume)
                return -2;
        }
        const result=await this.dao.updateSKU(id,newDescrition,newWeight,newVolume,newNotes,newPrice,newAvailableQuantity)
        if(result.id>0)
        {
            if(sku.position!=null && newAvailableQuantity!=null)
                await this.positiondao.modifyPositionOccupiedInfo(sku.position,newAvailableQuantity*newWeight,newAvailableQuantity*newVolume)
              
        }

        return result;
    }

    setPosition=async(id,positionId)=>
    {
        //check sku exists
        const sku=await this.findSKU(id);
        if(sku===undefined)
            return -1;

        //check position exists
        const position=await this.positiondao.findPosition(positionId)
        if(position===undefined)
            return -2;

        //check position is not assigned 
        const assignedPosition=await this.dao.findSKUbyPosition(positionId);
        if(assignedPosition!==undefined && assignedPosition.ID != id)
            return -3; 

        //check position is capable to satisfy volume and weight
        if(sku.weight && sku.volume && sku.availableQuantity)
        {
            const maxWeight=position.MAXWEIGHT;
            const maxVolume=position.MAXVOLUME;

            if(sku.weight*sku.availableQuantity > maxWeight || sku.volume*sku.availableQuantity > maxVolume)
                return -4;
        }

        const result=await this.dao.setPosition(id,positionId)
        if(result!==undefined && result.id>0)
        {
            await this.positiondao.modifyPositionOccupiedInfo(positionId,sku.AVAILABLEQUANTITY*sku.WEIGHT,sku.AVAILABLEQUANTITY*sku.VOLUME)          
        }

        return result;
    }

    deleteSKU= async(id)=>
    {
         //check sku exists
       //  const sku=await this.findSKU(id);
       //  if(sku===undefined)
       //      return -1;

        const result=await this.dao.deleteSKU(id);
        if (result !== true) {
            return false;
        } 
        return true;
    }
}

module.exports=SKUService;
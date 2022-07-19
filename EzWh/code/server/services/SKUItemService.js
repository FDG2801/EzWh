
class SKUItemService
{
    dao;

    constructor(dao)
    {
        this.dao=dao;
    }

    getSKUItems= async()=>
    {
        const result=await this.dao.getAll();
        return result;
    }

    findSKUItem= async(rfid)=>
    {
        const result=await this.dao.find(rfid);
        let skuItem=undefined;
        if(result!==undefined)
        {
            skuItem={
                RFID:result.RFID,
                SKUId:result.SKUId,
                Available:result.Available,
                DateOfStock:result.DateOfStock
          }
        }
        return skuItem;
    }

    getSKUsbySKUId= async(id)=>
    {
        const result=await this.dao.getbySKUId(id);
        const skuItems=result.map((skuItem)=>(
        {
            RFID:skuItem.RFID,
            SKUId:skuItem.SKUId,
            DateOfStock:skuItem.DateOfStock
        }))
        return skuItems;
    }

    addSKUItem= async(RFID,SKUId,DateOfStock)=>
    {
        
        const result=await this.dao.addSKUITEM(RFID,SKUId,DateOfStock)
        return result;
    }

    updateSKUItem= async(RFID,newRFID,newAvailable,newDateOfStock)=>
    {
        //check skuItem exists
        const skuItem=await this.findSKUItem(RFID);
        if(skuItem===undefined)
            return -1;

        const result=await this.dao.updateSKUITEM(RFID,newRFID,newAvailable,newDateOfStock)
        return result;
    }

    deleteSKUItem= async(rfid)=>
    {
        const skuItem=await this.findSKUItem(rfid);
        if(skuItem===undefined)
            return -1;

        const result=await this.dao.deleteSKUITEM(rfid);
        if (result !== true) {
            return false;
        } 
        return true;
    }
}

module.exports=SKUItemService;
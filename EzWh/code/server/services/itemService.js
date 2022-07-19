class itemService{
    dao;
    skuDoa;

    constructor(dao,skudoa,userdao)
    {
        this.dao=dao;
        this.skuDoa=skudoa;
        this.userdao=userdao;
    }

    getItems=async ()=>
    {
        const result=await this.dao.getItems();
        return result;
    }

    findItem=async(id)=>
    {
        const result=await this.dao.getSpecificItem(id);
        let item=undefined;
        if(result!=undefined)
        {
            item=
            {
                id:result.itemid,
                description:result.description,
                price:result.price,
                SKUId:result.SKUId,
                supplierId:result.supplierId
            }
        }
        return item;
    }

    findItemByIdAndSupplier=async(id,supplierId)=>
    {
        const result=await this.dao.getSpecificItemByIdAndSupplier(id,supplierId);
        let item=undefined;
        if(result!=undefined)
        {
            item=
            {
                id:result.itemid,
                description:result.description,
                price:result.price,
                SKUId:result.SKUId,
                supplierId:result.supplierId
            }
        }
        return item;
    }

    findItemByProps=async(skuid,descr,price,suppid)=>{
        const itemResult=await this.dao.getIDbyProps(skuid,descr,price,suppid);
        let result=undefined
        if(itemResult!=undefined){
            result={
                id:itemResult.ITEMID,
                description:itemResult.description
            }
            //return result;
        }
        return itemResult
    }

    addItem = async (id,description,price,SKUId,supplierId)=>
    {
        // const sku=await this.skuDoa.find(SKUId);
        // if(sku===undefined)
        //     return -1;
        
        // const item1=await this.dao.checkExistingItembySKUId(supplierId,SKUId);
        // if(item1 !== undefined)
        //     return -2;
        
        // const item2=await this.dao.checkExistingItembyId(supplierId,id);
        // if(item2 !== undefined)
        //     return -3;

        // const user=await this.userdao.findUserById(supplierId);
        // if (user===undefined){
        //     return -4;
        // }
        const result=await this.dao.createNewItem(id,description,price,SKUId,supplierId)
        return result;
    }

    updateItem = async(id,description,price)=>
    {
        const item=await this.findItem(id);
        if(item===undefined)
            return -1;

        const result=await this.dao.modifyItem(id,description,price)
        return result;
    }

    //new
    updateItemByIdAndSupplierId = async(id,supplierId,description,price)=>
    {
        const item=await this.findItemByIdAndSupplier(id,supplierId);
        if(item===undefined)
            return -1;

        const result=await this.dao.modifyItemByIdAndSupplierId(id,supplierId,description,price)
        return result;
    }

    deleteItem= async(id)=>
    {
         //check item exists
        const item=await this.findItem(id);
        if(item===undefined)
            return -1;

        const result=await this.dao.deleteItem(id);
        if (result !== true) {
            return false;
        } 
        return true;
    }

    deleteItemWithSupplier= async(id,supplierId)=>
    {
         //check item exists
        const item=await this.findItemByIdAndSupplier(id,supplierId);
        if(item===undefined)
            return -1;

        const result=await this.dao.deleteItemByIdAndSupplier(id,supplierId);
        if (result !== true) {
            return false;
        } 
        return true;
    }
}

module.exports=itemService;
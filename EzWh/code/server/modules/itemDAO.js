
class ItemDAO{
    constructor(dbHandler) {
        this.dbHandler = dbHandler;
    }
    createTableItem(){
        return  this.dbHandler.run("CREATE TABLE IF NOT EXISTS ITEMS(id integer PRIMARY KEY AUTOINCREMENT,itemid integer,description varchar,price REAL,SKUId integer,supplierId integer) ")
    }
    dropTable(){
        return  this.dbHandler.run('DROP TABLE IF EXISTS ITEMS');
    }
    //GET ALL ITEMS
     getItems(){
        return  this.dbHandler.all("SELECT * FROM ITEMS");
    }
    //GET ItemID by properties
    getIDbyProps(skuid, descr, price, suppid){
        const sql="SELECT itemid FROM ITEMS WHERE SKUId=? AND description=? AND price=? AND supplierId=?"
        return  this.dbHandler.get(sql,[skuid, descr, price, suppid]);
    }

    //GET ItemID by properties -- in case of redundancy 
    getSpecificItemByProps(itemid,skuid, descr, price, suppid){
        const sql="SELECT * FROM ITEMS WHERE itemid=? AND SKUId=? AND description=? AND price=? AND supplierId=?";
        return  this.dbHandler.get(sql,[itemid,skuid, descr, price, suppid]);
    }
    
    getSpecificItem(id){
        const sql="SELECT * FROM ITEMS WHERE itemid=?";
        return  this.dbHandler.get(sql,[id]);
    }

    getSpecificItemByIdAndSupplier(id,supplierId){
        const sql="SELECT * FROM ITEMS WHERE itemid=? and supplierId=?";
        return  this.dbHandler.get(sql,[id,supplierId]);
    }

    getFromPK(id){
        const sql="SELECT * FROM ITEMS WHERE id=?";
        return  this.dbHandler.get(sql,[id]);
    }

    checkExistingItembySKUId(supplierId,SKUId)
    {
        //check if sku item exists
        const sql="SELECT * FROM ITEMS WHERE SKUId=? and supplierId=?";
        return this.dbHandler.get(sql,[SKUId,supplierId]);
    }

    checkExistingItembyId(supplierId,id)
    {
        //check if user exists
        const sql="SELECT * FROM ITEMS WHERE ITEMID=? and supplierId=?";
        return this.dbHandler.get(sql,[id,supplierId]);
    }

    //POST: creates a new item
     createNewItem(id,description,price,SKUId,supplierId){
        const sql="INSERT INTO ITEMS(itemid, description,price,SKUId, supplierId) VALUES(?,?,?,?,?)"
        return  this.dbHandler.run(sql,[id,description,price,SKUId,supplierId])
    }

    //PUT: modify an item
     modifyItem(id,newDescription,newPrice){
            const sql="UPDATE ITEMS SET DESCRIPTION=?,PRICE=? WHERE ITEMID=?"
            return  this.dbHandler.run(sql,[newDescription,newPrice,id])
    }

    //PUT: modify an item
    modifyItemByIdAndSupplierId(id,supplierId,newDescription,newPrice){
        const sql="UPDATE ITEMS SET DESCRIPTION=?,PRICE=? WHERE ITEMID=? AND supplierId=?"
        return  this.dbHandler.run(sql,[newDescription,newPrice,id,supplierId])
}

    //DELETE: delete an item  
    deleteItem(id){
            const sql="DELETE FROM ITEMS WHERE ITEMID=?"
            return  this.dbHandler.run(sql,[id])
    }

    //new
    deleteItemByIdAndSupplier(id,supplierId){
        const sql="DELETE FROM ITEMS WHERE ITEMID=? and supplierId=?" 
        return  this.dbHandler.run(sql,[id,supplierId])
}
}

module.exports=ItemDAO;
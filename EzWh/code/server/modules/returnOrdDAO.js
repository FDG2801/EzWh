class returnOrdDAO {
    
    constructor(dbHandler) {
        this.dbHandler = dbHandler;
    }
    
    //create and drop
    async dropTableReturnOrd() {
        return await this.dbHandler.run('DROP TABLE IF EXISTS RETURN_ORDER');
    }

    async newTableReturnOrd() {
        return await this.dbHandler.run("CREATE TABLE IF NOT EXISTS RETURN_ORDER(REOID INTEGER PRIMARY KEY AUTOINCREMENT, RETURNDATE TEXT,ROID INTEGER)")
    }


    async dropTableReturnSkuItem() {
        return await this.dbHandler.run('DROP TABLE IF EXISTS RETURN_ITEM');
    }

    async newTableReturnSkuItem() {
        return await this.dbHandler.run("CREATE TABLE IF NOT EXISTS RETURN_ITEM(REOID INTEGER, RFID TEXT, ITEMID INTEGER)") //added itemid 

    }
    //GET
    async getAllOrders() {
        return await this.dbHandler.all("SELECT * FROM RETURN_ORDER");
    }

    async getProductsByID(ID) {
        return await this.dbHandler.all("SELECT SKU.ID AS SKUID, RETURN_ITEM.ITEMID AS ITEMID ,SKU.DESCRIPTION AS DESCRIPTION, SKU.PRICE AS PRICE,SKUITEM.RFID AS RFID FROM RETURN_ITEM , SKU, SKUITEM  WHERE RETURN_ITEM.REOID=? AND RETURN_ITEM.RFID = SKUITEM.RFID AND SKU.ID = SKUITEM.SKUID", [ID])
    }

    async getOrderByID(ID) {
        return await this.dbHandler.get("SELECT * FROM RETURN_ORDER WHERE REOID=?", [ID]);
    }
    //POST
    async addReturnOrder(reoid,returnDate) {
        return await this.dbHandler.run("INSERT INTO RETURN_ORDER(RETURNDATE ,ROID) VALUES(strftime('%Y/%m/%d %H:%M',?), ?)",
            [returnDate, reoid]);
    }

    async addReturnItem(id, rfid, itemid) {
        return await this.dbHandler.run("INSERT INTO RETURN_ITEM(REOID, RFID, ITEMID) VALUES(?, ?, ?)", [id,rfid,itemid]); //added itemid 
    }
    //DELETE
    async deleteOrderByID(ID) {
        let res = [];
        await this.dbHandler.run("DELETE FROM RETURN_ITEM WHERE REOID=?;", [ID]);
        await this.dbHandler.run("DELETE FROM RETURN_ORDER WHERE REOID=?;", [ID]);
        return res;
    }


}

module.exports = returnOrdDAO;
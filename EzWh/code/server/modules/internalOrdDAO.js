

class internalOrdDAO {
    constructor(APPDAOObject) {
        this.dbHandler = APPDAOObject;
    }
    async dropTableInternalOrders() {
        await this.dbHandler.run('DROP TABLE IF EXISTS INTERNAL_ORDERS');
    }

    async dropTableIssuedItems() {
        await this.dbHandler.run('DROP TABLE IF EXISTS ISSUED_ITEM');
    }

    async dropTableCompletedItems() {
        await this.dbHandler.run('DROP TABLE IF EXISTS COMPLETED_ITEM');
    }

    async newTableInternalOrders() {
        await this.dbHandler.run('CREATE TABLE IF NOT EXISTS INTERNAL_ORDERS(IOID INTEGER PRIMARY KEY AUTOINCREMENT, ISSUEDATE TEXT, STATE TEXT,CUSTOMERID INTEGER)');
    }

    async newTableIssuedItems() {
        await this.dbHandler.run('CREATE TABLE IF NOT EXISTS ISSUED_ITEM(IOID INTEGER, SKUID INTEGER, QUANTITY INTEGER)');
    }
    async newTableCompletedItems() {
        await this.dbHandler.run('CREATE TABLE IF NOT EXISTS COMPLETED_ITEM(IOID INTEGER, SKUID INTEGER, RFID TEXT)');
    }

    //we another table to sync sku



    // GET

    async getAllInternalOrders() {
        return await this.dbHandler.all("SELECT * FROM INTERNAL_ORDERS");
    }

    async getInternalIssuedOrders() {
        return await this.dbHandler.all("SELECT * FROM INTERNAL_ORDERS WHERE STATE='ISSUED'");
    }

    async getInternalAcceptedOrders() {
        return await this.dbHandler.all("SELECT * FROM INTERNAL_ORDERS WHERE STATE='ACCEPTED'");
    }


    async getProductsByID(ID, STATE) {
        if (STATE === "COMPLETED") {
            return await this.dbHandler.all("SELECT SKU.ID AS SKUID, SKU.DESCRIPTION AS DESCRIPTION, SKU.PRICE AS PRICE, COMPLETED_ITEM.RFID FROM COMPLETED_ITEM, SKU WHERE IOID=? AND SKU.ID = COMPLETED_ITEM.SKUID", [ID])
        } else {
            return await this.dbHandler.all("SELECT SKU.ID AS SKUID, SKU.DESCRIPTION AS DESCRIPTION,SKU.PRICE AS PRICE, QUANTITY FROM ISSUED_ITEM , SKU  WHERE IOID=? AND SKU.ID = ISSUED_ITEM.SKUID", [ID])
        }
    }


    async getInternalOrderByID(ID) {
        return await this.dbHandler.get("SELECT * FROM INTERNAL_ORDERS WHERE IOID=?", [ID]);
    }

    // POST

    async addInternalOrder(issueDate, customerId) {
        return await this.dbHandler.run("INSERT INTO INTERNAL_ORDERS(ISSUEDATE, STATE, CUSTOMERID) VALUES(strftime('%Y/%m/%d %H:%M',?), 'ISSUED', ?)",
            [issueDate, customerId]);
    }

    async addIOtem(IOID, SKUID, QUANTITY) {
        return await this.dbHandler.run("INSERT INTO ISSUED_ITEM(IOID, SKUID, QUANTITY) VALUES(?, ?, ?)", [IOID, SKUID, QUANTITY]);
    }

    // POST

    async modifyStateByID(ID, state) {
        return await this.dbHandler.run("UPDATE INTERNAL_ORDERS SET STATE=? WHERE IOID=?", [state, ID]);
    }
    async addCompletedItem(ID, SKUID, RFID) {
        return await this.dbHandler.run("INSERT INTO COMPLETED_ITEM(IOID,SKUID,RFID) VALUES(?,?,?)", [ID, SKUID, RFID]);
    }


    // DELETE

    async deleteInternalOrderByID(ID) {
        let res = [];
        res.push(await this.dbHandler.run("DELETE FROM ISSUED_ITEM WHERE IOID=?", [ID]))
        res.push(await this.dbHandler.run("DELETE FROM COMPLETED_ITEM WHERE IOID=?;", [ID]))
        res.push(await this.dbHandler.run("DELETE FROM INTERNAL_ORDERS WHERE IOID=?;", [ID]))
        return res;
    }
}

module.exports = internalOrdDAO;
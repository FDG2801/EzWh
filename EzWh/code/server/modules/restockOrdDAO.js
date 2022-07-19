class RestockOrdDAO {

    constructor(dbHandler) {
        this.dbHandler = dbHandler;
    }
    // Create / drop tables
    async dropTableRstckOrders() {
        await this.dbHandler.run('DROP TABLE IF EXISTS RESTOCK_ORDERS');
    }

    async dropTableROProducts() {
        await this.dbHandler.run('DROP TABLE IF EXISTS RESTOCK_PRODUCTS');
    }

    async dropTableROSKUItems() {
        await this.dbHandler.run('DROP TABLE IF EXISTS RESTOCK_SKUITEMS');
    }   

    async newTableRestockOrders() {
        await this.dbHandler.run('CREATE TABLE IF NOT EXISTS RESTOCK_ORDERS(ROID INTEGER PRIMARY KEY AUTOINCREMENT, issuedate DATETIME, state VARCHAR, supplierid INTEGER, tn_date DATE)');
    }

    async newTableROProducts() {
        await this.dbHandler.run('CREATE TABLE IF NOT EXISTS RESTOCK_PRODUCTS(ROID INTEGER, itemid_pk INTEGER, quantity INTEGER, FOREIGN KEY(ROID) REFERENCES RESTOCK_ORDERS(ROID))');
    }
    
    async newTableROSKUItems() {
        await this.dbHandler.run('CREATE TABLE IF NOT EXISTS RESTOCK_SKUITEMS(ROID INTEGER, RFID TEXT, SKUId INTEGER, itemid INTEGER, FOREIGN KEY(ROID) REFERENCES RESTOCK_ORDERS(ROID))');
    }
    
    // GET

    async getAllOrders() {
        return await this.dbHandler.all("SELECT * FROM RESTOCK_ORDERS");
    }

    async getIssuedOrders() {
        return await this.dbHandler.all("SELECT * FROM RESTOCK_ORDERS WHERE state='ISSUED'");
    }

    async getOrderByID(ID) {
        return await this.dbHandler.get("SELECT * FROM RESTOCK_ORDERS WHERE ROID=?", [ID]);
    }

    async getSKUItems(ID) {  // for the last GET method
                             // retrieving SKUItems to be returned to supplier (from ROSKUItem table) 
        return await this.dbHandler.all("SELECT * FROM RESTOCK_SKUITEMS WHERE ROID=?", [ID]);
    }

    async getProducts(ID) {  // for retrieveing product list
        return await this.dbHandler.all("SELECT * FROM RESTOCK_PRODUCTS WHERE ROID=?", [ID]);
    }
    
    // POST

    async addRestockOrder(issuedate, supplierid) { // creates the entry in RESTOCK_ORDER table
        return await this.dbHandler.run("INSERT INTO RESTOCK_ORDERS(issuedate, state, supplierid, tn_date) VALUES(?, 'ISSUED', ?, NULL)",
        [issuedate, supplierid]);
    }

    async addROProduct(roID, itemidPK, quantity) {  // NEEDS to be executed multiple times for
                                         // each product in the product list
        return await this.dbHandler.run("INSERT INTO RESTOCK_PRODUCTS(ROID, itemid_pk, quantity) VALUES(?, ?, ?)", [roID, itemidPK, quantity]);
    }

    
    // PUT
    
    async modifyStateByID(ID, state) {
        return await this.dbHandler.update("UPDATE RESTOCK_ORDERS SET state=? WHERE ROID=?", [state, ID]);
    }
    
    async addTransportNote(ID, date) {
        await this.dbHandler.run("UPDATE RESTOCK_ORDERS SET tn_date=? WHERE ROID=?", [date, ID]);
    } 
    
    async addROSKUItem(roID, RFID, skuID, itemid) {
        return await this.dbHandler.run("INSERT INTO RESTOCK_SKUITEMS(ROID, RFID, SKUId, itemid) VALUES(?, ?, ?, ?)", [roID, RFID, skuID, itemid]);
    }

    // DELETE
    
    async deleteOrder(ID) {
        await this.dbHandler.run("DELETE FROM RESTOCK_ORDERS WHERE ROID=?", [ID]);
    }

    async deleteRestockProducts(ID) {
        await this.dbHandler.run("DELETE FROM RESTOCK_PRODUCTS WHERE ROID=?", [ID]);
    }

    async deleteRestockSKUItems(ID) {
        await this.dbHandler.run("DELETE FROM RESTOCK_SKUITEMS WHERE ROID=?", [ID]);
    }
}

module.exports = RestockOrdDAO;
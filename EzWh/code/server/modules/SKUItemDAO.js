class SKUItemDAO {

    constructor(dbHandler) {
      this.dbHandler = dbHandler;
    }
  
     dropTableSKUITEM()
    {
        const sql="drop table if exists SKUITEM";
       return this.dbHandler.run(sql);
    }
  
    createTableSKUITEM()
    {
        const sql="create table if not exists SKUITEM(RFID TEXT PRIMARY KEY,SKUId INTEGER, Available INTEGER,DateOfStock TEXT)";
        return this.dbHandler.run(sql);
    }
  
    addSKUITEM(rfid,SKUId,stockDate)
    {
        const sql="insert into SKUITEM(RFID,SKUId,Available,DateOfStock) VALUES(?,?,0,?)";
        return this.dbHandler.insert(sql,[rfid,SKUId,stockDate]);
    }
  
    updateSKUITEM(rfid,newRfid,Available,stockDate)
    {
      const sql="update SKUITEM set RFID=?, Available=? , DateOfStock=? where RFID=?";
        return this.dbHandler.update(sql,[newRfid,Available,stockDate,rfid]);
    }
  
    deleteSKUITEM(rfid)
    {
      const sql="delete from SKUITEM where RFID=?";
      return this.dbHandler.delete(sql,[rfid]);
    }
  
    getAll()
    {
      const sql="select * from SKUITEM";
      return this.dbHandler.all(sql);
    }
  
    async find(rfid)
    {
      const sql="select * from SKUITEM where RFID=?";
      return await this.dbHandler.get(sql,[rfid]);
    }

    getbySKUId(SKUId)
    {
        const sql="select RFID,SKUId,DateOfStock from SKUITEM where SKUId=? and Available=1";
        return this.dbHandler.all(sql,[SKUId]);
    }
  }
  
  module.exports=SKUItemDAO;
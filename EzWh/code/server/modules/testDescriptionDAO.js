class testDescriptionDAO {

    constructor(dbHandler) {
      this.dbHandler = dbHandler;
    }
  
     dropTableTESTDESCRIPTOR()
    {
        const sql="drop table if exists TESTDESCRIPTOR";
       return this.dbHandler.run(sql);
    }
  
    createTableTESTDESCRIPTOR()
    {
        const sql="create table if not exists TESTDESCRIPTOR(id INTEGER PRIMARY KEY,name TEXT,procedureDescription TEXT, idSKU INTEGER)";
        return this.dbHandler.run(sql);
    }
  
    addTESTDESCRIPTOR(name,procedureDescription,idSKU)
    {
        const sql="insert into TESTDESCRIPTOR(name,procedureDescription, idSKU) VALUES(?,?,?)";
        return this.dbHandler.insert(sql,[name,procedureDescription,idSKU]);
    }
  
    updateTESTDESCRIPTOR(id,name,procedureDescription,idSKU)
    {
      const sql="update TESTDESCRIPTOR set name=? ,procedureDescription=?,idSKU=?  where id=?";
        return this.dbHandler.update(sql,[name,procedureDescription,idSKU,id]);
    }
  
    deleteTESTDESCRIPTOR(id)
    {
      const sql="delete from TESTDESCRIPTOR where id=?";
      return this.dbHandler.delete(sql,[id]);
    }
  
    getAll()
    {
      const sql="select * from TESTDESCRIPTOR";
      return this.dbHandler.all(sql);
    }
  
    find(id)
    {
      const sql="select * from TESTDESCRIPTOR where id=?";
      return this.dbHandler.get(sql,[id]);
    }

  }
  
  module.exports=testDescriptionDAO;
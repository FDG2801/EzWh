class testResultDAO {

    constructor(dbHandler) {
      this.dbHandler = dbHandler;
    }
  
     dropTableTESTRESULT()
    {
        const sql="drop table if exists TESTRESULT";
       return this.dbHandler.run(sql);
    }
  
    createTableTESTRESULT()
    {
        const sql="create table if not exists TESTRESULT(id INTEGER PRIMARY KEY,RFID TEXT,IdTestDescriptor INTEGER, date TEXT,result INTEGER)";
        return this.dbHandler.run(sql);
    }
  
    addTESTRESULT(rfid,idTestDescriptor,Date,Result)
    {
        const sql="insert into TESTRESULT(RFID,IdTestDescriptor,date,result) VALUES(?,?,?,?)";
        return this.dbHandler.insert(sql,[rfid,idTestDescriptor,Date,Result]);
    }
  
    updateTESTRESULT(id,rfid,newIdTestDescriptor,newDate,newResult)
    {
      const sql="update TESTRESULT set IdTestDescriptor=?, date=? ,result=?  where RFID=? and id=?";
        return this.dbHandler.update(sql,[newIdTestDescriptor,newDate,newResult,rfid,id]);
    }
  
    deleteTESTRESULT(rfid,id)
    {
      const sql="delete from TESTRESULT where RFID=? and id=?";
      return this.dbHandler.delete(sql,[rfid,id]);
    }
  
    getAll(rfid)
    {
      const sql="select * from TESTRESULT where RFID=?";
      return this.dbHandler.all(sql,[rfid]);
    }
  
    find(rfid,id)
    {
      const sql="select * from TESTRESULT where RFID=? and id=?";
      return this.dbHandler.get(sql,[rfid,id]);
    }

  }
  
  module.exports=testResultDAO;
class SKUDAO {

  constructor(dbHandler) {
    this.dbHandler = dbHandler;
  }

   dropTableSKU()
  {
      const sql="drop table if exists SKU";
     return this.dbHandler.run(sql);
  }

  createTableSKU()
  {
      const sql="create table if not exists SKU(id INTEGER PRIMARY KEY AUTOINCREMENT,description TEXT,weight REAL,volume REAL,notes TEXT,position INTEGER,availableQuantity INTEGER,price REAL)";  //,FOREIGN KEY(POSITION-ID) REFRENCES POSITION(POSITION-ID)
      return this.dbHandler.run(sql);
  }

  addSKU(description,weight,volume,notes,price,availableQuantity)
  {
      const sql="insert into SKU(description,weight,volume,notes,price,availableQuantity) VALUES(?,?,?,?,?,?)";
      return  this.dbHandler.insert(sql,[description,weight,volume,notes,price,availableQuantity]);
  }

  updateSKU(id,description,weight,volume,notes,price,availableQuantity)
  {
    const sql="update SKU set description=?, weight=? , volume=?, notes=?, availableQuantity=?,price=? where id=?";
      return this.dbHandler.update(sql,[description,weight,volume,notes,availableQuantity,price,id]);
  }

  deleteSKU(id)
  {
    const sql="delete from SKU where id=?";
    return this.dbHandler.delete(sql,[id]);
  }

  setPosition(id,positionId)
  {
    const sql="update SKU set position=? where id=?";
    return this.dbHandler.update(sql,[positionId,id]);
  }

  getAll()
  {
    const sql="select SKU.*,json_group_array(TESTDESCRIPTOR.ID) as testDescriptors from SKU left outer join TESTDESCRIPTOR on SKU.id=TESTDESCRIPTOR.IDSKU  group by SKU.id";
    return this.dbHandler.all(sql);
  }

   find(id)
  {
    const sql="select SKU.*,case SKU.id when not NULL THEN json_group_array(TESTDESCRIPTOR.ID) else null END as testDescriptors from SKU left outer join TESTDESCRIPTOR on SKU.id=TESTDESCRIPTOR.IDSKU where SKU.id=? ";
    const result= this.dbHandler.get(sql,[id]);
    return result;
  }

  findSKUbyPosition(positionId)
  {
    const sql="select * from SKU where position=? ";
    const result= this.dbHandler.get(sql,[positionId]);
    return result;
  }

  deleteSKUData()
  {
    const sql="delete from SKU";
    const result= this.dbHandler.delete(sql);
    if(result)
      {
        const sql="delete from sqlite_sequence where name='SKU'";
        this.dbHandler.delete(sql);       
      }
  }

}

module.exports=SKUDAO;

const sqlite3 = require("sqlite3");

class DBHandler {
  constructor(dbFilePath) {
    this.db = new sqlite3.Database(dbFilePath, (err) => {
      if (err) console.log("could not connect to database");
      else console.log("connect to database");
      this.db.get("PRAGMA busy_timeout = 30000");
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      
      this.db.run(sql, params, function (err) {
        if (err) {
          console.log('Error running sql ' + sql)
          console.log(err)
          reject(err)
          return;
        } else {
          resolve({ id: this.lastID , changes: this.changes})
        }
      })
    })
  }

  insert(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.log('Error running sql ' + sql)
          console.log(err)
          reject(err)
          return;
        } else {
          resolve({ id: this.lastID })
        }
      })
    })
  }

  update(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.log('Error running sql ' + sql)
          console.log(err)
          reject(err)
          return;
        } else {
          resolve({ id: this.changes })
        }
      })
    })
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.log('Error running sql: ' + sql);
          console.log(err);
          reject(err);
          return;
        } 
        resolve(row);
      })
    })
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.log('Error running sql: ' + sql)
          console.log(err)
          reject(err)
          return;
        } else {
          resolve(rows)
        }
      })
    })
  }

  delete(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.log('Error running sql ' + sql)
          console.log(err)
          reject(err)
          return;
        } else {
          resolve(true)
        }
      })
    })
  }

}

module.exports=DBHandler;
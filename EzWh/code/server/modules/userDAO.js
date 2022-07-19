class UserDAO {
    constructor(dbHandler) {
        this.dbHandler = dbHandler;
    }
    //with AppDAO
    dropTableUser(){
        return this.dbHandler.run('DROP TABLE IF EXISTS USERS');
    }

    //with App DAO
    newTableUsers(){
        return this.dbHandler.run("CREATE TABLE IF NOT EXISTS USERS(id INTEGER PRIMARY KEY, username VARCHAR, name VARCHAR,surname VARCHAR,password VARCHAR,type VARCHAR)")
    }

    async deleteAllUsers(){
        return this.dbHandler.run('DELETE FROM USERS');
    }
    //watch out. does not needed, use newUser
    // addCustomer(username,name,surname,password){
    //     const sql="INSERT INTO USERs VALUES (?,?,?,?,'Customer')";
    //     return this.dbHandler.run(sql,[username,name,surname,password]);
    // }
    newUser(username,name,surname,password,type){
        const sql="INSERT INTO USERS(USERNAME,NAME,SURNAME,PASSWORD,TYPE) VALUES (?,?,?,?,?)";
        return  this.dbHandler.run(sql,[username,name,surname,password,type]);
    }
    
    getSuppliers(){
        const sql="SELECT id,name,surname,username FROM USERS where type='supplier'";
        return this.dbHandler.all(sql);
    }
    //not to be implemented
    getUserInfo(){
        return new Promise((resolve,reject)=>{
        
        })
    }
    getSuppliersAndUser(){
        const sql="SELECT ID,NAME,SURNAME,username,type FROM USERS where type<>'manager'";
        return this.dbHandler.all(sql)
    }

    //with APPDAO
    loginUsersAPPDAO(username,password){
            const sql="SELECT * FROM USERS WHERE USERNAME=? AND PASSWORD=? AND Type='user'";
            return this.dbHandler.get(sql,[username,password])
    }
    loginManager(username,password){
            const sql="SELECT * FROM USERS WHERE USERNAME=? AND PASSWORD=? AND Type='manager'";
            return this.dbHandler.get(sql,[username,password])
    }
    loginSupplier(username,password){
            const sql="SELECT * FROM USERS WHERE USERNAME=? AND PASSWORD=? AND Type='supplier'";
            return this.dbHandler.get(sql,[username,password])
        }
    loginClerk(username,password){
            const sql="SELECT * FROM USERS WHERE USERNAME=? AND PASSWORD=? AND Type='clerk'";
            return this.dbHandler.get(sql,[username,password])
    }
    loginQE(username,password){
            const sql="SELECT * FROM USERS WHERE USERNAME=? AND PASSWORD=? AND Type='qualityEmployee'";
            return this.dbHandler.get(sql,[username,password])
    }
    loginDE(username,password){
            const sql="SELECT * FROM USERS WHERE USERNAME=? AND PASSWORD=? AND Type='deliveryEmployee'";
            return this.dbHandler.get(sql,[username,password])
    }

    modifyRights(username,newType,oldType){
            // console.log("DAti ricevuti da modify rights:",username,newType,oldType)
            const sql=`UPDATE USERS SET type=(?) WHERE username=(?) AND type=(?)`
            return this.dbHandler.run(sql,[newType,username,oldType])
        
    }
    
    async deleteUser(username,type){
        // console.log("Delete user receives",username,type)
        if(username!=undefined && type!=undefined){
            const sql="DELETE FROM USERS WHERE username=(?)"
            return await this.dbHandler.all(sql,[username])
        }
    }

    findUser(username,type){
        const sql="SELECT username,name,surname,type FROM USERS where username=(?) and type=(?)";
        return this.dbHandler.get(sql,[username,type]);
    }

    findUserById(id){
        const sql="SELECT ID from USERS where ID=?";
        return this.dbHandler.get(sql,[id]);
    }
}

module.exports=UserDAO;
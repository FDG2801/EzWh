var md5  = require("blueimp-md5")

class userService
{
    dao;
    constructor(dao)
    {
        this.dao=dao;
    }

    customerLogin= async(username,password)=>
    {
        //password=md5(password);
        const result=await this.dao.loginUsersAPPDAO(username,password)
        let user=undefined;
        if(result!=undefined)
        {
            user={
                id:result.ID,
                username:result.USERNAME,
                name:result.NAME
          }
        }
        return user;
    }

    managerLogin= async(username,password)=>
    {
        password=md5(password);
        const result=await this.dao.loginManager(username,password)
        let user=undefined;
        if(result!=undefined)
        {
            user={
                id:result.ID,
                username:result.USERNAME,
                name:result.NAME
          }
        }
        return user;
    }

    supplierLogin= async(username,password)=>
    {
        password=md5(password);
        const result=await this.dao.loginSupplier(username,password)
        let user=undefined;
        if(result!=undefined)
        {
            user={
                id:result.ID,
                username:result.USERNAME,
                name:result.NAME
          }
        }
        return user;
    }

    ClerkLogin= async(username,password)=>
    {
        password=md5(password);
        const result=await this.dao.loginClerk(username,password)
        let user=undefined;
        if(result!=undefined)
        {
            user={
                id:result.ID,
                username:result.USERNAME,
                name:result.NAME
          }
        }
        return user;
    }

    QualityLogin= async(username,password)=>
    {
        password=md5(password);
        const result=await this.dao.loginQE(username,password)
        let user=undefined;
        if(result!=undefined)
        {
            user={
                id:result.ID,
                username:result.USERNAME,
                name:result.NAME
          }
        }
        return user;
    }

    DeliveryLogin= async(username,password)=>
    {
        password=md5(password);
        const result=await this.dao.loginDE(username,password)
        let user=undefined;
        if(result!=undefined)
        {
            user={
                id:result.ID,
                username:result.USERNAME,
                name:result.NAME
          }
        }
        return user;
    }

    findUser= async (username,type)=>
    {
        
        const result=await this.dao.findUser(username,type)
        // console.log("finduser",result)
        // //better search
        // if(result==undefined){
        //     let listofuser=await this.dao.getSuppliersAndUser();
        //     console.log("This is listof user", listofuser)
        // }
        return result;
    }

    addUser=async (username,name,surname,password,type)=>
    {
        const user=await this.findUser(username,type);
        if(user!== undefined)
            return -1;

        password=md5(password);
        const result=await this.dao.newUser(username,name,surname,password,type)
        return result;
    }

    getSuppliers=async()=>
    {
        const result=await this.dao.getSuppliers();
        return result;
    }

    getSuppliersAndUser=async()=>
    {
        const result=await this.dao.getSuppliersAndUser();
        const users=result.map((user)=>(
            {
                id:user.id,
                username:user.username,
                email : user.username,
                name:user.name,
                type : user.type
            }))
        return users;
    }

    modifyUserPermissions=async(username,oldType,newType)=>
    {
        //console.log("Datas", username, oldType, newType)
        const user=await this.findUser(username,oldType);
        // console.log("this is user",user)
        if(user===undefined)
            return -1; //no username in the db
        const result=await this.dao.modifyRights(username,newType,oldType)
        // console.log("result from user Service",result)
        return result;
    }

    deleteUser= async(username,type)=>
    {
        // let check=await this.dao.getSuppliersAndUser()
        // console.log(check)
        // // for(let i=0;i<check.length;i++){
        // //     if(check[i].username==username && check[i].type==type)
        // //         return 2;
        // // }
        // console.log(username,type)
        // const user=await this.findUser(username,type); //ok
        // console.log("User trovato da delete user",user)
        // if(user=== undefined)
        //     return -1;
        const result=await this.dao.deleteUser(username,type);
        return result
    }
}

module.exports=userService;
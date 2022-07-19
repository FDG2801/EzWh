
const DBHandlerDAO = require('../modules/DBHandler');
const UserDAO = require('../modules/userDAO');
const dbHandler=new DBHandlerDAO('EzWhDB');
const userDAOHandler=new UserDAO(dbHandler);

describe('Test userDAO',()=>{
    beforeAll(async()=>{
        await userDAOHandler.dropTableUser();
        await userDAOHandler.newTableUsers()
        await dbHandler.run("DELETE FROM USERS")
    });

    test('Delete all entries',async()=>{
        let result=await userDAOHandler.getSuppliersAndUser();
        expect(result.length).toStrictEqual(0);
    });

    testNewUser("FDG@fdg.it","Francesco","DiGangi","123","admin") //ok
    testModifyUser("test@test.it","admin","tester") //ok
    testDeleteUser("test@test.it","tester")
    testGetSuppliers();
    testGetSuppliersAndUser();
    testDeleteAllUser()
})

function testNewUser(username,name,surname,password,type){
    test('Add new user',async()=>{
        let lastID=await userDAOHandler.newUser(username,name,surname,password,type);
        expect(lastID.id).toBeTruthy();
    });
}

function testModifyUser(username,newType,oldType){
    test('Change the role of a given user',async()=>{
        //I add a user
        let userTest=await userDAOHandler.newUser("test@tested.it","tested","testing","123test","tester");
        let res=await userDAOHandler.modifyRights(username,newType,oldType);
        expect(res.TYPE).toStrictEqual(this.newType);
    })
}

function testDeleteUser(username,type){
    test('Delete a user given his username and his type',async()=>{
        let userTest=await userDAOHandler.newUser("test","tested","testing","123test","tester");
        let res=await userDAOHandler.deleteUser(username,type);
        expect(res.USERNAME).toStrictEqual(this.username);
        expect(res.TYPE).toStrictEqual(this.type);
    })
}

function testGetSuppliers(){
    test('Get all the supplier in the database',async()=>{
        let res=await userDAOHandler.getSuppliers();
        expect(res).toBeTruthy();
    })
}

function testGetSuppliersAndUser(){
    test('Get all the supplier and user in the database',async()=>{
        let res=await userDAOHandler.getSuppliersAndUser();
        expect(res).toBeTruthy();
    })
}

function testDeleteAllUser(){
    test('Delete all the users',async()=>{
        let res=await userDAOHandler.deleteUser();
        expect(res).toEqual(undefined);
    })
}
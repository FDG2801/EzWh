const UserService = require('../services/userService');
const DBHandler = require('../modules/DBHandler');
const UserDAO = require('../modules/userDAO');
const dbHandler=new DBHandler('EzWhDB.db')
const userHandler = new UserDAO(dbHandler);
const user_service = new UserService(userHandler);
//find user by username and type
describe("get user",()=>{
    beforeEach(async()=>{
        await userHandler.dropTableUser();
        await userHandler.newTableUsers();
        await userHandler.newUser('user1@ezwh.com', 'user1', 'user',"password",'user');
    });

    testUser('user1@ezwh.com', 'user1', 'user',"testpassword",'user');
});

async function testUser(username, name, surname, password,type) {
    test('find user by username and type', async () => {
        let res = await user_service.findUser(username,type);
        expect(res.username).toEqual(username);
        expect(res.name).toEqual(name);
        expect(res.surname).toEqual(surname);
        expect(res.type).toEqual(type);
        
    });
}

//add a new user to database
describe("create a new user",()=>{
    beforeEach(async()=>{
        await userHandler.dropTableUser();
        await userHandler.newTableUsers();
        await userHandler.newUser('Zlatan@Zlatan.it', 'Zlatan', 'Ibrahimovic',"password",'admin');
    })

    testCreateUser('Zlatan@Zlatan.it', 'Zlatan', 'Ibrahimovic',"password",'admin');
})

async function testCreateUser(username,name,surname,password,type){
    test('creating a new user and testing',async()=>{
        let res=await user_service.addUser(username,name,surname,password,type);
        expect(res.username).toEqual(this.username);
        expect(res.name).toEqual(this.name);
        expect(res.surname).toEqual(this.surname);
        expect(res.password).toEqual(this.password);
        expect(res.type).toEqual(this.type);
    })
}

//modify role of a user given its former role
describe('Modify rights of a user',()=>{
    beforeEach(async()=>{
        await userHandler.newUser('user1@ezwh.com', 'user1', 'user',"password",'user');
    });

    testModifyRights("user1@ezwh.com","user","customer");
});

async function testModifyRights(username,newType,oldType){
    test('modife from admin -> manager',async()=>{
        let res=await user_service.modifyUserPermissions(username,newType,oldType);
        expect(res.username).toEqual(this.username);
    })
}

//deleting an existing user
describe('Delete a user given its type and username',()=>{
    beforeEach(async()=>{
        let res=await userHandler.getSuppliersAndUser();
        if (res.length==0){
            console.log("error, no users in db");
            return;
        }
        await userHandler.newUser('user1@ezwh.com', 'user1', 'user',"password",'user');
    });
    testDeleteUser('user1@ezwh.com','user')
});

async function testDeleteUser(username,type){
    test('deleting a user',async()=>{
        let res=await user_service.deleteUser(username,type);
        expect(res.username).toEqual(this.username);
    })
}

//login user test
describe('Login of a user',()=>{
    beforeAll(async()=>{
        await userHandler.dropTableUser();
        await userHandler.newTableUsers();
        await userHandler.newUser('user1@ezwh.com', 'user1', 'user',"testpassword",'user');
    });
    //password=md5("testpassword")
    testLoginUser('user1@ezwh.com','testpassword');
});

async function testLoginUser(username,password){
    test('user log-in',async()=>{
        let res=await user_service.customerLogin(username,password);
        //password=md5(password)
        console.log(res)
        expect(res.username).toEqual(this.username);
    })
}

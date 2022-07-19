const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
chai.expect();

const app = require('../server');
var agent = chai.request.agent(app);

const DBHandler = require('../modules/DBHandler');
const dbHandler = new DBHandler('EzWhDB.db');
const SKUDAO=require('../modules/SKUDAO');
const skyHandler=new SKUDAO(dbHandler);
const ItemDAO=require('../modules/itemDAO');
const UserDAO = require('../modules/userDAO');
const itemHandler=new ItemDAO(dbHandler);
const userHandler=new UserDAO(dbHandler)

//integration findItemByProps
describe('Retrieve an item by its id',()=>{
    before(async()=>{
        try{
            await itemHandler.dropTable();
            await itemHandler.createTableItem();
            await dbHandler.run("DELETE FROM ITEMS");
            await itemHandler.createNewItem(1,"description_item_1","13.99","1","1")
            await itemHandler.createNewItem(2,"description_item_2","13.99","2","2")
        }
        catch(e){
            console.log(e)
        }
    });

    after(async()=>
    {
        try{
            await itemHandler.dropTable();
            await itemHandler.createTableItem();
            await dbHandler.run("DELETE FROM ITEMS");
        }
        catch(e){
            console.log(e)
        }
    })
    
    
    testFindItem(200, 1, 1)
    testFindItem(404, 20,50)
    testFindItem(422)
    testModifyItemByIdAndSupplierId(200,1,1,"newDesc","10")
    testDeleteItemByIdAndSupplierId(204,1,1)
    //itemHandler.createNewItem(1,"description_item_1","13.99","1","1")
    
 })

 //new api: ok /api/items/:id/:supplierId
function testFindItem(expectedStatus,id,supplierId){
    it('Should find an existing item by its id',function(done){
        if(id!==undefined){
            agent.get(`/api/items/${id}/${supplierId}`)
            .then(function(res){
                res.should.have.status(expectedStatus);
                done();
            })
        }
        else{ //id undefined
            agent.get(`/api/items/${id}/${supplierId}`) //not sending data
            .then(function(res){
                res.should.have.status(expectedStatus);
                done();
            })
        }
    })
}

//new test: delete item by id and supplier id = ok
function testDeleteItemByIdAndSupplierId(expectedStatus,id,supplierId){
    it('Delete item by its id and supplier id',function(done){
        if(id!==undefined && supplierId!==undefined){
            agent.delete(`/api/items/${id}/${supplierId}`)
            .then(function(res){
                res.should.have.status(expectedStatus);
                done();
            })
        }
        else{ //id undefined
            agent.delete(`/api/items/${id}/${supplierId}`) //not sending data
            .then(function(res){
                res.should.have.status(expectedStatus);
                done();
            })
        }
    })
}

// describe.only('Modify a position by its old id',()=>{
//     before(async()=>{
//         try{
//             await itemHandler.dropTable()
//             await itemHandler.createTableItem();
//             await dbHandler.run("DELETE FROM ITEMS")
//             await itemHandler.createNewItem(1,"description_item_1","13.99","1","1")
//             // console.log("rs")
//             // console.log(res)
//             // res=await positionHandler.getPositions()
//             // console.log(res)
//         }
//         catch(e){
//             console.log(e)
//         }
//         //positionID,aisleID,row,col,maxWeight,maxVolume -> parameters
//         //let res=positionHandler.getPositions(); //verify that are not zero
//     })
//     //positionHandler.createNewPosition(3337,1,2,3,4,5);
    
//     /testModifyItemByIdAndSupplierId(200,1,"1","description","10")
// })

//new test: modify item by id and supplier id  - timeout problem
function testModifyItemByIdAndSupplierId(expectedStatus,id,supplierId,newDescription,newPrice){
    it('Modify item by its id and supplier id',function(done){
     // all tests in this suite get 10 seconds before timeout
        if(id!==undefined && supplierId!==undefined){
            console.log("qui") //ok
            console.log("params",id,supplierId,newDescription,newPrice)
            let item={
                id:id,
                supplierId:supplierId,
                newDescription:newDescription,
                newPrice:newPrice
            }
            agent.put(`/api/item/${id}/${supplierId}`)
            .send(item)
            .then(function(res){
                console.log("qui 2")
                //console.log(res)
                res.should.have.status(expectedStatus);
                done();
            }).catch(done)
        }
    })
}

//createNewItem
describe('Create a new item',()=>{
    before(async()=>{
        try{

            await itemHandler.dropTable();
            await itemHandler.createTableItem();
            await dbHandler.run("DELETE FROM ITEMS");

            //sku is a parent
            await skyHandler.dropTableSKU();
            await skyHandler.createTableSKU();

            await dbHandler.run("DELETE FROM SKU ; delete from sqlite_sequence where name='SKU'")
            await skyHandler.addSKU("this is a sku",60,80,"no notes",15.99,10)
            await skyHandler.addSKU("this is a sku2",60,80,"no notes",15.99,10)
            await skyHandler.addSKU("this is a sku3",60,80,"no notes",15.99,10)
        }
        catch(e){
            console.log(e)
        }
        try{
            //sku is a parent
            await userHandler.dropTableUser();
            await userHandler.newTableUsers();
            await userHandler.deleteAllUsers();
            await userHandler.newUser("test@test.it","tester","tester","testpassword","user")
            await userHandler.newUser("test2@test.it","tester","tester","testpassword","user")
        }
        catch(e){
            console.log(e)
        }
    });

    after(async()=>{
        try{

            await itemHandler.dropTable();
            await itemHandler.createTableItem();
            await dbHandler.run("DELETE FROM ITEMS");

            //sku is a parent
            await skyHandler.dropTableSKU();
            await skyHandler.createTableSKU();

            await dbHandler.run("DELETE FROM SKU ; delete from sqlite_sequence where name='SKU'")
        }
        catch(e){
            console.log(e)
        }
    });

    testCreateNewItem(201,10,"description","10",3,1); 
    testCreateNewItem(422); 
    testCreateNewItem(201,12,"description","11",2,293)
    testCreateNewItem(201,13,"description","12",270,1)
})

function testCreateNewItem(expectedStatus,id,description,price,SKUId,supplierId){
    it('Should add a new item in the collection',function(done){
        if(id!==undefined){
            console.log("id passed verification");
            let item={
                id:id,
                description:description,
                price:price,
                SKUId:SKUId,
                supplierId:supplierId
            }
            agent.post(`/api/item`)
            .send(item)
            .then(function(res){
                //console.log(res)
                res.should.have.status(expectedStatus);
                done();
            }).catch(done);
        }
        else{ //id or type undefined
            agent.post('/api/newUser/') //not sending data
            .then(function(res){
                res.should.have.status(expectedStatus);
                done();
            }).catch(done);
        }
    })
}

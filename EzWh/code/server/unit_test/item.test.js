const DBHandlerDAO = require('../modules/DBHandler');
const dbHandler=new DBHandlerDAO('EzWhDB.gb');
const ItemDAO=require('../modules/itemDAO');
const SKUDAO=require("../modules/SKUDAO");
const UserDAO = require('../modules/userDAO');
const itemDAOHandler=new ItemDAO(dbHandler);
const skuDAOHandler=new SKUDAO(dbHandler);
const userDAOHandler=new UserDAO(dbHandler);

describe('Test ItemDAO',()=>{
    beforeAll(async()=>{
        try{
            await itemDAOHandler.dropTable();
            await itemDAOHandler.createTableItem();
            await dbHandler.run("DELETE from ITEM");
        }
        catch(e){
            console.log(e)
        }
        //clear parent tables
        try{
            //user is a parent
            await userDAOHandler.dropTableUser();
            await userDAOHandler.newTableUsers();
            await userDAOHandler.newUser("ATestUser@gmail.com",'Tester',"Test","testpasword","tester")
        }
        catch(e){
            console.log(e)
        }
        try{
            //sku is a parent
            await skuDAOHandler.dropTableSKU();
            await skuDAOHandler.createTableSKU();
            await skuDAOHandler.addSKU("this is a sku",60,80,"no notes",15.99,10)
        }
        catch(e){
            console.log(e)
        }
    });

    test('Delete all entries',async()=>{
        let result
        try{
            await itemDAOHandler.dropTable();
            await itemDAOHandler.createTableItem();
            await dbHandler.run("DELETE from ITEMS");
        }
        catch(e){
            console.log(e)
        }

        try{
            //user is a parent
            await userDAOHandler.dropTableUser();
            await userDAOHandler.newTableUsers();
            await userDAOHandler.newUser("ATestUser@gmail.com",'Tester',"Test","testpasword","tester")
        }
        catch(e){
            console.log(e)
        }
         

        try{
            //sku is a parent
            await skuDAOHandler.dropTableSKU();
            await skuDAOHandler.createTableSKU();
            await skuDAOHandler.addSKU("this is a sku",60,80,"no notes",15.99,10)
        }
        catch(e){
            console.log(e)
        }
        try{
        result=await itemDAOHandler.getItems();
        }
        catch(e){
            console.log(e)
        }
        expect(result.length).toStrictEqual(0);
    })

    testNewItem("1","an item", "small price",1,1) //ok 
    //string,string,string,int,int
    testGetSpecificItem(1,1); //ok
    testGetIdByProps(1,"an item2","small price2",1) //ok
    testModifyItemDescriptionPrice(1,"actuallyitem1","actuallybigprice1"); //ok
    testDeleteItem(1,1);
});

function testNewItem(id,description,price,SKUId,supplierId){
    test('Add new item',async()=>{
        let lastID=await itemDAOHandler.createNewItem(id,description,price,SKUId,supplierId);
        expect(lastID.id).toBeTruthy();
    })
}

function testGetIdByProps(skuid,descr,price,suppid){
    test('Getting item id from props',async()=>{
        let itemTest=await itemDAOHandler.createNewItem("2","an item2", "small price2",1,1);
        let res=await itemDAOHandler.getIDbyProps(skuid,descr,price,suppid);
        expect(res.ITEMID).toStrictEqual(itemTest.ITEMID);
    })
}

//new api: ok
function testGetSpecificItem(id,supplierId){
    test('Get a specific item given its id',async()=>{
        let res=await itemDAOHandler.getSpecificItemByIdAndSupplier(id,supplierId);
        console.log("res di get spec it",res)
        expect(this.id).toStrictEqual(res.ID);
        expect(supplierId).toStrictEqual(res.supplierId)
    })
}

function testModifyItemDescriptionPrice(id,supplierId,newDescription,newPrice){
    test('Modify description and price of an item given its id',async()=>{
        let res=await itemDAOHandler.modifyItemByIdAndSupplierId(id,supplierId,newDescription,newPrice);
        expect(this.newDescription).toStrictEqual(res.DESCRIPTION);
        expect(this.newPrice).toStrictEqual(res.PRICE);
    })
}

//new api: ok
function testDeleteItem(id,supplierId){
    test('Delete an item given its id and supplierId',async()=>{
        let res=await itemDAOHandler.deleteItemByIdAndSupplier(id,supplierId);
        expect(this.id).toStrictEqual(res.ID);
        expect(this.supplierId).toStrictEqual(res.supplierId);
    })
}
const ItemService = require('../services/itemService');
const DBHandler = require('../modules/DBHandler');
const ItemDAO = require('../modules/itemDAO');
const SKUDAO=require('../modules/SKUDAO')
const dbHandler=new DBHandler('EzWhDB.db')
const itemHandler = new ItemDAO(dbHandler);
const skyHandler=new SKUDAO(dbHandler)
const item_service = new ItemService(itemHandler,skyHandler);


describe('Getters items: 1. getIDbyProps(skuid,descr,price,suppid); 2. getSpeficicItem(id)',()=>{
    beforeEach(async()=>{
        await itemHandler.dropTable();
        await itemHandler.createTableItem();
        await dbHandler.run("DELETE FROM ITEMS");
        await itemHandler.createNewItem(1,"item 1","6.1","1","1")
        await itemHandler.createNewItem(2,"item 2","7.1","1","1")
    });

    testGetIdByProps("1","item 1","6.1","1"); //ok
    testGetIdByProps(1,"item 1",6.1,1); //ok. casting automatically
    //testGetIdByProps(1,"item 1",6.1); //an parameter is missing so failed obv
    //testGetIdByProps(1,"item1",6.1,1,1) //fail cause its empty result ok
    testGetItemByID(2,1)
    //testGetItemByID("2") //fails because i don't pass a number
});

 function testGetIdByProps(skuid,descr,price,suppid){
    test('1. testing getIDbyProps',async()=>{
        let res=await item_service.findItemByProps(skuid,descr,price,suppid);
        if(res.length==0){
            throw new Error('Test failed')
        }
        expect(res).toBeTruthy();
    })
}

//new api: ok
 function testGetItemByID(id,supplierId){
    test('2. testing getItemByID',async()=>{
        let res=await item_service.findItemByIdAndSupplier(id,supplierId);
        expect(res.id).toStrictEqual(id);
        expect(res.supplierId).toStrictEqual(supplierId)
    })
}

describe('Adding a new item',()=>{
    beforeAll(async()=>{
        try{
            //sku is a parent
            await dbHandler.run("drop table if exists TESTDESCRIPTOR", []);
            await dbHandler.run("create table if not exists TESTDESCRIPTOR(ID INTEGER PRIMARY KEY,NAME TEXT,PROCEDUREDESCRIPTION TEXT, IDSKU INTEGER,FOREIGN KEY(IDSKU) REFERENCES  SKU(ID))");
            await skyHandler.dropTableSKU();
            await skyHandler.createTableSKU();
            await dbHandler.run("DELETE FROM SKU")
            await skyHandler.addSKU("this is a sku",60,80,"no notes",15.99,10)
        }
        catch(e){
            console.log(e)
        }
    });
    testAddItem(11,"description item10","12.99",1,1); //ok
});

 function testAddItem(id,description,price,SKUId,supplierId){
    test('1. adding new item',async()=>{
        let res=await item_service.addItem(id,description,price,SKUId,supplierId);
        expect(res).toBeTruthy();
    })
}

describe('Modify the description and the price of a specific item by id and supplier id',()=>{
    beforeEach(async()=>{
        await itemHandler.dropTable();
        await itemHandler.createTableItem();
        await dbHandler.run("DELETE FROM ITEMS");
        await itemHandler.createNewItem(9,"description_item_9","13.99",1,1)
    });

    testModifyItemDescription(9,1,"description_item_10","15.99");
});

//new api: ok
 function testModifyItemDescription(id,supplierId,newDescription,newPrice){
    test('1. modifying description and price ',async()=>{
        let res=await item_service.updateItemByIdAndSupplierId(id,supplierId,newDescription,newPrice);
        let resToCheck=await itemHandler.getSpecificItemByIdAndSupplier(id,supplierId);
        console.log(resToCheck)
        let stringprice=+newPrice
        expect(resToCheck.description).toStrictEqual(newDescription);
        expect(resToCheck.price).toStrictEqual(stringprice);
    })
}


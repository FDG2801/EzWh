'use strict';
//Imports
const express = require('express');
var path = require('path');
var dependencycruiser=require('dependency-cruiser')
//middleware and json settings
const bodyParser = require('body-parser'); // middleware


var SKUsRouter=require('./routes/SKUs')
var SKUItemsRouter=require('./routes/SKUItems')
var TestDescriptorsRouter=require('./routes/TestDescriptors')
var PositionRouter=require('./routes/Positions')
var UserRouter=require('./routes/Users')
var RestockOrderRouter=require('./routes/RestockOrders')
var ReturnOrderRouter=require('./routes/ReturnOrders')
var ItemsRouter=require('./routes/Items')
var InternalOrdersRouter=require('./routes/InternalOrders')
const userDAOHandler=require('./modules/userDAO');
//const prova=new userDAOHandler('EzWhDB.db')
const UserService = require('./services/userService');
const DBHandler = require('./modules/DBHandler');
const UserDAO = require('./modules/userDAO');
const userService = require('./services/userService');
const dbHandler=new DBHandler('EzWhDB.db')
const userHandler = new UserDAO(dbHandler);
const user_service = new UserService(userHandler);

const internalOrdDao=require('./modules/internalOrdDAO')
const internalOrdHandler=new internalOrdDao(dbHandler)

const itemDAO=require('./modules/itemDAO')
const itemHandler=new itemDAO(dbHandler)
// itemHandler.dropTable();
// itemHandler.createTableItem();
const positionDAO=require('./modules/positionDAO')
const positionHandler=new positionDAO(dbHandler)
// positionHandler.dropTablePositions();
// positionHandler.newTablePositions();
const restockOrdDAO=require('./modules/restockOrdDAO')
const restockOrdHandler=new restockOrdDAO(dbHandler)

const returnOrdDAO=require('./modules/returnOrdDAO')
const returnOrdHandler=new returnOrdDAO(dbHandler)

const SKUDAO=require('./modules/SKUDAO')
const SKUHandler=new SKUDAO(dbHandler)
// SKUHandler.dropTableSKU();
// SKUHandler.createTableSKU();
const SKUItemDAO=require('./modules/SKUItemDAO')
const SKUItemHandler=new SKUItemDAO(dbHandler)

const testDescriptorDAO=require('./modules/testDescriptionDAO')
const testDescriptionHandler=new testDescriptorDAO(dbHandler)

const testResultDAO=require('./modules/testResultDAO')
const testResultHandler=new testResultDAO(dbHandler)

// const user_service = new UserService(userHandler);
// user_service.addUser('user1@ezwh.com','John', 'Smith', 'password', 'customer')
// user_service.addUser("qualityEmployee1@ezwh.com","qualityEmployee1","quality employee","testpassword","quality employee")
// user_service.addUser("clerk1@ezwh.com","clerk1","clerk","testpassword","clerk")
// user_service.addUser("deliveryEmployee1@ezwh.com","deliveryEmployee1","delivery employee","testpassword","delivery employee")
// user_service.addUser("supplier1@ezwh.com","supplier1","supplier","testpassword","supplier")
// user_service.addUser("manager1@ezwh.com","manager1","manager","testpassword","manager")
//************* */
// init express
function initUsers()
{
  userHandler.newUser("user1@ezwh.com","user1","user","testpassword","user"),
  userHandler.newUser("qualityEmployee1@ezwh.com","qualityEmployee1","quality employee","testpassword","quality employee"),
  userHandler.newUser("clerk1@ezwh.com","clerk1","clerk","testpassword","clerk"),
  userHandler.newUser("deliveryEmployee1@ezwh.com","deliveryEmployee1","delivery employee","testpassword","delivery employee"),
  userHandler.newUser("supplier1@ezwh.com","supplier1","supplier","testpassword","supplier"),
  userHandler.newUser("manager1@ezwh.com","manager1","manager","testpassword","manager")
}

//empty db
function emptyDb(){
  // // //empty user
  //userHandler.dropTableUser()
  

  // // //empty skuhandler
  // SKUHandler.dropTableSKU();
  

  // // //copmleted orders
  // restockOrdHandler.dropTableRstckOrders();
  

  // // //skuitem
  // // SKUItemHandler.dropTableSKUITEM();
  // SKUItemHandler.createTableSKUITEM();
  //userHandler.newTableUsers();
  // SKUHandler.createTableSKU();
  // restockOrdHandler.newTableRestockOrders();
  // }
}

const app = new express();  
const port = 3001;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());


app.use('/api',SKUsRouter);
app.use('/api',SKUItemsRouter);
app.use('/api',TestDescriptorsRouter);
app.use('/api',PositionRouter);
app.use('/api',UserRouter);
app.use('/api',RestockOrderRouter);
app.use('/api',ReturnOrderRouter);
app.use('/api',ItemsRouter);
app.use('/api',InternalOrdersRouter);



/*-------------TEST************** */
//GET /api/test
app.get('/api/hello', (req,res)=>{
  let message = {
    message: 'Hello World!'
  }
  return res.status(200).json(message);
});

emptyDb();

// activate the server - must stay ehre
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);

  
  //.then(()=>initUsers())
  SKUHandler.createTableSKU()
  testDescriptionHandler.createTableTESTDESCRIPTOR()
  SKUItemHandler.createTableSKUITEM()
  testResultHandler.createTableTESTRESULT()
  userHandler.newTableUsers()
  itemHandler.createTableItem()
  positionHandler.newTablePositions()
  
  internalOrdHandler.newTableInternalOrders()
  .then(()=> internalOrdHandler.newTableIssuedItems()
  .then(()=> internalOrdHandler.newTableCompletedItems()))

  restockOrdHandler.newTableRestockOrders()
  .then(()=> restockOrdHandler.newTableROSKUItems()
  .then(()=> restockOrdHandler.newTableROProducts()))
  
  returnOrdHandler.newTableReturnOrd()
  .then(()=>returnOrdHandler.newTableReturnSkuItem());

});

module.exports = app;
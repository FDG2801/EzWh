var express=require('express');
var router=express.Router();

const {check, validationResult} = require('express-validator');
const DBHandler = require('../modules/DBHandler');
const dbHandler=new DBHandler('EzWhDB.db');

const ItemDAO=require('../modules/itemDAO');
const itemHandler=new ItemDAO(dbHandler);

const SKUDAO=require('../modules/SKUDAO');
const SKUHandler=new SKUDAO(dbHandler);

const UserDAO=require('../modules/userDAO');
const userHandler=new UserDAO(dbHandler);

const ItemService=require('../services/itemService');
const itemService=new ItemService(itemHandler,SKUHandler,userHandler);

//------------------ITEM APIS-------------------------------
/*

 * GET:
 * -getAllItems()
 * -getSpecifigItem(id)
 * POST:
 * -createNewItem(...)
 * PUT:
 * -modifyAnItem(id) -> modifies price and description
 * DELETE:
 * -deleteAnItem(id)
 */

//get all items
router.get('/items', async (req,res)=>{
  try
  {
    const result=await itemService.getItems();
    res.status(200).json(result);
  }
  catch(err)
  {
    console.log(err);
    res.status(500).json("Internal Server Error");
  }
  })
  
  //API MODIFIED
  router.get('/items/:id/:supplierId',
  [
    check('id').isInt(),
    check('supplierId').isInt(),
  ], async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
      res.status(422).json({errors: errors.array()});

    try
    {
      const id = Number(req.params.id);
      const supplierId=req.params.supplierId;
      const result= await itemService.findItemByIdAndSupplier(id,supplierId);
      if(result!==undefined)
        res.status(200).json(result);
      else
        res.status(404).json({message:"Not Found"});
    }
    catch(err)
    {
      //console.log(err);
       res.status(500).json({message:"Internal Server Error"});
    }
  })
  
  //double check
  router.post('/item',
  [
    check('id').notEmpty().isInt(),
    check('description').notEmpty(),
    check('price').notEmpty(),
    // check('SKUId').isInt({min:0}),
    // check('supplierID').isInt({min:0}),
  ] ,async (req,res)=>{
    console.log("req body",req.params);
    const errors = validationResult(req);
    if(!errors.isEmpty())
     res.status(422).json({errors: errors.array()});

    try{
      let id=req.body.id;
      console.log("id",id)
      let description=req.body.description;
      let price=req.body.price;
      let SKUId=req.body.SKUId;
      if(SKUId==null) SKUId=undefined;
      let supplierId=req.body.supplierId;
      if(supplierId==null) supplierId=undefined;
      console.log("skuid e supplierid",SKUId," ",supplierId)
      let cont=0;
      let listofitem=await itemHandler.getItems()
      let listSupplier=await userHandler.getSuppliers();
      //item duplicato
      for (let i=0;i<listofitem.length;i++){
          if(id==listofitem[i].itemid){
            res.status(404).json({error: `There was an error on the key`})
            return;
          }
        }
      let skuItemList=await SKUHandler.getAll();
      console.log("Lista skus",skuItemList)
      const result= await itemService.addItem(id,description,price,SKUId,supplierId)
      console.log("Result in item.js",result)
      if(result==-1)
        res.status(404).json({error: `SKUId not existing`})
      if(result==-2)
        res.status(404).json({error: `this supplier already sells an item with the same SKUId`})
      if(result==-3)
        res.status(404).json({error: `this supplier already sells an Item with the same ID`})
      if(result==-4)
        res.status(404).json({error: `no such user`})
      if(result)
        res.status(201).json({message: 'ok'})
    }
    catch(err)
    {
      //console.log("Error",err)
      res.status(503).json({message: err});
    }
  })
  
  router.put('/item/:id/:supplierId',
  [
    check('id').notEmpty().isInt(),
    check('supplierId').isInt(),
    check('newDescription').notEmpty(),
    check('newPrice').notEmpty().isFloat({min:0}),
  ]
  , async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
       res.status(422).json({errors: errors.array()});

      try{

          if (Object.keys(req.body).length === 0) 
           res.status(422).json({error: `Empty body request`});

          let id=req.params.id //itemid
          let supplierId=req.params.supplierId
          let newDescription=req.body.newDescription
          let newPrice=req.body.newPrice

        const result=await itemService.updateItemByIdAndSupplierId(id,supplierId,newDescription,newPrice)
        if(result==-1){
          res.status(404).json({error: `Item not existing`})
          return;
        }
        else{
          if(result){
          res.status(200).json({message:"Done"})
          return;
        }
      }
      }
      catch(err)
      {
        console.log(err);
         res.status(503).json({message:"Internal Server Error"});
         return;
      }

  })
  
  router.delete('/items/:id/:supplierId',
  [
    check('id').notEmpty().isInt(),
    check('supplierId').isInt(),
  ]
  , async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
      res.status(422).json({errors: errors.array()});
      return;
    }
       

      try
      {
        let id=Number(req.params.id);
        const supplierId=req.params.supplierId
        var result= await itemService.deleteItemWithSupplier(id,supplierId);
        if(result==-1){
          res.status(404).json({error: `Item not existing`});
          return;
        }
        if(result!=-1){
          res.status(204).json({message:"Done"});
          return;
        }
          
      }
      catch(err)
      {
        console.log(err);
         res.status(503).json({message:"Internal Server Error"});
         return;
      }
  })

  module.exports=router;
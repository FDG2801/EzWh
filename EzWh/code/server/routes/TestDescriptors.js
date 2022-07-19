var express=require('express');
var router=express.Router();

const {check, validationResult} = require('express-validator');
const DBHandler = require('../modules/DBHandler');
const testDescriptorDAO=require('../modules/testDescriptionDAO');
const TestDescriptorService=require('../services/testDescriptorService')

const dbHandler=new DBHandler('EzWhDB.db');
const SKUDAO=require('../modules/SKUDAO');
const SKUHandler=new SKUDAO(dbHandler);
const SKUService=require('../services/SKUService')
const skuService=new SKUService(SKUHandler);


const testDescriptionHandler=new testDescriptorDAO(dbHandler);
const testDescriptorService=new TestDescriptorService(testDescriptionHandler);

//*********testDescriptor API ****************/

router.get('/testDescriptors', async (req,res)=>{
  try
  {
    const result=await testDescriptorService.getTestDescriptors();
    return res.status(200).json(result);
  }
  catch(err)
  {
    console.log(err);
    return res.status(500).json("Internal Server Error");
  }
  })
  
  router.get('/testDescriptors/:id', 
  [
    check('id').isInt()
  ],async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});

    try
    {
      const id = Number(req.params.id);
      const result= await testDescriptorService.findTestDescriptor(id);
      if(result!==undefined)
          return res.status(200).json(result);
      else
          return res.status(404).json("Not Found");
    }
    catch(err)
    {
      console.log(err);
      return res.status(500).json("Internal Server Error");
    }
  })

  router.post('/testDescriptor',[
    check('name').exists({checkFalsy: true}),
    check('procedureDescription').exists({checkFalsy: true}),
    check('idSKU').notEmpty().isInt()
  ], async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});

    try{
      if (Object.keys(req.body).length === 0) 
      return res.status(422).json({error: `Empty body request`});

    const test = req.body;

    const sku= await skuService.findSKU(test.idSKU);
    if(sku===undefined)
        return res.status(404).json("SKU Not Found");
      
    const result=await testDescriptorService.addTestDescriptor(test.name,test.procedureDescription,test.idSKU)
    if(result.id>0)
      return res.status(201).end()
    else
      return res.status(503).end()
    }
    catch(err)
    {
      console.log(err);
      return res.status(503).json("Internal Server Error");
    }
  })
  
  router.put('/testDescriptor/:id', 
  [
    check('id').isInt(),
    check('newName').exists({checkFalsy: true}),
    check('newProcedureDescription').exists({checkFalsy: true}),
    check('newIdSKU').notEmpty().isInt()
  ],async (req,res)=>{
    
    const errors = validationResult(req);
    if(!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});

    try{
      if (Object.keys(req.body).length === 0) 
      return res.status(422).json({error: `Empty body request`});
    
      const id = Number(req.params.id);
      const test = req.body;

      const sku= await skuService.findSKU(test.newIdSKU);
      if(sku===undefined)
          return res.status(404).json("SKU Not Found");

    const result=await testDescriptorService.updateTestDescriptor(id,test.newName,test.newProcedureDescription,test.newIdSKU)
    if(result==-1)
      return res.status(404).json({error: `TestDescriptor not existing`})
    if(result.id>0)
      return res.status(200).end()
    else
      return res.status(503).end()
    }
    catch(err){
      console.log(err);
      return res.status(503).json("Internal Server Error");
    }
  })
  
  router.delete('/testDescriptor/:id',
  [
    check('id').isInt()
  ], async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});
      
    try
    {
      let id=Number(req.params.id);
      var result= await testDescriptorService.deleteTestDescriptor(id);
      if(result==-1)
          return res.status(404).json({error: `TestDescriptor not existing`})
      if(result)
          return res.status(204).end();
      else
          return res.status(503).end();
    }
    catch(err)
    {
      console.log(err);
      return res.status(503).json("Internal Server Error");
    }
  })

  module.exports=router;
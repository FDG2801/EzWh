const { isDayjs } = require('dayjs');
var express=require('express');
var router=express.Router();

const {check, validationResult} = require('express-validator');
const DBHandler = require('../modules/DBHandler');
const SKUItemDAO=require('../modules/SKUItemDAO');
const SKUDAO=require('../modules/SKUDAO');
const testResultDAO=require('../modules/testResultDAO');
const testDescriptorDAO=require('../modules/testDescriptionDAO');

const SKUItemService = require('../services/SKUItemService');
const SKUService=require('../services/SKUService')
const TestResultService=require('../services/testResultService')
const TestDescriptorService=require('../services/testDescriptorService')

const dbHandler=new DBHandler('EzWhDB.db');
const SKUItemHandler=new SKUItemDAO(dbHandler);
const testResultHandler=new testResultDAO(dbHandler);
const skuItemService=new SKUItemService(SKUItemHandler);
const SKUHandler=new SKUDAO(dbHandler);
const skuService=new SKUService(SKUHandler);
const testResultService=new TestResultService(testResultHandler);
const testDescriptionHandler=new testDescriptorDAO(dbHandler);
const testDescriptorService=new TestDescriptorService(testDescriptionHandler);


//*********SKUItem API ****************/

//get methods

router.get('/skuitems', async (req,res)=>{
  try
  {
    const result=await skuItemService.getSKUItems();
    return res.status(200).json(result);
  }
  catch(err)
  {
    console.log(err);
    return res.status(500).json("Internal Server Error");
  }
  })
  
  router.get('/skuitems/sku/:id',
  [
    check('id').isInt()
  ]
  ,async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});

    try{
      const id = Number(req.params.id);
      console.log(id)
      const sku= await skuService.findSKU(id);
      if(sku===undefined)
          return res.status(404).json("SKU Not Found");

      const result= await skuItemService.getSKUsbySKUId(id);
        return res.status(200).json(result);
    }
    catch(err)
    {
      console.log(err);
      return res.status(500).json("Internal Server Error");
    }
  })
  
  router.get('/skuitems/:rfid', [
    check('rfid').isNumeric().isLength({min:32, max:32}),
  ], async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});

    try
    {
      let rfid=req.params.rfid 
        const result= await skuItemService.findSKUItem(rfid);
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
  
  //post method

  router.post('/skuitem',
  [
    check('RFID').isNumeric().isLength({min:32, max:32}),
  ], async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});

    try{
      if (Object.keys(req.body).length === 0) 
      return res.status(422).json({error: `Empty body request`});

    const skuItem = req.body;
    if (!(skuItem.RFID && skuItem.SKUId && skuItem.DateOfStock))
        return res.status(422).json({ error: `Validation of request body failed` });
      
    //to do : check validation of date
    //if(skuItem.DateOfStock!=null && !(isDayjs(skuItem.DateOfStock)))
    //    return res.status(422).json({ error: `Validation of DateOfStock failed` });

    const sku= await skuService.findSKU(skuItem.SKUId);
    if(sku===undefined)
        return res.status(404).json("SKU Not Found");

    const result=await skuItemService.addSKUItem(skuItem.RFID,skuItem.SKUId,skuItem.DateOfStock)
    console.log(result)
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

  //put method
  router.put('/skuitems/:rfid',[
    check('rfid').isNumeric().isLength({min:32, max:32}),
  ], async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});

    try{
      if (Object.keys(req.body).length === 0) 
      return res.status(422).json({error: `Empty body request`});
    
    const rfid=req.params.rfid
    const skuItem = req.body;
    if (!(skuItem.newRFID && skuItem.newAvailable && skuItem.newDateOfStock))
        return res.status(422).json({ error: `Validation of request body failed` });

    //to do : check validation of date
    //if(skuItem.DateOfStock!=null && !(isDayjs(skuItem.DateOfStock)))
      //  return res.status(422).json({ error: `Validation of DateOfStock failed` });
    
    const result=await skuItemService.updateSKUItem(rfid,skuItem.newRFID,skuItem.newAvailable,skuItem.newDateOfStock)
    if(result==-1)
      return res.status(404).json({error: `SKUItem not existing`})
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
  
  //delete method
  router.delete('/skuitems/:rfid', [
    check('rfid').isNumeric().isLength({min:32, max:32}),
  ], async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});

    try
    {
      let rfid=req.params.rfid;
      var result= await skuItemService.deleteSKUItem(rfid);
      if(result==-1)
          return res.status(404).json({error: `SKUItem not existing`})
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
  
  //********** End of SKUItem API */

  //*********testResult API ****************/

  router.get('/skuitems/:rfid/testResults', [
    check('rfid').isLength({min:32, max:32}),
  ], async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});

    try
    {
      let rfid=req.params.rfid 
      // to do : check rfid validation 

      const skuItem= await skuItemService.findSKUItem(rfid);
        if(skuItem===undefined)
          return res.status(404).json("SKUItem Not existing");

        const result= await testResultService.getTestResults(rfid);
        return res.status(200).json(result);
    }
    catch(err)
    {
      console.log(err);
      return res.status(500).json("Internal Server Error");
    }
})

router.get('/skuitems/:rfid/testResults/:id',
[
  check('rfid').isLength({min:32, max:32}),
  check('id').isInt()
]
, async (req,res)=>{

  const errors = validationResult(req);
  if(!errors.isEmpty())
    return res.status(422).json({errors: errors.array()});

 try{

    const id = Number(req.params.id);
    const rfid=req.params.rfid 

    const skuItem= await skuItemService.findSKUItem(rfid);
    if(skuItem===undefined)
      return res.status(404).json("SKUItem Not existing");

      const result= await testResultService.findTestResult(rfid,id);
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

router.post('/skuitems/testResult',
[  check('rfid').isLength({min:32, max:32})],
async (req,res)=>{

  const errors = validationResult(req);
  if(!errors.isEmpty())
    return res.status(422).json({errors: errors.array()});

  try{
    if (Object.keys(req.body).length === 0) 
    return res.status(422).json({error: `Empty body request`});

    const testResult = req.body;

    //check skuItem exists
      const skuItem= await skuItemService.findSKUItem(testResult.rfid);
      if(skuItem===undefined)
        return res.status(404).json("no sku item associated to rfid");

    //check testDescriptor exists
    const testDescriptor= await testDescriptorService.findTestDescriptor(testResult.idTestDescriptor);
    if(testDescriptor===undefined)
      return res.status(404).json("no test descriptor associated to idTestDescriptor");

  const result=await testResultService.addTestResult(testResult.rfid,testResult.idTestDescriptor,testResult.Date,testResult.Result)
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

router.put('/skuitems/:rfid/testResult/:id',
[
  check('rfid').isLength({min:32, max:32}),
  check('id').isInt()
],
async(req,res)=>{

  const errors = validationResult(req);
  if(!errors.isEmpty())
    return res.status(422).json({errors: errors.array()});

try{
  if (Object.keys(req.body).length === 0) 
    return res.status(422).json({error: `Empty body request`});

      const testResult = req.body;
      const id = Number(req.params.id);
      const rfid=req.params.rfid 

      //check skuItem exists
      const skuItem= await skuItemService.findSKUItem(rfid);
      if(skuItem===undefined)
        return res.status(404).json("no sku item associated to rfid");

      //check testResult exists
      const tresult= await testResultService.findTestResult(rfid,id);
      if(tresult===undefined)
        return res.status(404).json("no test result associated to id");

     //check testDescriptor exists
     const testDescriptor= await testDescriptorService.findTestDescriptor(testResult.newIdTestDescriptor);
     if(testDescriptor===undefined)
       return res.status(404).json("no test descriptor associated to idTestDescriptor");

       const result=await testResultService.updateTestResult(rfid,id,testResult.newIdTestDescriptor,testResult.newDate,testResult.newResult)
  if(result.id>0)
    return res.status(200).end()
  else
    return res.status(503).end()
}
catch(err)
  {
    console.log(err);
    return res.status(503).json("Internal Server Error");
  }  
 
})

router.delete('/skuitems/:rfid/testResult/:id',
[
  check('rfid').isLength({min:32, max:32}),
  check('id').isInt()
],
 async (req,res)=>{

  const errors = validationResult(req);
  if(!errors.isEmpty())
    return res.status(422).json({errors: errors.array()});
    
  try
    {
      const rfid=req.params.rfid
      const id=Number(req.params.id);
      const result= await testResultService.deleteTestResult(rfid,id);
      if(result==-1)
          return res.status(404).json({error: `TestResult not existing`})
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

//********** End of testResult API */

  module.exports=router;
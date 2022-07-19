var express=require('express');
var router=express.Router();

const {check, validationResult} = require('express-validator');
const DBHandler = require('../modules/DBHandler');
const SKUDAO=require('../modules/SKUDAO');
const PositionDAO=require('../modules/positionDAO');
const SKUService=require('../services/SKUService')

const dbHandler=new DBHandler('EzWhDB.db');
const SKUHandler=new SKUDAO(dbHandler);
const PositionHandler=new PositionDAO(dbHandler);
const skuService=new SKUService(SKUHandler,PositionHandler);

//*********SKU API ****************/

//get methods

router.get('/skus', async (req,res)=>{
    try
    {
      const result=await skuService.getSKUs();
      // console.log(result)
      return res.status(200).json(result);
    }
    catch(err)
    {
      console.log(err);
      return res.status(500).json("Internal Server Error");
    }
  })
  
  router.get('/skus/:id',
  [
    check('id').notEmpty().isInt()
  ] , async (req,res)=>{  
    
    const errors = validationResult(req);
    if(!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});

    try
    {
      const id = Number(req.params.id);
      const result= await skuService.findSKU(id);
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

  router.post('/sku',
  [
    check('price').isFloat({min:0}),
    check('weight').isInt({min:0}),
    check('volume').isInt({min:0}),
    check('availableQuantity').isInt({min:0})
  ] ,async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});

    try
    {
      if (Object.keys(req.body).length === 0) 
        return res.status(422).json({error: `Empty body request`});

      const sku = req.body;
      if (!(sku.description && sku.weight && sku.volume && sku.notes && sku.price && sku.availableQuantity))
          return res.status(422).json({ error: `Validation of request body failed` });

      const result=await skuService.addSKU(sku.description, sku.weight,sku.volume,sku.notes, sku.price,sku.availableQuantity)
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
  
    //put methods

    router.put('/sku/:id',
    [
      check('id').notEmpty().isInt(),
      check('newPrice').isFloat({min:0}),
      check('newWeight').isFloat({min:0}),
      check('newVolume').isFloat({min:0}),
      check('newAvailableQuantity').isInt()
    ] ,  async (req,res)=>{

      const errors = validationResult(req);
      if(!errors.isEmpty())
        return res.status(422).json({errors: errors.array()});

      try
      {
        if (Object.keys(req.body).length === 0) 
          return res.status(422).json({error: `Empty body request`});

        const sku = req.body;
        if (!(sku.newDescription && sku.newWeight && sku.newVolume && sku.newNotes && sku.newPrice && sku.newAvailableQuantity))
            return res.status(422).json({ error: `Validation of request body failed` });

        const id = Number(req.params.id);
        const result=await skuService.updateSKU(id,sku.newDescription, sku.newWeight,sku.newVolume,sku.newNotes, sku.newPrice,sku.newAvailableQuantity)
        if(result==-1)
          return res.status(404).json({error: `SKU not existing`})
        else if(result==-2)
          return res.status(422).json({error: `with newAvailableQuantity, position is not capable enough in weight or in volume`})
        return res.status(200).end()
    
      }
      catch(err)
      {
        console.log(err);
        return res.status(503).json("Internal Server Error");
      }
        
      })
      
      router.put('/sku/:id/position',
      [
        check('id').notEmpty().isInt(),
        check('position').isLength({min:12,max:12})
      ] , async (req,res)=>{

        const errors = validationResult(req);
        if(!errors.isEmpty())
          return res.status(422).json({errors: errors.array()});

        try
        {   
       
        if (Object.keys(req.body).length === 0) 
          return res.status(422).json({error: `Empty body request`});
       
          const id = Number(req.params.id);
          const position=req.body.position

          const result=await skuService.setPosition(id,position)
          if(result==-1)
            return res.status(404).json({error: `SKU not existing`})
          if(result==-2)
            return res.status(404).json({error: `Position not existing`})
          if(result==-3)
            return res.status(422).json({error: `Position is already assigned to a sku`})
          else if(result==-4)
            return res.status(422).json({error: `Position isn't capable to satisfy volume and weight constraints for available quantity of sku`})
            
          return res.status(200).end()
       
      }
      catch(err)
      {
        console.log(err);
        return res.status(503).json("Internal Server Error");
      }
      })
  
      
      //delete method
    router.delete('/skus/:id',
    //[
    //  check('id').isInt()
   // ] , 
   async (req,res)=>{

     // const errors = validationResult(req);
     // if(!errors.isEmpty())
     //   return res.status(422).json({errors: errors.array()});

    try
    {
        
      let id=Number(req.params.id);
      console.log(id)
      var result= await skuService.deleteSKU(id);
      console.log(result)
      if(result==-1)
          return res.status(404).json({error: `SKU not existing`})
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

  //*********End of SKU API ****************/

  module.exports=router;
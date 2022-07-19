var express=require('express');
var router=express.Router();

const {check, validationResult} = require('express-validator');
const DBHandler = require('../modules/DBHandler');
const PositionDAO=require('../modules/positionDAO');
const dbHandler=new DBHandler('EzWhDB.db');
const positionHandler=new PositionDAO(dbHandler);

const PositionService=require('../services/positionService');
const positionService=new PositionService(positionHandler);


//-----------------POSITION APIS-----------------------
/**
 * GET:
 * -getPositions
 * POST:
 * -create a new position
 * PUT:
 * -modifyPositionByID
 * -modifyPositionByOldPosAndID
 * DELETE:
 * -delete position
 */

router.get('/positions',async (req,res)=>{
  try
  {
    const result=await positionService.getPositions();
    console.log(result)
    res.status(200).json(result);
    return;
  }
  catch(err)
  {
    console.log(err);
    res.status(500).json({message:"Internal Server Error"});
    return;
  }
  })
  
router.post('/position',
  [
    //check('positionID').isInt(),
    check('positionID').isLength({min:12, max:12}),
    //check('aisleID').isInt(),
    check('aisleID').isLength({min:4, max:4}),
    //check('row').isInt(),
    check('row').isLength({min:4, max:4}),
    //check('col').isInt(),
    check('col').isLength({min:4, max:4}),
    check('maxWeight').isInt({gt:0}),
    check('maxVolume').isInt({gt:0})
  ]
  ,
  async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
      res.status(422).json({errors: errors.array()});
      return;
    }
      
    try{
      if (Object.keys(req.body).length === 0){
      res.status(422).json({error: `Empty body request`});
      return;
      }

      const position = req.body;
      if (!(position.positionID && 
            position.aisleID && 
            position.row && 
            position.col && 
            position.maxWeight && 
            position.maxVolume)){
              res.status(422).json({ error: `Validation of request body failed` });
              return;
            }
      if (position.maxWeight < 0){
              res.status(422).json({ error: `Validation of request body failed` });
              return;
      }
      if (position.maxVolume < 0){
        res.status(422).json({ error: `Validation of request body failed` });
        return;
      }
      const result=await positionService.addPosition(position.positionID,position.aisleID,position.row,position.col,position.maxWeight,position.maxVolume)
      if(result){
        res.status(201).json({ message:'Ok' })
        return;
      }
      else{
        res.status(503).json({ error: 'Internal Server Error' })
        return;
      }
    }
    catch(err){
       console.log(err)
       if(err.errno==19){
        res.status(201).json({ error: "Maybe some error about the primary key" });
        return;
       }
       res.status(503).json({ error: "Maybe some error about the primary key" });
       return;
    }
  })
  
router.put('/position/:positionID',
  [
    check('positionID').isLength({min:12, max:12}),
    //check('newAisleID').isInt(),
    check('newAisleID').isLength({min:4, max:4}),
    //check('newRow').isInt(),
    check('newRow').isLength({min:4, max:4}),
    //check('newCol').isInt(),
    check('newCol').isLength({min:4, max:4}),
    //check('newMaxWeight').isInt(),
    //check('newMaxWeight').isInt(),
    //check('newOccupiedWeight').isInt(),
    //check('newOccupiedVolume').isInt(),
    
  ]
  , async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
      res.status(422).json({errors: "problema nei parametri"});
      return
    }
      try{

        if (Object.keys(req.body).length === 0) 
        res.status(422).json({error: `Empty body request`});

        const position = req.body;
        if (!(position.newAisleID && 
          position.newRow && 
          position.newCol && 
          position.newMaxWeight && 
          position.newMaxVolume && 
          position.newOccupiedWeight && 
          position.newOccupiedVolume)){
            res.status(422).json({ error: `Validation of request body failed` });
            return;
          }
        if (position.newMaxWeight < 0||
            position.newMaxVolume < 0||
            position.newOccupiedWeight < 0||
            position.newOccupiedVolume < 0||
            position.newMaxVolume<position.newOccupiedVolume||
            position.newMaxWeight<position.newOccupiedWeight){
          res.status(422).json({ error: `Validation of request body failed` });
          return;
        }
        const positionId=(req.params.positionID);
        const result=await positionService.updatePosition(positionId,position.newAisleID,position.newRow,position.newCol,position.newMaxWeight,position.newMaxVolume,position.newOccupiedWeight,position.newOccupiedVolume)
        if (result==undefined){
          res.status(404).json({error: `Position not exists`})
          return;
        }
        if(result==-1){
          res.status(404).json({error: `Position not exists`})
          return;
        }
        else {
            res.status(200).json({message:"success"})
            return;
          
      }
    }
      catch(err){
        console.log("this is the error: ",err)
        res.status(503).json({ error: 'Internal Server Error' })
      }
  })
  
router.put('/position/:positionID/changeID',
  [
    //check('positionID').isInt(),
    check('positionID').isLength({min:12, max:12}),
    //check('newPositionID').isInt(),
    check('newPositionID').isLength({min:12, max:12}),
    //check('req.body.newPositionID').isJSON(),
  ],
   async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
       res.status(422).json({errors: errors.array()});

      try{
        if (Object.keys(req.body).length === 0){
          res.status(422).json({error: `Unprocessable Entity`});
          return;
        }

        if (!(req.body.newPositionID)){
          res.status(422).json({ error: `Unprocessable Entity` });
          return;
        }

        const positionId=req.params.positionID;
        const newPositionId=req.body.newPositionID;
        const result=await positionService.changePositionId(positionId,newPositionId)
        if(result==-1){
          res.status(404).json({error: `Position not exists`})
          return;
        }
        else {
          if(result.id>0){
              res.status(200).json({message:'Ok'})
              return;
            }
          else{
            res.status(503).json({ error: 'Internal Server Error' });
            return;
          }
        }
      }
      catch(err){
          console.log(err)
         res.status(503).json({ error: 'Internal Server Error' })
      }
  })
  
router.delete('/position/:positionID',
  [
    //check('positionID').isInt(),
    check('positionID').isLength({min:12, max:12})
  ], 
  async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
      res.status(422).json({errors: errors.array()});
      return;
    }
      try{
        const positionId=(req.params.positionID);
        const result=await positionService.deletePosition(positionId)
        if(result==-1){
          res.status(404).json({error: `Position not existing`});
          return;
        }
        else{
          res.status(204).json({message:'Ok'});
          return;
        }
      }
      catch(err){
        console.log(err)
        res.status(503).json({ error: 'Internal Server Error' })
        return;
      }
  })
  //------------------END OF POSITION APIS--------------------

  module.exports=router;
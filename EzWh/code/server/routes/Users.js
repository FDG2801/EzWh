var express=require('express');
var router=express.Router();
var md5  = require("blueimp-md5")
const {check, validationResult} = require('express-validator');
const DBHandler = require('../modules/DBHandler');
const UserDAO = require('../modules/userDAO');
const dbHandler=new DBHandler('EzWhDB.db');
const userHandler = new UserDAO(dbHandler);
const UserService=require('../services/userService');
const userServive=new UserService(userHandler);

/**
 * GET: 
 * -userinfo (not to be impl.)
 * -suppliers
 * -users
 * POST:
 * -new user
 * -manager sessions
 * -customer sessions
 * -supplier sessions
 * -clerk sessions
 * -qualityEmployeeSessions
 * -deliveryEmployeeSessions
 * -logout (not to be impl.)
 * PUT:
 * -modifyRights
 * DELETE:
 * -deleteUser
 */
//get all suppliers
router.get('/suppliers', async(req,res)=>{
  try
  {
    const result=await userServive.getSuppliers();
    res.status(200).json(result); 
  }
  catch(err)
  {
    console.log(err);
    res.status(500).json({messag:"Internal Server Error"});
  }
})

//get all users but manager
router.get('/users', async(req,res)=>{
  try
  {
    const result=await userServive.getSuppliersAndUser();
    res.status(200).json(result); 
  }
  catch(err)
  {
    console.log(err);
    res.status(500).json({messag:"Internal Server Error"})
  }
})

router.post('/newUser',
[
  check('username').notEmpty().isEmail(),
  check('password').notEmpty().isLength({min: 8}),
  check('name').notEmpty(),
  check('surname').notEmpty(),
  check('type').notEmpty()
], async (req,res)=>{

  const errors = validationResult(req);
  if(!errors.isEmpty())
    res.status(422).json({errors: errors.array()});

  try
  {
    if (Object.keys(req.body).length === 0) 
    res.status(422).json({error: `Empty body request`});

  const user = req.body;
  user.password=md5(user.password)
  if(user.type==='manager' || user.type==='administrator' )
      res.status(422).json({ error: `You are not allowed to create manager or administrator accounts` });

      const result=await userServive.addUser(user.username,user.name,user.surname,user.password,user.type)
      if(result==-1)
        res.status(409).json({error: `user with same mail and type already exists` });
      if(result.id>0)
        res.status(201).json({username: user.username});
      else
        res.status(503).json({messag:"Internal Server Error"}); 
}
  catch(err)
  {
    console.log(err);
    return res.status(503).json("Internal Server Error");
  }

})

// Route to Login Page
router.post('/customerSessions',
[
  check('username').notEmpty().isEmail(),
  check('password').notEmpty()
], async (req, res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty())
    res.status(422).json({errors: errors.array()});

  try{

    if (Object.keys(req.body).length === 0) 
    res.status(422).json({error: `Empty body request`});
  const user = req.body;
      const result=await userServive.customerLogin(user.username,user.password);
      if(result===undefined)
        res.status(401).json({error:"wrong username and/or password"});
      else
        res.status(200).json(result);
  }
  catch(err)
  {
    console.log(err);
    return res.status(500).json({messag:"Internal Server Error"})
  }
  });

//manager sessions
router.post('/managerSessions',
[
  check('username').notEmpty().isEmail(),
  check('password').notEmpty()
],async (req, res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty())
    res.status(422).json({errors: errors.array()});

  try{
    if (Object.keys(req.body).length === 0) 
    res.status(422).json({error: `Empty body request`});

  const user = req.body;
      const result=await userServive.managerLogin(user.username,user.password);
      if(result===undefined)
        res.status(401).json({error:"wrong username and/or password"});
      else
        res.status(200).json(result);
  }
  catch(err)
  {
    console.log(err);
      res.status(500).json({messag:"Internal Server Error"})
  }
  });

//supplier sessions
router.post('/supplierSessions',
[
  check('username').notEmpty().isEmail(),
  check('password').notEmpty()
], async (req, res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty())
      res.status(422).json({errors: errors.array()});

  try{
    if (Object.keys(req.body).length === 0) 
      res.status(422).json({error: `Empty body request`});

  const user = req.body;
      const result=await userServive.supplierLogin(user.username,user.password);
      if(result===undefined)
          res.status(401).json({error:"wrong username and/or password"});
      else
          res.status(200).json(result);
  }
  catch(err)
  {
    console.log(err);
      res.status(500).json({messag:"Internal Server Error"})
  }
  });

//clerk session
router.post('/clerkSessions',
[
  check('username').notEmpty().isEmail(),
  check('password').notEmpty()
], async (req, res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty())
      res.status(422).json({errors: errors.array()});

  try{
    if (Object.keys(req.body).length === 0) 
      res.status(422).json({error: `Empty body request`});

  const user = req.body;
      const result=await userServive.ClerkLogin(user.username,user.password);
      if(result===undefined)
          res.status(401).json({error:"wrong username and/or password"});
      else
          res.status(200).json(result);
  }
  catch(err)
  {
    console.log(err);
      res.status(500).json({messag:"Internal Server Error"})
  }
});

//qualityEmployee
router.post('/qualityEmployeeSessions',
[
  check('username').notEmpty().isEmail(),
  check('password').notEmpty()
], async (req, res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty())
      res.status(422).json({errors: errors.array()});

  try{
    if (Object.keys(req.body).length === 0) 
      res.status(422).json({error: `Empty body request`});

  const user = req.body;
      const result=await userServive.QualityLogin(user.username,user.password);
      if(result===undefined)
          res.status(401).json({error:"wrong username and/or password"});
      else
          res.status(200).json(result);
  }
  catch(err)
  {
    console.log(err);
      res.status(500).json({messag:"Internal Server Error"})
  }
});

//delivery employee
router.post('/deliveryEmployeeSessions',
[
  check('username').notEmpty().isEmail(),
  check('password').notEmpty()
], async (req, res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty())
      res.status(422).json({errors: errors.array()});

  try{
    if (Object.keys(req.body).length === 0) 
      res.status(422).json({error: `Empty body request`});

  const user = req.body;
      const result=await userServive.DeliveryLogin(user.username,user.password);
      if(result===undefined)
          res.status(401).json({error:"wrong username and/or password"});
      else
          res.status(200).json(result);
  }
  catch(err)
  {
    console.log(err);
      res.status(500).json({message:"Internal Server Error"})
  }
});

//modify rights
router.put('/users/:username',[
  check('username').isEmail(),
  check('oldType').notEmpty(),
  check('newType').notEmpty()
], async (req,res)=>{

  const errors = validationResult(req);
  if(!errors.isEmpty())
      res.status(422).json({errors: errors.array()});

  try{

    if (Object.keys(req.body).length === 0) 
      res.status(422).json({error: `Empty body request`});

      let username=req.params.username;

      if(req.body.newType==='manager' || req.body.newType==='administrator' || req.body.newType==='admin')
        res.status(422).json({ error: `attempt to modify rights to administrator or manager` });

      let result= await userServive.modifyUserPermissions(username,req.body.oldType,req.body.newType)
      console.log(typeof(result),result)
      if(result!==-1){
        res.status(200).json(result)
      }
      else
        res.status(404).json({error:"wrong username and/or old type field"});
  }
  catch(err){
      res.status(500).json({err})
  }
})

//delete user - ok
router.delete('/users/:username/:type',[
  check('username').isEmail()
], async (req,res)=>{

  const errors = validationResult(req);
  if(!errors.isEmpty())
      res.status(422).json({errors: errors.array()});

  try{
    const username=req.params.username;
    const type=req.params.type;
    console.log("Username e type:", username,type) //ok
    let validity=false;
    if(type==='manager' || type==='administrator' || type==='admin'||type==='errtype'){
      res.status(422).json({ error: `attempt to delete a manager/administrator` });
      return;
    }

    //---------------------------------------------------------------------------------------------
      var result= await userServive.deleteUser(username,type);
      console.log(result)
      // if(result==-1)
      //   res.status(422).json({error: `User does not exist`})
      if(result)
        res.status(204).json({message: "user deleted"});
      else
        res.status(503).json({error: "There was a problem with the database."});
  }
  catch(err){
      res.status(500).json({error: err})
  }
})

//-----------------END OF APIS USER--------------------

module.exports=router;
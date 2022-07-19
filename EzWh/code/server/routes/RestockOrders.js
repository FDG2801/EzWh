var express=require('express');
var router=express.Router();

const {check, validationResult} = require('express-validator');

const DBHandler = require('../modules/DBHandler');
const dbHandler=new DBHandler('EzWhDB.db');

const restockDAO = require('../modules/restockOrdDAO');
const restockHandler = new restockDAO(dbHandler);

const testResultDAO=require('../modules/testResultDAO');
const testResultHandler=new testResultDAO(dbHandler);

const SKUDAO = require('../modules/SKUDAO');
const SKUHandler = new SKUDAO(dbHandler);

const SKUItemDAO = require('../modules/SKUItemDAO');
const SKUItemHandler = new SKUItemDAO(dbHandler);

const ItemDAO = require('../modules/itemDAO');
const itemHandler = new ItemDAO(dbHandler);

// servis
const RestockOrderService = require('../services/restockOrderService');
const restockService = new RestockOrderService(restockHandler, SKUHandler, SKUItemHandler, testResultHandler, itemHandler);

//----------- RESTOCK ORDER API --------------------
/**
 * GET: 
 * - restock orders
 * - issued restock orders
 * - restock order by id
 * - return items (from a restock order)
 * POST:
 * - new restock order
 * PUT:
 * - modify state
 * - add skuitems
 * - add transport note
 * DELETE:
 * - delete restock order by id
 */

  router.get('/hello2', (req,res)=>{
    return res.status(200).json({message: 'Hello World!'});
  });

  router.get('/restockOrders', async (req, res) => {
    try {
      let orders = await restockService.getAll();
      return res.status(200).json(orders);
    }
    catch(err) {
      console.log(err);
      return res.status(500).json({error: 'Internal server error'});
    }
  });
  
  router.get('/restockOrdersIssued', async (req, res) => {
    try {
      let orders = await restockService.getIssued();
      return res.status(200).json(orders);
    }
    catch(err) {
      console.log(err);
      return res.status(500).json({error: 'Internal server error'});
    }
  });
  
  
  router.get('/restockOrders/:id', 
  [
    check('id').isInt()
  ], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({error: 'Unprocessable entity (validation of ID failed)'});
    }
    const ID = req.params.id;
    try {
      let order = await restockService.findOrder(ID);
      if (order === undefined) {
        return res.status(404).json({error: 'Not Found'});
      }
      return res.status(200).json(order);
    }
    catch(err) {
      console.log(err);
      return res.status(500).json({error: 'Internal Server Error'});
    }
  });
  
  router.get('/restockOrders/:id/returnItems', 
  [
    check('id').isInt()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({error: 'Unprocessable entity (validation of ID failed)'});
    }
    const ID = req.params.id;
    try {
      let order = await restockService.findOrderFromTable(ID);
      if (order === undefined) {
        return res.status(404).json({error: 'Not Found'});
      }
      if (order.state !== 'COMPLETEDRETURN') {
        return res.status(422).json({error: 'Unprocessable entity'});
      }
      let result = await restockService.findFailedSKU(ID);
      return res.status(200).json(result);
    }
    catch(err) {
      console.log(err);
      return res.status(500).json({error: 'Internal server error'});
    }
  });
  
  router.post('/restockOrder', 
  [
    check('issueDate').exists().withMessage('Missing issueDate'),
    check('issueDate').matches(/^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|([1-2]\d)|3[0-1])\s([0-1]\d|2[0-3]):[0-5]\d$/)
      .withMessage('Invalid date (format), YYYY-MM-DD HH:MM expected'),
    check('supplierId').exists().withMessage('Missing supplierId'),
    check('supplierId').isInt(),
    check('products').isArray().withMessage('Products is not an array'),
    check('products').exists().withMessage('Missing products')
  ], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({error: errors.array()});
    }
    try {
      let lastID = await restockService.addOrder(req.body.issueDate, req.body.products, req.body.supplierId);
      return res.status(201).json({lastID: lastID});
    }
    catch(err) {
      console.log(err);
      return res.status(503).json({error: 'Service Unavailable'});
    }
  });
  
  router.put('/restockOrder/:id', 
  [
    check('id').isInt(),
    check('newState').exists().withMessage('Missing newState'),
    check('newState').isIn(['ISSUED', 'DELIVERY', 'DELIVERED', 'TESTED', 'COMPLETEDRETURN', 'COMPLETED'])
    .withMessage('Invalid state')
  ], async (req, res) => {

    const errors = validationResult(req);

    if (Object.keys(req.body).length === 0 || !errors.isEmpty()) {
      return res.status(422).json({error: errors.array()});
    }
    const ID = req.params.id;
    try {
      let order = await restockService.findOrderFromTable(ID);
      if (order === undefined) {
        return res.status(404).json({error: 'Not Found'});
      }
      let value = await restockService.setState(ID, req.body.newState);
      return res.status(200).json({message: `OK (success): # of changed rows: ${value}`});
    }
    catch(err) {
      console.log(err);
      return res.status(503).json({error: 'Service Unavailable'});
    }
  });
  
  router.put('/restockOrder/:id/skuItems', 
  [
    check('id').isInt(),
    check('skuItems').exists().withMessage('skuItems doesn\'t exist'),
    check('skuItems').isArray().withMessage('skuItems is not an array')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (Object.keys(req.body).length === 0 || !errors.isEmpty()) {
      return res.status(422).json({error: errors.array()});
    }
    const ID = req.params.id;
    try {
      let order = await restockService.findOrderFromTable(ID);
      if (order === undefined) {
        return res.status(404).json({error: 'Not Found'});
      }
      if (order.state !== 'DELIVERED') {
        return res.status(422).json({error: 'Unprocessable entity'});
      }
      await restockService.addSKUItems(ID, req.body.skuItems);
      return res.status(200).json({message: 'OK (success)'});
    }
    catch(err) {
      console.log(err);
      return res.status(503).json({error: 'Service Unavailable'});
    }
  });
  
  router.put('/restockOrder/:id/transportNote', 
  [
    check('id').isInt(),
    check('transportNote.deliveryDate').matches(
      /^(\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|([1-2]\d)|3[0-1]))|\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|([1-2]\d)|3[0-1])\s([0-1]\d|2[0-3]):[0-5]\d$/
      )  // accept format with time or without time (HH:MM)
      .withMessage('Invalid date (format), YYYY/MM/DD or YYYY/MM/DD HH:MM expected')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({error: 'Unprocessable entity (validation of ID failed)'});
    }
    if (Object.keys(req.body).length === 0) {
      return res.status(422).json({error: 'Unprocessable entity'});
    }
    const ID = req.params.id;
    try {
      let order = await restockService.findOrderFromTable(ID);
      if (order === undefined) {
        return res.status(404).json({error: 'Not Found'});
      }
      if (order.state !== 'DELIVERY') {
        return res.status(422).json({error: 'Unprocessable entity (not in DELIVERY state)'});
      }
      valid = await restockService.addTransportNote(ID, order.issuedate, req.body.transportNote.deliveryDate);
      if (valid === false) {
        return res.status(422).json({error: 'Unprocessable entity (Delivery Date before Issue Date)'});
      }
      return res.status(200).json({message: 'OK (success)'});
    }
    catch(err) {
      console.log(err);
      return res.status(503).json({error: 'Service Unavailable'});
    }
  });
  
  router.delete('/restockOrder/:id', 
  [
    check('id').isInt()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({error: 'Unprocessable entity (validation of ID failed)'});
    }
    const ID = req.params.id;
    try {
      await restockService.deleteOrder(ID);
      return res.status(204).json({message: 'No Content (success)'});
    }
    catch(err) {
      console.log(err);
      return res.status(503).json({error: 'Service Unavailable'});
    }
  });

  module.exports=router;
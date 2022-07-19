var express = require('express');
var router = express.Router();
const dayjs = require('dayjs')

const { check, validationResult } = require('express-validator');



const DBHandler = require('../modules/DBHandler');
const dbHandler = new DBHandler('EzWhDB.db');

const returnOrdDAO = require('../modules/returnOrdDAO');
const returnOrderHandler = new returnOrdDAO(dbHandler);

const restockDAO = require('../modules/restockOrdDAO');
const restockOrderHandler = new restockDAO(dbHandler);


const ReturnOrderService = require('../services/ReturnOrderService');
const ReturnService = new ReturnOrderService(returnOrderHandler, restockOrderHandler);



router.get('/returnOrders', async (req, res) => {
  try {
    let rorder = await ReturnService.getReturnOrders();
    return res.status(200).json(rorder);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
})

//get order by id
router.get('/returnOrders/:id', [
  check('id').isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Unprocessable entity (validation of ID failed)' });
  }
  let id = req.params.id;

  try {
    let rorder = await ReturnService.getReturnOrderById(id);
    if (rorder.length == 0) {
      console.log("hello"+rorder);
      return res.status(404).json({ error: 'Not Found' });
    } else {
      return res.status(200).json(rorder);
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }



})

//post

router.post('/returnOrder', [
  check('returnDate').exists().withMessage('Missing issueDate'),
  check('returnDate').isLength({ min: 16, max: 16 }).withMessage('Wrong length of datetime'), // don't know how to validate dateTime
  check('restockOrderId').exists().withMessage('Missing supplierId'),
  check('restockOrderId').isInt(),
  check('products').isArray().withMessage('Products is not an array'),
  check('products').exists().withMessage('Missing products')
],
  async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array() });
    }
    
    let returnDate = new dayjs(req.body.returnDate);
    let products = req.body.products;
    let restockOrderId = req.body.restockOrderId;
    try {
      let id = await ReturnService.postReturnOrder(returnDate, products, restockOrderId);
      if (id === undefined) {
        return res.status(404).json({ error: 'Not Found' });
      } else {
        return res.status(201).json({ message: "created" });
      }
    } catch (err) {
      console.log(err);
      return res.status(503).json({ error: 'Service Unavailable' });
    }


  })




router.delete('/returnOrder/:id',  [
  check('id').isInt()
],
async (req, res) => {

  if (req === undefined) {
    return res.status(422).json({ error: 'Unprocessable entity (validation of ID failed)' });
  }
  let id = req.params.id

  try {
    await ReturnService.deleteReturnOrder(id);
    return res.status(204).json({ message: 'No Content (success)' });
  } catch (err) {
    return res.status(503).json({ error: 'Service Unavailable' });
  }

})




module.exports = router;
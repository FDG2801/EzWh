var express = require('express');
var router = express.Router();
const dayjs = require('dayjs')

const { check, validationResult } = require('express-validator');


const DBHandler = require('../modules/DBHandler');
const dbHandler = new DBHandler('EzWhDB.db');

const internalOrdDAO = require('../modules/internalOrdDAO');
const internalOrderHandler = new internalOrdDAO(dbHandler);


const InternalOrderService = require('../services/InternalOrderService');
const InternalService = new InternalOrderService(internalOrderHandler);




router.get('/internalOrders', async (req, res) => {
  try {
    let iorder = await InternalService.getInternalOrders();
    return res.status(200).json(iorder);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
})


router.get('/internalOrdersIssued', async (req, res) => {
  try {
    let iorder = await InternalService.getInternalOrdersIssued();
    return res.status(200).json(iorder);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal server error' });
  }

})

router.get('/internalOrdersAccepted', async (req, res) => {
  try {
    let iorder = await InternalService.getInternalOrdersAccepted();
    return res.status(200).json(iorder);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal server error' });
  }

})


router.get('/internalOrders/:id',
  [
    check('id').isInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Unprocessable entity (validation of ID failed)' });
    }
    let id = req.params.id;
    try {
      let iorder = await InternalService.getInternalOrderByID(id);
      if (iorder.length == 0) {
        return res.status(404).json({ error: 'Not Found' });
      } else {
        return res.status(200).json(iorder);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

  })

//post
router.post('/internalOrders',
  [
    check('issueDate').exists().withMessage('Missing returnDate'),
    check('customerId').exists().withMessage('Missing supplierId'),
    check('customerId').isInt(),
    check('products').isArray().withMessage('Products is not an array'),
    check('products').exists().withMessage('Missing products')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array() });
    }
    let issueDate = new dayjs(req.body.issueDate)
    let products = req.body.products;
    let customerId = req.body.customerId;

    try {
      await InternalService.postInternalOrders(issueDate, products, customerId);
      return res.status(201).json({ message: "created" });
    } catch (err) {
      console.log(err);
      return res.status(503).json({ error: 'Service Unavailable' });
    }

  })


//put
router.put('/internalOrders/:id',
  [
    check('id').isInt(),
    check('newState').exists().withMessage('Missing newState'),
    check('newState').isIn(['ISSUED', 'ACCEPTED', 'REFUSED', 'CANCELED', 'COMPLETED'])
      .withMessage('Invalid state')
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (Object.keys(req.body).length === 0 || !errors.isEmpty()) {
      return res.status(422).json({ error: errors.array() });
    }
    let id = req.params.id
    let newState = req.body.newState;
    let products = req.body.products;

    try {
      await InternalService.putInternalOrders(id, newState, products);
      return res.status(200).json("ok");
    } catch (err) {
      console.log(err);
      return res.status(503).json({ error: 'Service Unavailable' });
    }






  })

//delete
router.delete('/internalOrders/:id', 
[
  check('id').isInt()
], 
async (req, res) => {

  if (req === undefined) {
    return res.status(422).json({ error: 'Unprocessable entity (validation of ID failed)' });
  }
  try {
    let id = req.params.id
    await InternalService.deleteInternalOrders(id);
  } catch (err) {
    return res.status(503).json({ error: 'Service Unavailable' });
  }


})


module.exports = router;

const express = require('express');
const router = express.Router();

// const { validateReq } = require('../utils');
const JoiMW = require('../middleware/validate');
const TxnMiddleware = require('../middleware/transaction.middleware')
const PaymentValidation = require('../validations/payment.validation');
const PaymentController = require('../controllers/3rd_party/payment.controller');
const { AuthController, UserController } = require('../controllers');



router.get('/gateway', JoiMW.validateReq(PaymentValidation.listGateways), (new PaymentController()).list);

router.post('/payment/initiate', JoiMW.validateReq(PaymentValidation.initiate), AuthController.authenticate, AuthController.authorize(['*']), TxnMiddleware.construct, PaymentController.initiate);
router.get('/payment/:gateway/:asset_id/:module', PaymentController.callbackUrl);

router.route('/payment/:gateway/:asset_id/:module')
      .get(PaymentController.callbackUrl)
      .post(PaymentController.callbackUrl); //Called back by payment gateway--- :gateway = name of gateway e.g. paystack, :asset_id=asset id
router.post('/payment/transfer', (new PaymentController()).transfer); // To make trasfers from company account to customer bank

router.get('/geography/countries', UserController.getCountries);
router.get('/geography/countries/:iso/states', UserController.getCountryStates);

module.exports = router;

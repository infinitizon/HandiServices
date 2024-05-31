const express = require('express');

const router = express.Router();
const JoiMW = require('../middleware/validate');
const TxnMiddleware = require('../middleware/transaction.middleware')
const TxnsValidator = require('../validations/txns.validation');
const {TransactionController, AuthController, ReportsController} = require('../controllers')


router.get('/', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN', 'PROVIDER', 'CUSTOMER']), TransactionController.getAllTransactions);
router.get('/bulk', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), TransactionController.getAllTxnHdrWtLogs)
router.get('/bulk/:id/details', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), TransactionController.getTxnWtLogDetails)
router.put('/bulk/:id/approve', JoiMW.validateReq(TxnsValidator.approveRejectTxn), AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN']), TransactionController.approveBulkTransactions)
router.get('/bulk/:id', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), TransactionController.getOneTxnHdrWtLogs)
router.get('/:id', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN', 'PROVIDER', 'CUSTOMER']), TransactionController.getOneTransaction);
router.post('/template/upload', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), TxnMiddleware.construct, TransactionController.uploadTransaction);
router.get('/template/download', AuthController.authenticate, AuthController.authorize([ 'PROVIDER','PROVIDER_ADMIN', 'SUPER_ADMIN' ]), TransactionController.downloadTemplate)

// Some user reports
router.get('/reports/value-by-currency', AuthController.authenticate, AuthController.authorize(['*']), ReportsController.valueByCurrency);
router.get('/reports/value-by-asset', AuthController.authenticate, AuthController.authorize(['*']), ReportsController.valueByAsset);
router.get('/reports/value-by-customer', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN', 'PROVIDER',]), ReportsController.valueByCustomer);

module.exports = router;

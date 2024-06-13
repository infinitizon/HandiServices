const express = require('express');

const router = express.Router();
const { UserController, AuthController, ReportController } = require('../controllers');
const JoiMW = require('../middleware/validate');
const { AuthValidator, AddressValidator, FeedbackValidator, OrderValidator } = require('../validations');

router.get('/', AuthController.authenticate, UserController.getUserDetails);
router.get('/vendor/user/:userId?', AuthController.authenticate, UserController.getUserDetails);
router.patch('/profile/update', AuthController.authenticate, AuthController.authorize(['*']),  JoiMW.validateReq(AuthValidator.profileUpdate), UserController.updateProfile);
router.get('/wallet/fetch', AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN','PROVIDER_ADMIN', 'CUSTOMER']), UserController.getWallet)
router.get('/wallet/fund', AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN','PROVIDER_ADMIN', 'CUSTOMER']), UserController.fundWallet)
// Payments resolve
router.post('/wallet/complete', UserController.walletCallbackUrl);
router.post('/order/complete', UserController.orderCallbackUrl);
router.get('/vendors/recommend', UserController.recommended )

router.route('/beneficiary')
      .get(AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'CUSTOMER']), UserController.getBeneficiary)
      .patch(AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'CUSTOMER']), UserController.addBeneficiary)
      .post(AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'CUSTOMER']), UserController.addBeneficiary);

router.route('/address/:addressId')
      .get(AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN','PROVIDER_ADMIN', 'CUSTOMER']), UserController.getAddress)
      .delete(AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN','PROVIDER_ADMIN', 'CUSTOMER']), UserController.deleteAddress)
      .patch( JoiMW.validateReq(AddressValidator.updateAddress), AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'CUSTOMER']), UserController.updateAddress)
router.route('/address')
      .get(AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN','PROVIDER_ADMIN', 'CUSTOMER']), UserController.getAddresses)
      .post( JoiMW.validateReq(AddressValidator.createAddress), AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'CUSTOMER']), UserController.addAddress);

router.route('/orders/:tenantId?')
      .get( AuthController.authenticate, AuthController.authorize(['CUSTOMER']), UserController.getOrders )
router.route('/order/:orderId/status')
      .patch(AuthController.authenticate, AuthController.authorize(['CUSTOMER']), JoiMW.validateReq(OrderValidator.customerStatus), UserController.updateStatus )
router.post('/cartify/:tenantId/:subCategoryId', UserController.cartify);
router.get('/cart', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'CUSTOMER']), UserController.cart);
router.patch('/cart/:orderId/update', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'CUSTOMER']), UserController.updateOrderItem);
router.post('/checkout', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'CUSTOMER']), UserController.checkout);

router.post('/signup', JoiMW.validateReq(AuthValidator.signup), AuthController.signup);
router.post('/user/login-choose-tenant', AuthController.loginChooseTenant);
router.get('/ref-codes', UserController.fetchRefCodes);
// Feedback route
router.post('/feedback',  JoiMW.validateReq(FeedbackValidator.createReport), AuthController.authenticate, AuthController.authorize(['CUSTOMER', 'PROVIDER_ADMIN','SUPER_ADMIN']), ReportController.createReport);
router.get('/feedback/:reportId', AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN']), ReportController.getReport);
router.get('/feedback', AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN']), ReportController.getAllReport)
module.exports = router;

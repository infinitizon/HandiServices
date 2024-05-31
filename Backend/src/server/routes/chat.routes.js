const express = require('express');

const router = express.Router();
const { UserController, AuthController, ChatController } = require('../controllers');
// const JoiMW = require('../middleware/validate');
// const AuthValidator = require('../validations/auth.validation');

router.get('/get-sessions', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN']), ChatController.getTenantSessions);
router.post('/claim-session', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'CUSTOMER']), ChatController.claimSession);
router.post('/messages', AuthController.authenticate, AuthController.authorize(['*']), ChatController.saveMessage);
router.post('/history', AuthController.authenticate, AuthController.authorize(['*']), ChatController.chatHistory);

router.route('/address/:addressId')
      .get(AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN','PROVIDER_ADMIN', 'CUSTOMER']), UserController.getAddress)
//       .patch( JoiMW.validateReq(AddressValidator.updateAddress), AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'CUSTOMER']), UserController.updateAddress)
module.exports = router;

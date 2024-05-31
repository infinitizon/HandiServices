const express = require('express');

const router = express.Router();
const JoiMW = require('../middleware/validate');
const AuthValidator = require('../validations/auth.validation');
const {TransactionController, AuthController, AuditLogsController} = require('../controllers')


router.get('/', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), AuditLogsController.getAllAuditLogs);
router.get('/:id', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), AuditLogsController.getOneAuditLog)

// router.post('/user/signup', JoiMW.validateReq(AuthValidator.signup), AuthController.signup);

module.exports = router;

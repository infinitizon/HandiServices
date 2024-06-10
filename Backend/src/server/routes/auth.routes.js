const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const TenantController = require('../controllers/admin/tenant.controller');
const JoiMW = require('../middleware/validate');
const AuthValidator = require('../validations/auth.validation');
const AuthMiddleware = require('../middleware/auth.middleware');
const OTPMiddleware = require('../middleware/otp.middleware');

router.post('/user/login', JoiMW.validateReq(AuthValidator.signin), AuthMiddleware.checkLoginDetails, AuthMiddleware.check2FA,  AuthController.login);
router.post('/user/logout', AuthController.authenticate, AuthController.logout);
router.post('/user/login-choose-tenant', AuthController.loginChooseTenant);
router.post('/user/signup', JoiMW.validateReq(AuthValidator.signup), AuthController.signup);
router.post('/tenant/complete', JoiMW.validateReq(AuthValidator.completeTntCreatn), TenantController.completeUserTenant);
router.post('/otp/generate', OTPMiddleware.generate, AuthController.generateOTP);
router.post('/otp/verify', OTPMiddleware.verify, AuthController.verifyOTP);
router.post('/forgot-password/otp', AuthController.forgotPassword);
router.post('/reset-password', OTPMiddleware.verify, AuthController.resetPassword);
router.post('/change-password', JoiMW.validateReq(AuthValidator.changePassword), AuthController.authenticate, AuthController.changePassword)
router.patch('/completeSignup', OTPMiddleware.verify, AuthController.completeSignup);

module.exports = router;

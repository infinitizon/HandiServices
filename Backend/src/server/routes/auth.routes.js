const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const TenantController = require('../controllers/admin/tenant.controller');
const JoiMW = require('../middleware/validate');
const AuthValidator = require('../validations/auth.validation');
const AuthMiddleware = require('../middleware/auth.middleware');
const { verifyOTPMiddleware } = require('../middleware/verifyOtp');

router.post('/user/login', AuthMiddleware.checkLoginDetails, AuthMiddleware.check2FA,  AuthController.login);
router.post('/user/logout', AuthController.authenticate, AuthController.logout);
router.post('/user/login-choose-tenant', AuthController.loginChooseTenant);
router.post('/user/signup', JoiMW.validateReq(AuthValidator.signup), AuthController.signup);
router.post('/tenant/complete', JoiMW.validateReq(AuthValidator.completeTntCreatn), TenantController.completeUserTenant);
router.post('/otp/generate', AuthController.generateOTP);
router.post('/forgot-password/otp', AuthController.forgotPassword);
router.post('/reset-password', verifyOTPMiddleware, AuthController.resetPassword);
router.post('/change-password', JoiMW.validateReq(AuthValidator.changePassword), AuthController.authenticate, AuthController.changePassword)
router.post('/verifyOtp', verifyOTPMiddleware, AuthController.verifyOTP);
router.patch('/completeSignup', verifyOTPMiddleware, AuthController.completeSignup);

module.exports = router;

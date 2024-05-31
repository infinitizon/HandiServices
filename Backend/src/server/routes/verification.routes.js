const express = require('express');
const router = express.Router();
const VerificationController = require('../controllers/verification.controller');

router.post('/bvn', VerificationController.verifyBVN)
router.post('/nuban', VerificationController.verifyNUBAN)
router.get('/banks/list', VerificationController.getBankList)

module.exports = router;

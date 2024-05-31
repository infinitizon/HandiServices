const express = require('express');
const router = express.Router();
const FaqsController = require('../controllers/faq.controller');
const { AuthController } = require('../controllers');

router.get('/', AuthController.authenticate, AuthController.authorize(['*']), FaqsController.getAllFAQs);
router.get('/all', AuthController.authenticate, AuthController.authorize(['*']), FaqsController.getAll);
router.post('/', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), FaqsController.createFaq);
router.put('/:id', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), FaqsController.updateFaq);
router.get('/:id', AuthController.authenticate, AuthController.authorize(['*']), FaqsController.getOne);

module.exports = router;

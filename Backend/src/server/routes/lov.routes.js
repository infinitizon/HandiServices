const express = require('express');
const router = express.Router();
const LOVController = require('../controllers/lov.controller');

router.get('/nok/relationship', LOVController.getNOKRelationships);

module.exports = router;

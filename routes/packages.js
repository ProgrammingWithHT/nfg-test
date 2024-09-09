const express = require('express');
const { getPackages } = require('../controllers/packages');

const router = express.Router();

router.get('/packages', getPackages);

module.exports = router;

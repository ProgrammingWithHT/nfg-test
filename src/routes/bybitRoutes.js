// routes/bybitRoutes.js

const express = require('express');
const router = express.Router();
const bybitController = require('../controllers/bybitController');

router.post('/createSubMember', bybitController.createSubMember);
router.post('/createSubUIDAPIKey', bybitController.createSubUIDAPIKey);
router.post('/getAllowedDepositCoinInfo', bybitController.getAllowedDepositCoinInfo);
router.post('/getCoinInfo', bybitController.getCoinInfo);
router.post('/getSubDepositAddress', bybitController.getSubDepositAddress);
router.post('/submitWithdrawal', bybitController.submitWithdrawal);

module.exports = router;

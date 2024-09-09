const express = require("express");
const {
    handlePaymentCallback,
    loginMerchant,
    paymentCheckout,
    updateTransactionStatus,
} = require("../controllers/paymentController");
const router = express.Router();

const checkAuthorization = require('../middlewares/authMiddleware');

router.get("/auth",loginMerchant);
router.post("/checkout",paymentCheckout);
// router.post("/update-transaction-status",updateTransactionStatus)
router.post('/callback', handlePaymentCallback);

module.exports = router;
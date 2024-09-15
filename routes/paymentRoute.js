const express = require("express");
const {
    handlePaymentCallback,
    loginMerchant,
    paymentCheckout,
} = require("../controllers/paymentController");
const router = express.Router();

const checkAuthorization = require('../middlewares/authMiddleware');

router.get("/auth",checkAuthorization,loginMerchant);
router.post("/checkout", checkAuthorization, paymentCheckout);
router.post('/callback', handlePaymentCallback);

module.exports = router;
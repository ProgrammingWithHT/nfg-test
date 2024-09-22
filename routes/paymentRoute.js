const express = require("express");
const {
    handlePaymentCallback,
    loginMerchant,
    paymentCheckout,
    getUserTransactionsList,
    fiatPaymentCheckout,
    fiatHandlePaymentCallback,
} = require("../controllers/paymentController");
const router = express.Router();

const checkAuthorization = require('../middlewares/authMiddleware');

router.get("/auth",checkAuthorization,loginMerchant);
router.post("/checkout", checkAuthorization, paymentCheckout);
router.post('/callback', handlePaymentCallback);
router.post('/user-transaction-list',checkAuthorization, getUserTransactionsList);

router.post('/fiatcheckout',checkAuthorization, fiatPaymentCheckout);
// router.post('/callback',fiatHandlePaymentCallback);

module.exports = router;
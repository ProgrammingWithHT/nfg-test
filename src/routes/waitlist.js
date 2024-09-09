


const express = require('express');
const { joinWaitlist } = require('../controllers/waitlistController');

const router = express.Router();

router.post('/joinwaitlist', joinWaitlist);

module.exports = router;

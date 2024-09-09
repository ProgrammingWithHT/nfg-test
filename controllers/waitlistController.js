const WaitlistUser = require('../models/waitlist');
const { CleanHTMLData, CleanDBData } = require("../../config/database/sanetize");
const logger = require('../helpers/logger'); // Import the logger
const ip = require('ip');
exports.joinWaitlist = async (req, res) => {
  const postData = req.body;
  const name = CleanHTMLData(CleanDBData(postData.name));
  const email = CleanHTMLData(CleanDBData(postData.email));

  try {
    const existingEmail = await WaitlistUser.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userData = new WaitlistUser({
      name,
      email,
      date: new Date().toUTCString(),
    });
    const waitlistUser = await userData.save();
    logger.info({
      userid: waitlistUser._id,  // Fixed variable reference here
      hostname: ip.address() || null,
      userAgent: req.headers['user-agent'] || null,
    }, `User registered in Waitlist successfully! ${email}`);
    res.status(200).json({ message: 'User registered in Waitlist successfully!', waitlistUser });
  } catch (error) {
    logger.error({ message: error.message, stack: error.stack }); 
    res.status(400).json({ message: 'User cannot be registered in Waitlist', error });
  }
};

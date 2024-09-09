


const mongoose = require('mongoose');

const joinWaitlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    date: { type: String, required: true },
  },
  { collection: 'waitlist', versionKey: false }
);

const WaitlistUser = mongoose.model('WaitlistUser', joinWaitlistSchema);

module.exports = WaitlistUser;

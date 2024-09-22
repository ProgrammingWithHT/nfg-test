const mongoose = require("mongoose");

const userAuthSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    affiliateCodenumber: { type: String },
    emailotp: { type: String },
    otpExpiresAt: Date,
    varifyemailotp: { type: String },
    varifiedemailotp: { type: String },
    newEmail: { type: String },
    newEmailOtp: { type: String },
    bybituid: { type: String },
    type: String,
    nfgToken: {type: String},
    pkgid: {type: String},
  },
  { collection: "userdata", versionKey: false }
);

const User = mongoose.model("User", userAuthSchema);

module.exports = User;

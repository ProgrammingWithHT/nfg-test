const mongoose = require('mongoose');

const packagesSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: String, required: true },
  },
  { collection: 'packages', versionKey: false }
);

const Packages = mongoose.model('Packages', packagesSchema);

module.exports = Packages;

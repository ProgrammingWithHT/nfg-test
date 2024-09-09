const Packages = require('../models/packages');

exports.getPackages = async (req, res) => {
  try {
    const packages = await Packages.find();  // Fetch all packages
    res.status(200).json({ status: 'success', data: packages });
  } catch (error) {
    res.status(400).json({ status: 'error', message: 'Error fetching packages', error });
  }
};

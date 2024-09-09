const jwt = require('jsonwebtoken');
const User = require('../models/auth');

const checkAuthorization = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid User.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token expired or invalid' });
  }
};

module.exports = checkAuthorization;


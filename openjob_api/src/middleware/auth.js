require('dotenv').config();
const jwt = require('jsonwebtoken');
const AuthenticationError = require('../exceptions/AuthenticationError');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return res.status(401).json({ status: 'failed', message: err.message });
    }
    return res.status(401).json({ status: 'failed', message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;

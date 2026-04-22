const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  // 1. Try cookie first (works for same-domain)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback: Authorization header (required for cross-domain / localStorage-based auth)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('authMiddleware: Decoded Payload:', decoded);
    
    // Try finding by ID first
    req.user = await User.findById(decoded.id).select('-password');
    
    // Fallback: If ID fails but email exists in token, try finding by email
    // This helps debug and fix ID mismatches in OAuth flows
    if (!req.user && decoded.email) {
      console.log('authMiddleware: User not found by ID, trying by email:', decoded.email);
      req.user = await User.findOne({ email: decoded.email }).select('-password');
      if (req.user) {
        console.log('authMiddleware: User FOUND by email fallback. ID mismatch detected!');
      }
    }
    
    if (!req.user) {
      console.error('authMiddleware: User not found in database for ID:', decoded.id, 'and Email:', decoded.email);
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    
    next();
  } catch (error) {
    console.error('authMiddleware: Token verification failed:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };

const jwt = require('jsonwebtoken');
const config = require('config');

// Auth middleware
const auth = function(req, res, next) {
  console.log('Auth middleware called');
  console.log('Headers:', req.headers);

  // Get token from header
  let token = req.header('x-auth-token');

  // If no x-auth-token, try Authorization header
  if (!token) {
    const authHeader = req.header('Authorization');
    console.log('Authorization header:', authHeader);
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  // Check if no token
  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      throw new Error('JWT_SECRET is not configured');
    }

    console.log('Verifying token:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    if (!decoded.id && !decoded.userId) {
      console.error('Invalid token payload - no id or userId found');
      throw new Error('Invalid token payload');
    }

    // Set user object in request
    req.user = { 
      id: decoded.id || decoded.userId,
      role: decoded.role || 'student' // Default to student if role not specified
    };
    console.log('User object set in request:', req.user);
    next();
  } catch (err) {
    console.error('Token validation error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check user role
const checkRole = (roles) => {
  return (req, res, next) => {
    console.log('Checking role. User:', req.user);
    console.log('Required roles:', roles);
    
    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({ message: 'No user found' });
    }

    // If user has no role, default to 'student'
    if (!req.user.role) {
      req.user.role = 'student';
    }

    if (!roles.includes(req.user.role)) {
      console.log('User role not authorized. User role:', req.user.role);
      console.log('Required roles:', roles);
      return res.status(403).json({ message: 'Access denied' });
    }
    console.log('Role check passed');
    next();
  };
};

// Export auth middleware as default
module.exports = auth;

// Export checkRole separately
module.exports.checkRole = checkRole; 
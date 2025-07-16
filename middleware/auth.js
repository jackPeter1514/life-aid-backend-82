import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.id).populate('diagnosticCenterId');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found or inactive.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Access denied. Invalid token.'
    });
  }
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

// Check specific permission
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Missing permission: ${permission}`
      });
    }
    next();
  };
};

export { protect, authorize, checkPermission };

/**
 * Authentication Middleware
 * 
 * This middleware handles JWT token verification and user authentication.
 * It extracts the token from the Authorization header and verifies it.
 * If valid, it adds the user information to the request object.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT token and authenticate user
 * 
 * Usage: Add this middleware to routes that require authentication
 * Example: router.get('/protected-route', authenticateToken, controllerFunction)
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'MYKEY');

    // Get user from database to ensure they still exist and are active
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Add user information to request object
    req.user = {
      userId: user._id,
      username: user.username,
      email: user.email
    };

    next();

  } catch (error) {
    console.error('Authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

/**
 * Optional authentication middleware
 * 
 * This middleware tries to authenticate the user but doesn't fail if no token is provided.
 * Useful for routes that work differently for authenticated vs non-authenticated users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    // Try to verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'MYKEY');
    const user = await User.findById(decoded.userId);

    if (user && user.isActive) {
      req.user = {
        userId: user._id,
        username: user.username,
        email: user.email
      };
    } else {
      req.user = null;
    }

    next();

  } catch (error) {
    // If token is invalid, just continue without authentication
    req.user = null;
    next();
  }
};

/**
 * Middleware to check if user is the owner of a resource
 * 
 * Usage: Use after authenticateToken to ensure user owns the resource
 */
const checkOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const userId = req.user.userId;

      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if user owns the resource
      if (resource.addedBy && resource.addedBy.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource'
        });
      }

      // Add resource to request for use in controller
      req.resource = resource;
      next();

    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  };
};

/**
 * Middleware to check user roles (for future role-based access control)
 */
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      // This is a placeholder for role-based access control
      // You can extend this when you add roles to your user model
      
      // For now, just check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // TODO: Implement role checking when roles are added to user model
      // const user = await User.findById(req.user.userId);
      // if (!roles.includes(user.role)) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Insufficient permissions'
      //   });
      // }

      next();

    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  checkOwnership,
  requireRole
};


// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Authentication required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get complete user information from database
    const [users] = await db.execute(
      `SELECT u.*, b.branch_name 
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.id = ? AND u.is_active = 1`,
      [decoded.id]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or inactive'
      });
    }
    
    // Set complete user object in request
    req.user = users[0];
    
    // Ensure branch_id is properly cast as a number if it exists
    if (req.user.branch_id) {
      req.user.branch_id = parseInt(req.user.branch_id);
    }
    
    // Store token in request
    req.token = token;
    
    // Log authentication for debugging (optional)
    console.log('Authenticated user:', {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      branch_id: req.user.branch_id
    });
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid authentication token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication token expired'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = authMiddleware;
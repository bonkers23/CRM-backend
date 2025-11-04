const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please provide a valid token.'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const employee = await Employee.findById(decoded.id);
      
      if (!employee) {
        return res.status(401).json({
          success: false,
          message: 'Employee not found. Token is invalid.'
        });
      }

      if (!employee.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated. Please contact admin.'
        });
      }

      req.employee = employee;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please login again.'
        });
      }

      throw error;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.employee.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.employee.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
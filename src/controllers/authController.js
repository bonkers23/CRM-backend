const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    const employee = await Employee.create({
      name,
      email,
      password,
      role: role || 'counselor'
    });

    const token = generateToken(employee._id);

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      data: {
        employee: employee.getPublicProfile(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email }).select('+password');
    
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!employee.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.'
      });
    }

    const isPasswordMatch = await employee.comparePassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    employee.lastLogin = new Date();
    await employee.save();

    const token = generateToken(employee._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        employee: employee.getPublicProfile(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.employee.id);
    
    res.status(200).json({
      success: true,
      data: employee.getPublicProfile()
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};
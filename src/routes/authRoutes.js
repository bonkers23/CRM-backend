const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateEmployeeRegistration,
  validateEmployeeLogin
} = require('../middleware/validators');

router.post('/register', validateEmployeeRegistration, register);
router.post('/login', validateEmployeeLogin, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
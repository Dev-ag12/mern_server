const express = require('express');
const {
  registerCompany,
  sendEmailOTP,
  verifyEmailOTP,
  sendMobileOTP,
  verifyMobileOTP,
  getCompanyProfile,
  loginCompany
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerCompany);
router.post('/login', loginCompany);
router.post('/verify-email', sendEmailOTP);
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/verify-mobile', sendMobileOTP);
router.post('/verify-mobile-otp', verifyMobileOTP);
router.get('/profile', authMiddleware, getCompanyProfile);

module.exports = router;

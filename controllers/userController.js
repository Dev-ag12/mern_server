const Company = require('../models/User');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const axios=require('axios');
require('dotenv').config();

// Email Transporter (For Sending OTPs)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Email
    pass: process.env.EMAIL_PASS  // Your Email Password or App Password
  }
});

// @desc    Register a Company
// @route   POST /api/companies/register
// @access  Public
exports.registerCompany = async (req, res) => {
  const { companyName, employees, registeredNumber, email, mobile, location, password } = req.body;

  try {
    // Check if company already exists
    let existingCompany = await Company.findOne({ $or: [{ email }, { registeredNumber }, { mobile }] });
    if (existingCompany) {
      return res.status(400).json({ msg: 'Company already registered with this email or mobile number' });
    }

    const company = new Company({
      companyName,
      employees,
      registeredNumber,
      email,
      mobile,
      location,
      password: password// Store hashed password
    });

    await company.save();
    res.status(201).json({ msg: "Company registered successfully! Please verify your email and mobile." });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Send Email Verification OTP
// @route   POST /api/companies/verify-email
// @access  Public
exports.sendEmailOTP = async (req, res) => {
  const { email } = req.body;

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  console.log("OTP generated:", otp);

  try {
    // Send OTP via email
    await transporter.sendMail({
      to: email,
      subject: "Email Verification OTP",
      text: `Your OTP for verification is ${otp}`
    });

    // Send OTP in the response (frontend will store it in localStorage)
    res.json({ msg: "OTP sent to email", otp });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// @desc    Verify Email OTP
// @route   POST /api/companies/verify-email-otp
// @access  Public
exports.verifyEmailOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const company = await Company.findOne({ email });
    if (!company || company.emailOtp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    company.emailVerified = true;
    company.emailOtp = null; // Remove OTP after verification
    await company.save();

    res.json({ msg: "Email verified successfully" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Send Mobile Verification OTP
// @route   POST /api/companies/verify-mobile
// @access  Public
exports.sendMobileOTP = async (req, res) => {
  const { mobile } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

  try {
    const company = await Company.findOne({ mobile });
    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    // Store OTP temporarily in DB
    company.mobileOTP = otp;
    await company.save();

    // Fast2SMS API Request
    const fast2smsResponse = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      route: "otp",
      variables_values: otp,
      numbers: mobile
    }, {
      headers: {
        "authorization": process.env.FAST2SMS_API_KEY, // Your Fast2SMS API Key
        "Content-Type": "application/json"
      }
    });

    console.log(`OTP sent to ${mobile}: ${otp}`);
    console.log(fast2smsResponse.data);

    res.json({ msg: "OTP sent to mobile", otp });

  } catch (err) {
    console.error("Fast2SMS Error:", err.response?.data || err.message);
    res.status(500).json({ msg: "Failed to send OTP" });
  }
};

// @desc    Verify Mobile OTP
// @route   POST /api/companies/verify-mobile-otp
// @access  Public
exports.verifyMobileOTP = async (req, res) => {
  const { mobile, otp } = req.body;

  try {
    const company = await Company.findOne({ mobile });
    if (!company || company.mobileOTP !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    company.mobileVerified = true;
    company.mobileOTP = null; // Remove OTP after verification
    await company.save();

    res.json({ msg: "Mobile number verified successfully" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get Company Profile
// @route   GET /api/companies/profile
// @access  Private
exports.getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.company.id).select('-emailOTP -mobileOTP');
    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }
    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
exports.loginCompany = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find company by email
    let company = await Company.findOne({ email });
    if (!company) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // // Check if email and mobile are verified
    // if (!company.emailVerified || !company.mobileVerified) {
    //   return res.status(403).json({ msg: "Please verify your email and mobile number before logging in" });
    // }

    // Check password (if using passwords in company schema)
    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      console.log(company.password)

      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ companyId: company.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ 
      token, 
      company: {
        id: company.id,
        companyName: company.companyName,
        email: company.email,
        mobile: company.mobile,
        location: company.location,
        employees: company.employees
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

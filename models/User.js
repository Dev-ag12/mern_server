const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  employees: { type: Number, required: true },
  registeredNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  mobileVerified: { type: Boolean, default: false },
  mobileOTP: { type: String, unique: false }, // OTP should not be unique
  password: { type: String, required: true }, // New Password Field
  location: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('user', UserSchema);

const jwt = require('jsonwebtoken');
const User = require("../models/User");
require('dotenv').config();

exports.protect = async (req, res, next) => {
    try {
      let token = req.headers.authorization;

      console.log(token);
  
      if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }
  
      token = token.split(' ')[1];
  
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ message: 'Invalid Token' });
      }

      console.log("decoded", decoded);
  
      const user = await User.findById(decoded.companyId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      req.user = user; // ✅ Attach user object to request
      next();
    } catch (error) {
      console.error('Protect Middleware Error:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  
  exports.employerOnly = (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: 'User not authenticated' });
    }
  
    next();
  };
  

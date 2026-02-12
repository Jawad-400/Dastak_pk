// middleware/validation.js
const jwt = require('jsonwebtoken');

exports.validateRegister = (req, res, next) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: 'Email, password, and name are required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters'
    });
  }

  next();
};

// ========== FIXED: Login validation for PHONE or EMAIL ==========
exports.validateLogin = (req, res, next) => {
  const { email, phone, password } = req.body;
  
  // ✅ Allow login with EITHER phone OR email
  if (!phone && !email) {
    return res.status(400).json({
      success: false,
      error: 'Phone number or email is required'
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      error: 'Password is required'
    });
  }

  next();
};

exports.validateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || 
                req.cookies?.token || 
                req.query?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

exports.validateRequest = (req, res, next) => {
  const { title, location, customerId } = req.body;
  
  if (!title || !location || !customerId) {
    return res.status(400).json({
      success: false,
      error: 'Title, location, and customerId are required'
    });
  }

  next();
};
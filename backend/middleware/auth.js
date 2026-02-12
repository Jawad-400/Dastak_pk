const jwt = require('jsonwebtoken');

// ==================== VERIFY TOKEN ====================
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || 
                req.cookies?.token || 
                req.query?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided. Please login.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid token. Please login again.'
    });
  }
};

// ==================== ROLE-BASED AUTHORIZATION ====================

// Allow only customers
exports.allowCustomer = (req, res, next) => {
  if (req.user.user_type !== 'customer') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. This endpoint is for customers only.'
    });
  }
  next();
};

// Allow only providers
exports.allowProvider = (req, res, next) => {
  if (req.user.user_type !== 'provider') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. This endpoint is for providers only.'
    });
  }
  next();
};

// Allow only admins
exports.allowAdmin = (req, res, next) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Allow customers and providers
exports.allowCustomerOrProvider = (req, res, next) => {
  if (!['customer', 'provider'].includes(req.user.user_type)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Customer or provider account required.'
    });
  }
  next();
};

// Check if user owns the resource
exports.checkResourceOwnership = (resourceUserId) => {
  return (req, res, next) => {
    if (req.user.user_type === 'admin') {
      return next();
    }
    
    if (req.user.userId != req.params[resourceUserId] && 
        req.user.userId != req.body[resourceUserId]) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this resource'
      });
    }
    next();
  };
};
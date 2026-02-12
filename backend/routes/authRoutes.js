// ==================== COMPLETE authRoutes.js ====================
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { verifyToken, checkResourceOwnership } = require('../middleware/auth');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes
router.get('/verify', verifyToken, authController.verifyToken);

// User routes
router.get('/users/:id', 
  verifyToken, 
  checkResourceOwnership('id'), 
  authController.getUser
);

// ✅ CRITICAL - THIS MUST BE HERE!
router.get('/users/:id/requests', 
  verifyToken, 
  checkResourceOwnership('id'), 
  authController.getUserRequests
);

module.exports = router;
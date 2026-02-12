const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { verifyToken, checkResourceOwnership } = require('../middleware/auth');

// Public routes (no token required)
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes (token required)
router.get('/verify', verifyToken, authController.verifyToken);

// User routes with ownership check
router.get('/users/:id', 
  verifyToken, 
  checkResourceOwnership('id'), 
  authController.getUser
);

router.get('/users/:id/requests', 
  verifyToken, 
  checkResourceOwnership('id'), 
  authController.getUserRequests
);

module.exports = router;
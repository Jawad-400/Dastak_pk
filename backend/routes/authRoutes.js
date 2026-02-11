const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');

// Public routes
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3 }).trim(),
  body('password').isLength({ min: 6 }),
  body('full_name').optional().trim(),
  body('phone').optional().isMobilePhone(),
  body('role').optional().isIn(['customer', 'provider'])
], AuthController.register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], AuthController.login);

router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], AuthController.forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], AuthController.resetPassword);

router.get('/verify-email', AuthController.verifyEmail);

router.get('/validate-session', AuthController.validateSession);

// Protected routes
router.get('/profile', auth.verifyToken, AuthController.getProfile);
router.put('/profile', auth.verifyToken, AuthController.updateProfile);
router.post('/logout', auth.verifyToken, AuthController.logout);

// Admin routes
router.get('/users', auth.verifyToken, auth.authorize('admin'), AuthController.getUsers);
router.get('/users/:userId', auth.verifyToken, auth.authorize('admin'), AuthController.getUserById);
router.put('/users/:userId', auth.verifyToken, auth.authorize('admin'), AuthController.updateUser);
router.delete('/users/:userId', auth.verifyToken, auth.authorize('admin'), AuthController.deleteUser);
router.get('/stats', auth.verifyToken, auth.authorize('admin'), AuthController.getStats);

module.exports = router;
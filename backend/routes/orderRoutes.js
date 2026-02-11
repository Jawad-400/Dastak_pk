const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const { body, param } = require('express-validator');

// All order routes require authentication
router.use(auth.verifyToken);

// Order management
router.post('/orders', [
  body('serviceType').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('location.address').notEmpty().trim(),
  body('price.amount').isFloat({ min: 0 }),
  body('schedule.preferredDate').optional().isISO8601(),
  auth.authorize('customer')
], OrderController.createOrder);

router.get('/orders', OrderController.getUserOrders);

router.get('/orders/available', [
  auth.authorize('provider')
], OrderController.getAvailableOrders);

router.get('/orders/search', [
  auth.authorize('admin')
], OrderController.searchOrders);

router.get('/orders/stats', [
  auth.authorize('admin')
], OrderController.getOrderStats);

router.get('/orders/:orderId', [
  param('orderId').notEmpty()
], OrderController.getOrder);

router.put('/orders/:orderId/status', [
  param('orderId').notEmpty(),
  body('status').isIn(['in_progress', 'completed', 'cancelled', 'rejected']),
  body('notes').optional().trim()
], OrderController.updateOrderStatus);

router.post('/orders/:orderId/accept', [
  param('orderId').notEmpty(),
  auth.authorize('provider')
], OrderController.acceptOrder);

// Order messages
router.post('/orders/:orderId/messages', [
  param('orderId').notEmpty(),
  body('message').notEmpty().trim()
], OrderController.addMessage);

router.get('/orders/:orderId/messages', [
  param('orderId').notEmpty()
], OrderController.getOrderMessages);

// Order ratings
router.post('/orders/:orderId/ratings', [
  param('orderId').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('type').isIn(['customer', 'provider']),
  body('review').optional().trim()
], OrderController.addRating);

// Admin only routes
router.put('/orders/:orderId', [
  param('orderId').notEmpty(),
  auth.authorize('admin')
], OrderController.updateOrder);

router.delete('/orders/:orderId', [
  param('orderId').notEmpty(),
  auth.authorize('admin')
], OrderController.deleteOrder);

module.exports = router;
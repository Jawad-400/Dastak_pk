const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, allowCustomer, allowProvider, allowCustomerOrProvider } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// ==================== CUSTOMER ROUTES ====================

// Create a new request (CUSTOMERS ONLY)
router.post('/requests', 
  verifyToken, 
  allowCustomer, 
  validateRequest, 
  orderController.createRequest
);

// ==================== PROVIDER ROUTES ====================

// Accept a request (PROVIDERS ONLY)
router.post('/requests/:id/accept', 
  verifyToken, 
  allowProvider, 
  orderController.acceptRequest
);

// Complete a request (PROVIDERS ONLY)
router.post('/requests/:id/complete', 
  verifyToken, 
  allowProvider, 
  orderController.completeRequest
);

// ==================== SHARED ROUTES ====================

// Get all requests (CUSTOMERS & PROVIDERS)
router.get('/requests', 
  verifyToken, 
  allowCustomerOrProvider, 
  orderController.getRequests
);

// Get single request by ID (CUSTOMERS & PROVIDERS)
router.get('/requests/:id', 
  verifyToken, 
  allowCustomerOrProvider, 
  orderController.getRequest
);

// ==================== PAYMENT ROUTES (STUBS) ====================
router.post('/payments/create', 
  verifyToken, 
  allowCustomer, 
  orderController.createPayment
);

router.post('/payments/verify', 
  verifyToken, 
  orderController.verifyPayment
);

module.exports = router;
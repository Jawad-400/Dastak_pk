const Order = require('../models/Order');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

class OrderController {
  // Create new order
  static async createOrder(req, res) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;
      
      if (userRole !== 'customer') {
        return res.status(403).json({ error: 'Only customers can create orders' });
      }

      const orderData = {
        ...req.body,
        customerId: userId,
        customerInfo: {
          name: req.user.full_name || req.user.username,
          email: req.user.email,
          phone: req.body.phone || ''
        },
        metadata: {
          source: 'web',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      };

      const order = await Order.create(orderData);

      // Emit WebSocket event for new order
      if (global.io) {
        global.io.emit('new_order', {
          orderId: order.orderId,
          serviceType: order.serviceType,
          location: order.location,
          priority: order.priority,
          createdAt: order.createdAt
        });
        
        // Notify specific providers based on service type/location
        global.io.to(`providers_${order.serviceType}`).emit('order_available', order);
      }

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order }
      });

    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Failed to create order', details: error.message });
    }
  }

  // Get order by ID
  static async getOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check permissions
      if (userRole !== 'admin' && 
          order.customerId !== userId && 
          order.providerId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({
        success: true,
        data: { order }
      });

    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  }

  // Get user's orders
  static async getUserOrders(req, res) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;
      const { status, page = 1, limit = 10 } = req.query;

      let result;
      
      if (userRole === 'customer') {
        result = await Order.findByCustomer(userId, { status, page, limit });
      } else if (userRole === 'provider') {
        result = await Order.findByProvider(userId, { status, page, limit });
      } else {
        // Admin can see all orders
        result = await Order.search({ status, page, limit });
      }

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  // Get available orders for providers
  static async getAvailableOrders(req, res) {
    try {
      if (req.user.role !== 'provider') {
        return res.status(403).json({ error: 'Only providers can view available orders' });
      }

      const { 
        serviceType, 
        location, 
        maxDistance, 
        page = 1, 
        limit = 20 
      } = req.query;

      let locationObj = null;
      if (location) {
        try {
          locationObj = JSON.parse(location);
        } catch (e) {
          return res.status(400).json({ error: 'Invalid location format' });
        }
      }

      const result = await Order.findAvailableOrders({
        serviceType,
        location: locationObj,
        maxDistance: maxDistance ? parseInt(maxDistance) : 5000,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Get available orders error:', error);
      res.status(500).json({ error: 'Failed to fetch available orders' });
    }
  }

  // Accept order (provider)
  static async acceptOrder(req, res) {
    try {
      if (req.user.role !== 'provider') {
        return res.status(403).json({ error: 'Only providers can accept orders' });
      }

      const { orderId } = req.params;
      const userId = req.user.userId;

      // Get provider info
      const user = await User.findByUuid(userId);
      const providerInfo = {
        name: user.full_name || user.username,
        email: user.email,
        phone: user.phone || ''
      };

      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({ error: 'Order is not available for acceptance' });
      }

      // Update order
      const updatedOrder = await Order.updateStatus(
        orderId, 
        'accepted', 
        userId, 
        'provider',
        'Order accepted by provider'
      );

      // Also update provider info
      await Order.update(orderId, { providerInfo });

      // Notify customer via WebSocket
      if (global.io) {
        global.io.to(`customer_${order.customerId}`).emit('order_accepted', {
          orderId: order.orderId,
          provider: providerInfo,
          acceptedAt: new Date()
        });
      }

      res.json({
        success: true,
        message: 'Order accepted successfully',
        data: { order: updatedOrder }
      });

    } catch (error) {
      console.error('Accept order error:', error);
      res.status(500).json({ error: 'Failed to accept order' });
    }
  }

  // Update order status
  static async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status, notes } = req.body;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const allowedStatuses = ['in_progress', 'completed', 'cancelled', 'rejected'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check permissions
      if (userRole === 'customer' && order.customerId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      if (userRole === 'provider' && order.providerId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Validate status transition
      const validTransitions = {
        pending: ['accepted', 'cancelled', 'rejected'],
        accepted: ['in_progress', 'cancelled'],
        in_progress: ['completed', 'cancelled'],
        completed: [],
        cancelled: [],
        rejected: []
      };

      if (!validTransitions[order.status]?.includes(status)) {
        return res.status(400).json({ 
          error: `Cannot change status from ${order.status} to ${status}` 
        });
      }

      const updatedOrder = await Order.updateStatus(
        orderId, 
        status, 
        userId, 
        userRole,
        notes || `Status changed to ${status}`
      );

      // Notify relevant parties via WebSocket
      if (global.io) {
        const notificationData = {
          orderId: order.orderId,
          status,
          updatedBy: userId,
          updatedAt: new Date()
        };

        // Notify customer
        if (userRole !== 'customer') {
          global.io.to(`customer_${order.customerId}`).emit('order_status_updated', notificationData);
        }

        // Notify provider
        if (userRole !== 'provider' && order.providerId) {
          global.io.to(`provider_${order.providerId}`).emit('order_status_updated', notificationData);
        }

        // Notify admin
        global.io.to('admin').emit('order_status_updated', notificationData);
      }

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: { order: updatedOrder }
      });

    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }

  // Add message to order
  static async addMessage(req, res) {
    try {
      const { orderId } = req.params;
      const { message } = req.body;
      const userId = req.user.userId;
      const userRole = req.user.role;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check permissions
      const canMessage = 
        userRole === 'admin' ||
        order.customerId === userId ||
        order.providerId === userId;
      
      if (!canMessage) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const messageData = {
        senderId: userId,
        senderType: userRole,
        message: message.trim()
      };

      const updatedOrder = await Order.addMessage(orderId, messageData);

      // Notify via WebSocket
      if (global.io) {
        const notificationData = {
          orderId: order.orderId,
          message: messageData,
          sender: {
            id: userId,
            type: userRole,
            name: req.user.full_name || req.user.username
          }
        };

        // Notify customer
        if (userRole !== 'customer') {
          global.io.to(`customer_${order.customerId}`).emit('new_message', notificationData);
        }

        // Notify provider
        if (userRole !== 'provider' && order.providerId) {
          global.io.to(`provider_${order.providerId}`).emit('new_message', notificationData);
        }

        // Notify admin
        global.io.to('admin').emit('new_message', notificationData);
      }

      res.json({
        success: true,
        message: 'Message sent successfully',
        data: { order: updatedOrder }
      });

    } catch (error) {
      console.error('Add message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  // Add rating to order
  static async addRating(req, res) {
    try {
      const { orderId } = req.params;
      const { rating, review, type } = req.body; // type: 'customer' or 'provider'
      const userId = req.user.userId;
      const userRole = req.user.role;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.status !== 'completed') {
        return res.status(400).json({ error: 'Only completed orders can be rated' });
      }

      // Check who can rate
      if (type === 'customer' && order.customerId !== userId) {
        return res.status(403).json({ error: 'Only the customer can rate the provider' });
      }
      
      if (type === 'provider' && order.providerId !== userId) {
        return res.status(403).json({ error: 'Only the provider can rate the customer' });
      }

      // Check if already rated
      if (type === 'customer' && order.ratings?.customerRating) {
        return res.status(400).json({ error: 'Customer already rated this order' });
      }
      
      if (type === 'provider' && order.ratings?.providerRating) {
        return res.status(400).json({ error: 'Provider already rated this order' });
      }

      const ratingData = {
        ...order.ratings,
        [`${type}Rating`]: rating,
        [`${type}Review`]: review || '',
        ratedAt: new Date()
      };

      const updatedOrder = await Order.addRating(orderId, ratingData);

      // Update user's average rating (you'd implement this separately)

      res.json({
        success: true,
        message: 'Rating submitted successfully',
        data: { order: updatedOrder }
      });

    } catch (error) {
      console.error('Add rating error:', error);
      res.status(500).json({ error: 'Failed to submit rating' });
    }
  }

  // Search orders (admin)
  static async searchOrders(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { 
        query, 
        status, 
        serviceType, 
        dateFrom, 
        dateTo, 
        page = 1, 
        limit = 20 
      } = req.query;

      const result = await Order.search({
        query,
        status,
        serviceType,
        dateFrom,
        dateTo,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Search orders error:', error);
      res.status(500).json({ error: 'Failed to search orders' });
    }
  }

  // Get order statistics (admin)
  static async getOrderStats(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { timeframe = 'month' } = req.query;
      const stats = await Order.getStats(timeframe);

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      console.error('Get order stats error:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  // Delete order (admin)
  static async deleteOrder(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { orderId } = req.params;
      const userId = req.user.userId;

      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const deletedOrder = await Order.delete(orderId, userId);

      res.json({
        success: true,
        message: 'Order deleted successfully',
        data: { order: deletedOrder }
      });

    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({ error: 'Failed to delete order' });
    }
  }

  // Update order (admin)
  static async updateOrder(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { orderId } = req.params;
      const updates = req.body;

      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Don't allow status updates through this endpoint
      if (updates.status) {
        delete updates.status;
      }

      const updatedOrder = await Order.update(orderId, updates);

      res.json({
        success: true,
        message: 'Order updated successfully',
        data: { order: updatedOrder }
      });

    } catch (error) {
      console.error('Update order error:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  }

  // Get order messages
  static async getOrderMessages(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check permissions
      const canView = 
        userRole === 'admin' ||
        order.customerId === userId ||
        order.providerId === userId;
      
      if (!canView) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Mark messages as read
      await Order.markMessagesAsRead(orderId, userId);

      res.json({
        success: true,
        data: { messages: order.messages || [] }
      });

    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }
}

module.exports = OrderController;
// frontend/src/services/orderService.js
import axios from 'axios';
import authService from './auth';
import { socket } from './websocket';

const API_URL = process.env.REACT_APP_API_URL || '${process.env.REACT_APP_API_URL}/api';

class OrderService {
  // Create new order
  async createOrder(orderData) {
    try {
      const response = await axios.post(`${API_URL}/orders`, orderData);
      
      if (response.data.success) {
        // Emit WebSocket event
        socket.emit('new_order', response.data.data.order);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create order' };
    }
  }

  // Get user's orders
  async getUserOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_URL}/orders?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch orders' };
    }
  }

  // Get available orders (for providers)
  async getAvailableOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_URL}/orders/available?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch available orders' };
    }
  }

  // Get order by ID
  async getOrder(orderId) {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch order' };
    }
  }

  // Accept order (provider)
  async acceptOrder(orderId) {
    try {
      const response = await axios.post(`${API_URL}/orders/${orderId}/accept`);
      
      if (response.data.success) {
        socket.emit('order_accepted', {
          orderId,
          provider: authService.getCurrentUser()
        });
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to accept order' };
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status, notes = '') {
    try {
      const response = await axios.put(`${API_URL}/orders/${orderId}/status`, {
        status,
        notes
      });
      
      if (response.data.success) {
        socket.emit('order_status_updated', {
          orderId,
          status,
          updatedBy: authService.getCurrentUser().id
        });
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update order status' };
    }
  }

  // Send message in order
  async sendMessage(orderId, message) {
    try {
      const response = await axios.post(`${API_URL}/orders/${orderId}/messages`, {
        message
      });
      
      if (response.data.success) {
        socket.emit('new_message', {
          orderId,
          message,
          sender: authService.getCurrentUser()
        });
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to send message' };
    }
  }

  // Get order messages
  async getOrderMessages(orderId) {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}/messages`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch messages' };
    }
  }

  // Add rating to order
  async addRating(orderId, ratingData) {
    try {
      const response = await axios.post(`${API_URL}/orders/${orderId}/ratings`, ratingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to submit rating' };
    }
  }

  // Search orders (admin only)
  async searchOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_URL}/orders/search?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to search orders' };
    }
  }

  // Get order statistics (admin only)
  async getOrderStats(timeframe = 'month') {
    try {
      const response = await axios.get(`${API_URL}/orders/stats?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch statistics' };
    }
  }

  // Subscribe to order events
  subscribeToOrderEvents(orderId, callbacks) {
    const { onStatusUpdate, onNewMessage, onAccepted } = callbacks;
    
    if (onStatusUpdate) {
      socket.on(`order_status_${orderId}`, onStatusUpdate);
    }
    
    if (onNewMessage) {
      socket.on(`order_message_${orderId}`, onNewMessage);
    }
    
    if (onAccepted) {
      socket.on(`order_accepted_${orderId}`, onAccepted);
    }
    
    // Join order room
    socket.emit('join_order', { orderId });
  }

  // Unsubscribe from order events
  unsubscribeFromOrderEvents(orderId) {
    socket.off(`order_status_${orderId}`);
    socket.off(`order_message_${orderId}`);
    socket.off(`order_accepted_${orderId}`);
    
    // Leave order room
    socket.emit('leave_order', { orderId });
  }
}

// Create singleton instance
const orderService = new OrderService();

export default orderService;

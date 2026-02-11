import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { socket } from '../services/websocket';
import { useAuth } from './AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const OrderContext = createContext({});

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, isProvider, isCustomer } = useAuth();

  // Fetch user's orders
  const fetchMyOrders = async (status = '') => {
    if (!user) return;
    
    setLoading(true);
    try {
      const url = status 
        ? `${API_URL}/orders?status=${status}`
        : `${API_URL}/orders`;
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        setOrders(response.data.data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available orders (for providers)
  const fetchAvailableOrders = async () => {
    if (!isProvider) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/orders/available`);
      
      if (response.data.success) {
        setAvailableOrders(response.data.data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch available orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new order
  const createOrder = async (orderData) => {
    if (!isCustomer) return { success: false, error: 'Only customers can create orders' };
    
    try {
      const response = await axios.post(`${API_URL}/orders`, orderData);
      
      if (response.data.success) {
        const newOrder = response.data.data.order;
        
        // Add to local state
        setOrders(prev => [newOrder, ...prev]);
        
        // Emit WebSocket event
        socket.emit('new_order', newOrder);
        
        return { success: true, order: newOrder };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create order' 
      };
    }
  };

  // Accept order (provider)
  const acceptOrder = async (orderId) => {
    if (!isProvider) return { success: false, error: 'Only providers can accept orders' };
    
    try {
      const response = await axios.post(`${API_URL}/orders/${orderId}/accept`);
      
      if (response.data.success) {
        // Update local state
        setAvailableOrders(prev => prev.filter(order => order.orderId !== orderId));
        setOrders(prev => [response.data.data.order, ...prev]);
        
        // Emit WebSocket event
        socket.emit('order_accepted', {
          orderId,
          provider: user
        });
        
        return { success: true, order: response.data.data.order };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to accept order' 
      };
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status, notes = '') => {
    try {
      const response = await axios.put(`${API_URL}/orders/${orderId}/status`, {
        status,
        notes
      });
      
      if (response.data.success) {
        // Update local state
        const updatedOrder = response.data.data.order;
        
        setOrders(prev => prev.map(order => 
          order.orderId === orderId ? updatedOrder : order
        ));
        
        setAvailableOrders(prev => prev.map(order => 
          order.orderId === orderId ? updatedOrder : order
        ));
        
        if (currentOrder?.orderId === orderId) {
          setCurrentOrder(updatedOrder);
        }
        
        // Emit WebSocket event
        socket.emit('order_status_updated', {
          orderId,
          status,
          updatedBy: user.id
        });
        
        return { success: true, order: updatedOrder };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update order status' 
      };
    }
  };

  // Send message in order
  const sendMessage = async (orderId, message) => {
    try {
      const response = await axios.post(`${API_URL}/orders/${orderId}/messages`, {
        message
      });
      
      if (response.data.success) {
        const updatedOrder = response.data.data.order;
        
        // Update local state
        if (currentOrder?.orderId === orderId) {
          setCurrentOrder(updatedOrder);
        }
        
        // Emit WebSocket event
        socket.emit('new_message', {
          orderId,
          message,
          sender: user
        });
        
        return { success: true, order: updatedOrder };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to send message' 
      };
    }
  };

  // Get order details
  const getOrder = async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`);
      
      if (response.data.success) {
        setCurrentOrder(response.data.data.order);
        return { success: true, order: response.data.data.order };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch order' 
      };
    }
  };

  // WebSocket event listeners
  useEffect(() => {
    if (!socket.isConnected()) return;

    // Listen for new orders (for providers)
    socket.on('new_order', (order) => {
      if (isProvider) {
        setAvailableOrders(prev => [order, ...prev]);
      }
    });

    // Listen for order acceptance (for customers)
    socket.on('order_accepted', (data) => {
      if (isCustomer) {
        setOrders(prev => prev.map(order => 
          order.orderId === data.orderId 
            ? { ...order, status: 'accepted', providerId: data.provider.id }
            : order
        ));
      }
    });

    // Listen for status updates
    socket.on('order_status_updated', (data) => {
      const updateOrderInList = (list) => list.map(order => 
        order.orderId === data.orderId 
          ? { ...order, status: data.status }
          : order
      );
      
      setOrders(updateOrderInList);
      setAvailableOrders(updateOrderInList);
      
      if (currentOrder?.orderId === data.orderId) {
        setCurrentOrder(prev => ({ ...prev, status: data.status }));
      }
    });

    // Listen for new messages
    socket.on('new_message', (data) => {
      if (currentOrder?.orderId === data.orderId) {
        setCurrentOrder(prev => ({
          ...prev,
          messages: [...(prev.messages || []), data.message]
        }));
      }
    });

    return () => {
      socket.off('new_order');
      socket.off('order_accepted');
      socket.off('order_status_updated');
      socket.off('new_message');
    };
  }, [user, isProvider, isCustomer, currentOrder]);

  // Auto-fetch orders when user changes
  useEffect(() => {
    if (user) {
      if (isCustomer) {
        fetchMyOrders();
      } else if (isProvider) {
        fetchAvailableOrders();
      }
    }
  }, [user]);

  const value = {
    orders,
    availableOrders,
    currentOrder,
    loading,
    fetchMyOrders,
    fetchAvailableOrders,
    createOrder,
    acceptOrder,
    updateOrderStatus,
    sendMessage,
    getOrder,
    setCurrentOrder
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};
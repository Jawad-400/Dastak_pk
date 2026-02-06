// WebSocket service for real-time communication
import { io } from 'socket.io-client';

// Use environment variable or default to localhost
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Create socket connection with options
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  autoConnect: true
});

// Socket event handlers
socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server:', socket.id);
  
  // Join provider room if provider is logged in
  const providerData = localStorage.getItem('dastak_provider');
  if (providerData) {
    const provider = JSON.parse(providerData);
    socket.emit('join-provider-room', provider.id);
  }
  
  // Join customer room if customer is logged in
  const customerData = localStorage.getItem('dastak_user');
  if (customerData) {
    const customer = JSON.parse(customerData);
    socket.emit('join-customer-room', customer.phone);
  }
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected from WebSocket server:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket connection error:', error.message);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 Reconnected to WebSocket server. Attempt:', attemptNumber);
});

socket.on('reconnect_error', (error) => {
  console.error('❌ WebSocket reconnection error:', error);
});

socket.on('reconnect_failed', () => {
  console.error('❌ Failed to reconnect to WebSocket server');
});

// Real-time event handlers
socket.on('new-request', (request) => {
  console.log('📢 New service request:', request);
  
  // Dispatch custom event for components to listen to
  const event = new CustomEvent('new-service-request', { detail: request });
  window.dispatchEvent(event);
});

socket.on('new-bid', (bid) => {
  console.log('💰 New bid received:', bid);
  
  const event = new CustomEvent('new-bid-notification', { detail: bid });
  window.dispatchEvent(event);
});

socket.on('bid-accepted', (data) => {
  console.log('✅ Bid accepted:', data);
  
  const event = new CustomEvent('bid-accepted-notification', { detail: data });
  window.dispatchEvent(event);
});

socket.on('order-updated', (order) => {
  console.log('🔄 Order updated:', order);
  
  const event = new CustomEvent('order-updated-notification', { detail: order });
  window.dispatchEvent(event);
});

socket.on('chat-message', (message) => {
  console.log('💬 New chat message:', message);
  
  const event = new CustomEvent('new-chat-message', { detail: message });
  window.dispatchEvent(event);
});

// Export socket instance
export { socket };

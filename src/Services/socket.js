// Services/socket.js - COMPLETE FIXED VERSION
class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.url = process.env.REACT_APP_WS_URL || 'ws://localhost:4000/ws';
    
    // Initialize with stored auth data
    this.initializeAuth();
    
    this.isManualDisconnect = false;
    this.messageQueue = [];
    this.isConnecting = false;
    this.pingInterval = null;
    this.lastPong = Date.now();
    this.eventListeners = new Map();
    
    // ✅ FIX: Add connection lock to prevent multiple connections
    this.connectionLock = false;
  }

  // ========== INITIALIZATION ==========
  initializeAuth() {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    let userData = null;
    if (storedUser) {
      try {
        userData = JSON.parse(storedUser);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    
    this.queryParams = {
      type: userData?.user_type || userData?.role || 'customer',
      user_id: userData?.id || userData?.userId || 'anonymous',
      name: userData?.name || userData?.username || 'Customer',
      token: token || '',
      service: userData?.service || ''
    };
  }

  // ========== QUERY PARAMS METHODS ==========
  updateQueryParams(params) {
    console.log('🔄 Updating WebSocket query params:', params);
    this.queryParams = { ...this.queryParams, ...params };
    return this;
  }

  // ========== AUTHENTICATION METHODS ==========
  updateAuth(userData) {
    if (!userData) {
      console.error('❌ No user data provided to updateAuth');
      return;
    }

    const userId = userData.id || userData.userId;
    const userName = userData.name || userData.username;
    const userRole = userData.user_type || userData.role;
    const token = userData.token || localStorage.getItem('token');
    const service = userData.service || '';

    if (!userId || !userRole || !token) {
      console.error('❌ Missing required auth fields:', { userId, userRole, token });
      return;
    }

    console.log('🔐 Updating WebSocket auth:', { userId, userName, userRole });

    this.queryParams = {
      ...this.queryParams,
      type: userRole,
      user_id: userId.toString(),
      name: userName || 'User',
      token: token,
      service: service
    };

    if (token) localStorage.setItem('token', token);
    
    const userForStorage = {
      id: userId,
      name: userName,
      user_type: userRole,
      service: service
    };
    localStorage.setItem('user', JSON.stringify(userForStorage));

    // ✅ FIX: Don't auto-reconnect if already connected/connecting
    if (this.isConnected()) {
      console.log('✅ Already connected with valid auth');
      return;
    }
    
    if (!this.isConnecting && !this.connectionLock) {
      setTimeout(() => this.connect(), 500);
    }
  }

  clearAuth() {
    console.log('🔓 Clearing WebSocket authentication');
    
    this.queryParams = {
      type: 'customer',
      user_id: 'anonymous',
      name: 'Customer',
      token: '',
      service: ''
    };

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    if (this.isConnected()) {
      this.disconnect();
    }
  }

  // ========== CONNECTION METHODS ==========
  buildUrl() {
    const params = new URLSearchParams(this.queryParams);
    return `${this.url}?${params.toString()}`;
  }

  connect() {
    // ✅ FIX: Prevent multiple connection attempts
    if (this.connectionLock) {
      console.log('🔒 Connection already in progress, skipping...');
      return;
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected');
      return;
    }
    
    if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
      console.log('⏳ WebSocket already connecting');
      return;
    }

    // Don't connect without token
    if (!this.queryParams.token) {
      console.log('⏸️ No token available, waiting for authentication...');
      return;
    }

    this.connectionLock = true;
    this.isManualDisconnect = false;
    this.isConnecting = true;
    
    const fullUrl = this.buildUrl();
    console.log(`🔗 Connecting to WebSocket server: ${fullUrl.replace(/token=([^&]*)/, 'token=***')}`);
    
    try {
      this.socket = new WebSocket(fullUrl);
      
      this.socket.onopen = () => {
        console.log('✅✅✅ CONNECTED to WebSocket server!');
        console.log('👤 Connected as:', this.queryParams.name, `(${this.queryParams.user_id})`, `Role: ${this.queryParams.type}`);
        this.connected = true;
        this.isConnecting = false;
        this.connectionLock = false;
        this.reconnectAttempts = 0;
        this.setupHeartbeat();
        this.flushMessageQueue();
        this.dispatchEvent('connected', {
          connected: true,
          user: {
            id: this.queryParams.user_id,
            name: this.queryParams.name,
            role: this.queryParams.type
          }
        });
      };

      this.socket.onmessage = (event) => {
        const rawData = event.data.toString();
        
        if (rawData === 'pong' || rawData.includes('pong')) {
          this.lastPong = Date.now();
          return;
        }
        
        try {
          const data = JSON.parse(rawData);
          console.log('📨 Received:', data.event || 'message');
          
          if (data.event === 'pong' || data.type === 'pong') {
            this.lastPong = Date.now();
          }
          
          if (data.event) {
            this.dispatchEvent(data.event, data.data || data);
          }
          this.dispatchEvent('message', data);
          
        } catch (error) {
          console.log('📝 Plain text:', rawData.substring(0, 200));
        }
      };

      this.socket.onclose = (event) => {
        console.log('❌ WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
        this.connected = false;
        this.isConnecting = false;
        this.connectionLock = false;
        this.socket = null;
        
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }
        
        this.dispatchEvent('disconnected', {
          code: event.code,
          reason: event.reason
        });
        
        // ✅ FIX: Only reconnect if not manual disconnect and has token
        if (!this.isManualDisconnect && 
            event.code !== 1000 && 
            this.reconnectAttempts < this.maxReconnectAttempts &&
            this.queryParams.token) {
          
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * Math.min(this.reconnectAttempts, 3);
          
          console.log(`🔄 Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
          
          setTimeout(() => {
            this.connectionLock = false;
            this.connect();
          }, delay);
        }
      };

      this.socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
        this.connectionLock = false;
        this.dispatchEvent('error', { error });
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.connectionLock = false;
    }
  }

  // ========== MESSAGE METHODS ==========
  send(event, data = {}) {
    if (!this.isConnected()) {
      console.log('⏳ WebSocket not connected, queueing message:', event);
      this.messageQueue.push({ event, data });
      
      // Try to connect if not already
      if (!this.isConnecting && !this.connectionLock && this.queryParams.token) {
        setTimeout(() => this.connect(), 100);
      }
      return false;
    }

    const message = {
      event: event,
      data: data,
      timestamp: Date.now()
    };

    try {
      this.socket.send(JSON.stringify(message));
      console.log('📤 Sent:', event);
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      this.messageQueue.push({ event, data });
      return false;
    }
  }

  emit(event, data) {
    return this.send(event, data);
  }

  flushMessageQueue() {
    if (this.messageQueue.length === 0) return;
    console.log(`📤 Flushing ${this.messageQueue.length} queued messages...`);
    
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    
    queue.forEach(({ event, data }) => {
      setTimeout(() => this.send(event, data), 100);
    });
  }

  // ========== HEARTBEAT ==========
  setupHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping', { heartbeat: true });
        this.lastPong = Date.now();
      }
    }, 15000);
  }

  // ========== EVENT LISTENERS ==========
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
    return this;
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
    return this;
  }

  dispatchEvent(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // ========== CONNECTION MANAGEMENT ==========
  reconnect() {
    console.log('🔄 Manual reconnection requested');
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  disconnect() {
    this.isManualDisconnect = true;
    this.isConnecting = false;
    this.connectionLock = false;
    this.messageQueue = [];
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }
    
    this.connected = false;
    console.log('👋 WebSocket manually disconnected');
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  getState() {
    if (!this.socket) return 'CLOSED';
    switch(this.socket.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }

  getCurrentUser() {
    return {
      id: this.queryParams.user_id,
      name: this.queryParams.name,
      role: this.queryParams.type,
      service: this.queryParams.service,
      isAuthenticated: this.queryParams.user_id !== 'anonymous' && !!this.queryParams.token
    };
  }
}

// ========== CREATE SINGLETON INSTANCE ==========
const socket = new WebSocketService();

// ========== ✅ FIXED: DON'T AUTO-CONNECT ON PAGE LOAD ==========
// Wait for user authentication instead of auto-connecting
if (typeof window !== 'undefined') {
  // Just initialize, don't connect automatically
  console.log('📡 WebSocket service initialized, waiting for authentication...');
}

export { socket };
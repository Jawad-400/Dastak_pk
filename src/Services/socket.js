// Services/socket.js - FIXED VERSION
class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 20;
    this.reconnectDelay = 1000;
    this.url = process.env.REACT_APP_WS_URL || 'ws://localhost:4000/ws';
    
    this.initializeAuth();
    
    this.isManualDisconnect = false;
    this.messageQueue = [];
    this.isConnecting = false;
    this.pingInterval = null;
    this.heartbeatCheck = null;
    this.lastPong = Date.now();
    this.eventListeners = new Map();
    this.connectionLock = false;
    this.forcedClose = false;
    
    // Store last received data for each event type
    this.lastData = new Map();
    
    // Bind methods
    this.handleOpen = this.handleOpen.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
  }

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

  updateQueryParams(params) {
    this.queryParams = { ...this.queryParams, ...params };
    return this;
  }

  updateAuth(userData) {
    if (!userData) return;

    const userId = userData.id || userData.userId;
    const userName = userData.name || userData.username;
    const userRole = userData.user_type || userData.role;
    const token = userData.token || localStorage.getItem('token');
    const service = userData.service || '';

    if (!userId || !userRole || !token) return;

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

    if (!this.isConnected()) {
      setTimeout(() => this.connect(), 500);
    }
  }

  clearAuth() {
    this.queryParams = {
      type: 'customer',
      user_id: 'anonymous',
      name: 'Customer',
      token: '',
      service: ''
    };

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.lastData.clear();

    if (this.isConnected()) {
      this.forcedClose = true;
      this.disconnect();
    }
  }

  buildUrl() {
    const params = new URLSearchParams(this.queryParams);
    return `${this.url}?${params.toString()}`;
  }

  connect() {
    if (this.connectionLock) {
      console.log('🔒 Connection already in progress');
      return;
    }

    if (this.isConnected()) {
      console.log('✅ Already connected');
      this.dispatchEvent('connected', { connected: true });
      return;
    }

    if (!this.queryParams.token) {
      console.log('⏸️ No token available');
      return;
    }

    this.connectionLock = true;
    this.isManualDisconnect = false;
    this.isConnecting = true;
    this.forcedClose = false;
    
    const fullUrl = this.buildUrl();
    console.log(`🔗 Connecting to WebSocket with URL:`, fullUrl);
    
    try {
      if (this.socket) {
        try {
          this.socket.close();
        } catch (e) {}
        this.socket = null;
      }

      this.socket = new WebSocket(fullUrl);
      this.socket.binaryType = 'arraybuffer';
      
      this.socket.onopen = this.handleOpen;
      this.socket.onmessage = this.handleMessage;
      this.socket.onclose = this.handleClose;
      this.socket.onerror = this.handleError;

    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.connectionLock = false;
      this.scheduleReconnect();
    }
  }

  handleOpen = (event) => {
    console.log('✅✅✅ WebSocket CONNECTED!', event);
    this.connected = true;
    this.isConnecting = false;
    this.connectionLock = false;
    this.reconnectAttempts = 0;
    this.lastPong = Date.now();
    
    this.startHeartbeat();
    this.flushMessageQueue();
    
    // Request pending requests immediately after connection for providers
    if (this.queryParams.type === 'provider') {
      console.log('👷 Provider connected, requesting pending requests...');
      setTimeout(() => {
        this.getPendingRequests();
      }, 500);
    }
    
    this.dispatchEvent('connected', {
      connected: true,
      user: this.getCurrentUser()
    });
  };

  handleMessage = (event) => {
    const rawData = event.data;
    console.log('📨 WebSocket message received:', rawData);
    
    try {
      const data = JSON.parse(rawData);
      console.log('📦 Parsed message:', data);
      
      // Handle pong responses
      if (data.event === 'pong') {
        this.lastPong = Date.now();
        return;
      }
      
      // Handle welcome message
      if (data.event === 'welcome') {
        console.log('👋 Welcome message:', data.data);
        this.dispatchEvent('welcome', data.data);
        return;
      }
      
      // Handle pending_requests specifically
      if (data.event === 'pending_requests') {
        const requests = data.data || [];
        console.log(`📨 Received ${requests.length} pending requests:`, requests);
        
        // Store the data for this event type
        this.lastData.set('pending_requests', requests);
        
        // Dispatch multiple events for flexibility
        this.dispatchEvent('pending_requests', requests);
        this.dispatchEvent('requests_update', requests);
        this.dispatchEvent('pending_count', requests.length);
        
        // Force a re-render by dispatching a generic update
        this.dispatchEvent('message', data);
      }
      
      // Handle new_request event
      else if (data.event === 'new_request') {
        console.log('🆕 New request received:', data.data);
        
        // Update stored pending requests if they exist
        const currentRequests = this.lastData.get('pending_requests') || [];
        if (Array.isArray(currentRequests)) {
          const updatedRequests = [...currentRequests, data.data];
          this.lastData.set('pending_requests', updatedRequests);
          this.dispatchEvent('pending_requests', updatedRequests);
          this.dispatchEvent('pending_count', updatedRequests.length);
        }
        
        this.dispatchEvent('new_request', data.data);
        this.dispatchEvent('message', data);
      }
      
      // Handle all other events
      else if (data.event) {
        console.log(`📨 Dispatching event: ${data.event}`, data.data);
        this.dispatchEvent(data.event, data.data || data);
        this.dispatchEvent('message', data);
      }
      
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error, rawData);
    }
  };

  handleClose = (event) => {
    console.log('❌ WebSocket closed. Code:', event.code, 'Reason:', event.reason);
    
    this.connected = false;
    this.isConnecting = false;
    this.connectionLock = false;
    this.socket = null;
    
    this.stopHeartbeat();
    
    this.dispatchEvent('disconnected', {
      code: event.code,
      reason: event.reason
    });
    
    if (this.isManualDisconnect || this.forcedClose) {
      console.log('👋 Manual disconnect - not reconnecting');
      return;
    }
    
    if (!this.queryParams.token) {
      console.log('⏸️ No token - not reconnecting');
      return;
    }
    
    this.scheduleReconnect();
  };

  handleError = (error) => {
    console.error('❌ WebSocket error:', error);
    this.dispatchEvent('error', { error });
  };

  startHeartbeat() {
    this.stopHeartbeat();
    
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping', { heartbeat: true });
      }
    }, 20000);
    
    this.heartbeatCheck = setInterval(() => {
      if (this.isConnected() && Date.now() - this.lastPong > 40000) {
        console.log('⚠️ No pong received for 40s, reconnecting...');
        this.reconnect();
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.heartbeatCheck) {
      clearInterval(this.heartbeatCheck);
      this.heartbeatCheck = null;
    }
  }

  scheduleReconnect() {
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 30000);
    
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      console.log(`🔄 Reconnecting in ${Math.round(delay/1000)}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connectionLock = false;
        this.connect();
      }, delay);
    } else {
      console.log('❌ Max reconnection attempts reached');
      this.dispatchEvent('max_reconnect', { attempts: this.reconnectAttempts });
    }
  }

  send(event, data = {}) {
    if (!this.isConnected()) {
      console.log(`📤 Queueing message: ${event} (not connected)`);
      this.messageQueue.push({ event, data });
      
      if (!this.isConnecting && !this.connectionLock && this.queryParams.token) {
        this.connect();
      }
      return false;
    }

    const message = {
      event: event,
      data: data,
      timestamp: Date.now()
    };

    try {
      const messageStr = JSON.stringify(message);
      console.log(`📤 Sending message: ${event}`, data);
      this.socket.send(messageStr);
      return true;
    } catch (error) {
      console.error('❌ Send error:', error);
      this.messageQueue.push({ event, data });
      return false;
    }
  }

  emit(event, data) {
    return this.send(event, data);
  }

  // Special method for providers to get pending requests
  getPendingRequests() {
    console.log('📨 Requesting pending requests from server...');
    return this.send('get_pending_requests', { 
      provider_id: this.queryParams.user_id,
      service: this.queryParams.service 
    });
  }

  flushMessageQueue() {
    if (this.messageQueue.length === 0) return;
    
    console.log(`📤 Flushing ${this.messageQueue.length} queued messages`);
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    
    queue.forEach(({ event, data }, index) => {
      setTimeout(() => this.send(event, data), index * 100);
    });
  }

  // ========== EVENT LISTENERS ==========
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
    console.log(`👂 Listener added for event: ${event}, total listeners: ${this.eventListeners.get(event).size}`);
    
    // If we have stored data for this event, call the callback immediately
    if (this.lastData.has(event)) {
      console.log(`📦 Found cached data for ${event}, calling callback immediately`);
      setTimeout(() => {
        try {
          callback(this.lastData.get(event));
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      }, 0);
    }
    
    return this;
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
      console.log(`👂 Listener removed for event: ${event}, remaining: ${this.eventListeners.get(event).size}`);
    }
    return this;
  }

  dispatchEvent(event, data) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      console.log(`📢 Dispatching event: ${event} to ${listeners.size} listeners`);
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    } else {
      console.log(`📢 No listeners for event: ${event}`);
    }
  }

  // ========== CONNECTION MANAGEMENT ==========
  reconnect() {
    console.log('🔄 Manual reconnect triggered');
    this.isManualDisconnect = false;
    this.forcedClose = false;
    this.disconnect();
    setTimeout(() => this.connect(), 500);
  }

  disconnect() {
    this.isManualDisconnect = true;
    this.isConnecting = false;
    this.connectionLock = false;
    this.messageQueue = [];
    
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      
      try {
        this.socket.close(1000, 'Manual disconnect');
      } catch (e) {}
      this.socket = null;
    }
    
    this.connected = false;
    console.log('👋 Disconnected');
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

  // Get last received data for an event
  getLastData(event) {
    return this.lastData.get(event);
  }
}

// Create singleton instance
const socket = new WebSocketService();

// Make socket available globally for debugging
if (typeof window !== 'undefined') {
  window.debugSocket = socket;
}

export { socket };
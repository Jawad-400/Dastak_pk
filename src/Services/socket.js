// WebSocket service for Go server (using native WebSocket)

class GoWebSocket {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.url = process.env.REACT_APP_WS_URL || 'ws://localhost:4000/ws';
    
    // Get auth data from localStorage if exists
    const storedUser = localStorage.getItem('user');
    const userData = storedUser ? JSON.parse(storedUser) : null;
    
    this.queryParams = {
      type: userData?.role || 'customer',
      user_id: userData?.id || userData?.userId || 'anonymous',
      name: userData?.name || userData?.username || 'Customer',
      token: localStorage.getItem('token') || ''
    };
    
    this.isManualDisconnect = false;
    this.messageQueue = [];
    this.isConnecting = false;
    this.pingInterval = null;
    this.lastPong = Date.now();
  }

  // Build URL with query parameters
  buildUrl() {
    const params = new URLSearchParams(this.queryParams);
    return `${this.url}?${params.toString()}`;
  }

  // Update query parameters
  updateQueryParams(params) {
    this.queryParams = { ...this.queryParams, ...params };
    return this;
  }

  // ========== NEW METHOD: Update authentication after login ==========
  updateAuth(userData) {
    if (!userData) return;
    
    // Extract user info
    const userId = userData.id || userData.userId;
    const userName = userData.name || userData.username;
    const userRole = userData.role;
    const token = userData.token || localStorage.getItem('token');
    
    // Update query params
    this.queryParams = {
      ...this.queryParams,
      type: userRole || 'customer',
      user_id: userId || 'anonymous',
      name: userName || 'Customer',
      token: token || ''
    };
    
    console.log('🔐 Updated WebSocket auth for user:', userName);
    
    // If already connected, reconnect with new auth
    if (this.isConnected()) {
      console.log('🔄 Reconnecting WebSocket with new authentication...');
      this.disconnect();
      setTimeout(() => this.connect(), 500);
    } else if (!this.isConnecting) {
      // If not connected, just connect
      setTimeout(() => this.connect(), 500);
    }
  }

  // ========== NEW METHOD: Clear authentication on logout ==========
  clearAuth() {
    this.queryParams = {
      type: 'customer',
      user_id: 'anonymous',
      name: 'Customer',
      token: ''
    };
    
    console.log('🔓 Cleared WebSocket authentication');
    
    // If connected, reconnect as anonymous
    if (this.isConnected()) {
      this.disconnect();
      setTimeout(() => this.connect(), 500);
    }
  }

  // Validate JSON before sending
  validateJSON(data) {
    try {
      JSON.stringify(data);
      return true;
    } catch (error) {
      console.error('Invalid data for JSON:', error);
      return false;
    }
  }

  // Flush queued messages
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const { event, data } = this.messageQueue.shift();
      this._sendImmediately(event, data);
    }
  }

  // Internal send method (no queueing)
  _sendImmediately(event, data = {}) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'message',
        event: event,
        data: data,
        timestamp: Date.now(),
        user_id: this.queryParams.user_id
      };

      if (!this.validateJSON(message)) {
        console.error('Cannot send: Invalid JSON data');
        return false;
      }

      const jsonString = JSON.stringify(message);
      
      // Final validation
      if (jsonString === undefined || jsonString === 'undefined') {
        console.error('Cannot send: JSON.stringify returned undefined');
        return false;
      }

      this.socket.send(jsonString);
      console.log('📤 Sent to server:', message);
      return true;
    }
    return false;
  }

  // Setup heartbeat/ping
  setupHeartbeat() {
    // Clear existing interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    // Setup new heartbeat
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        // Send ping message
        this._sendImmediately('ping', { heartbeat: true });
        this.lastPong = Date.now();
        
        // Check if we haven't received pong in a while
        if (Date.now() - this.lastPong > 30000) {
          console.warn('No pong received, reconnecting...');
          this.reconnect();
        }
      }
    }, 15000); // Send ping every 15 seconds
  }

  // Connect to Go WebSocket server
  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connecting/connected');
      return;
    }

    this.isManualDisconnect = false;
    this.isConnecting = true;
    const fullUrl = this.buildUrl();
    console.log(`🔗 Connecting to Go WebSocket server: ${fullUrl}`);
    
    try {
      this.socket = new WebSocket(fullUrl);
      
      this.socket.onopen = () => {
        console.log('✅✅✅ CONNECTED to Go WebSocket server!');
        console.log('👤 Connected as:', this.queryParams.name, `(${this.queryParams.user_id})`);
        this.connected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Setup heartbeat
        this.setupHeartbeat();
        
        // Send queued messages
        this.flushMessageQueue();
        
        // Dispatch custom event
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('socket-connected', { 
            detail: { 
              connected: true, 
              url: fullUrl,
              user: {
                id: this.queryParams.user_id,
                name: this.queryParams.name,
                role: this.queryParams.type
              }
            } 
          });
          window.dispatchEvent(event);
        }
      };

      this.socket.onmessage = (event) => {
        const rawData = event.data.toString();
        
        // Handle pong response
        if (rawData === 'pong' || rawData.includes('pong')) {
          this.lastPong = Date.now();
          console.log('💓 Heartbeat received from server');
          return;
        }
        
        // Try to parse as JSON first
        if (rawData.trim().startsWith('{') || rawData.trim().startsWith('[')) {
          try {
            const data = JSON.parse(rawData);
            console.log('📨 JSON Message from server:', data);
            
            // Update last pong if it's a heartbeat response
            if (data.event === 'pong' || data.type === 'pong') {
              this.lastPong = Date.now();
            }
            
            // Dispatch custom event for React components
            if (typeof window !== 'undefined' && data.event) {
              const customEvent = new CustomEvent(`ws-${data.event}`, { detail: data });
              window.dispatchEvent(customEvent);
            }
            
            // Also dispatch for type if no event
            if (typeof window !== 'undefined' && data.type && !data.event) {
              const customEvent = new CustomEvent(`ws-${data.type}`, { detail: data });
              window.dispatchEvent(customEvent);
            }
          } catch (error) {
            // JSON parsing failed, treat as plain text
            console.log('📝 Server message (JSON parse failed):', rawData.substring(0, 200));
            
            // Dispatch plain text message
            if (typeof window !== 'undefined') {
              const customEvent = new CustomEvent('ws-log', { 
                detail: { type: 'log', message: rawData } 
              });
              window.dispatchEvent(customEvent);
            }
          }
        } else {
          // Plain text message (server logs, etc.)
          console.log('📝 Plain text from server:', rawData.substring(0, 200));
          
          // Dispatch plain text message
          if (typeof window !== 'undefined') {
            const customEvent = new CustomEvent('ws-log', { 
              detail: { type: 'log', message: rawData } 
            });
            window.dispatchEvent(customEvent);
          }
        }
      };

      this.socket.onclose = (event) => {
        console.log('❌ WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
        console.log('👤 Was connected as:', this.queryParams.name);
        this.connected = false;
        this.isConnecting = false;
        this.socket = null;
        
        // Clear heartbeat
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }
        
        // Dispatch custom event
        if (typeof window !== 'undefined') {
          const customEvent = new CustomEvent('socket-disconnected', { 
            detail: { 
              connected: false, 
              code: event.code, 
              reason: event.reason,
              user: {
                id: this.queryParams.user_id,
                name: this.queryParams.name
              }
            } 
          });
          window.dispatchEvent(customEvent);
        }
        
        // Only reconnect if not manual disconnect and not normal closure
        if (!this.isManualDisconnect && 
            event.code !== 1000 && // Normal closure
            this.reconnectAttempts < this.maxReconnectAttempts) {
          
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * Math.min(this.reconnectAttempts, 3);
          
          console.log(`🔄 Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
          
          setTimeout(() => {
            this.connect();
          }, delay);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('🚫 Max reconnection attempts reached. Manual reconnect required.');
        }
      };

      this.socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
        
        // Dispatch error event
        if (typeof window !== 'undefined') {
          const customEvent = new CustomEvent('socket-error', { 
            detail: { 
              error: error,
              user: {
                id: this.queryParams.user_id,
                name: this.queryParams.name
              }
            } 
          });
          window.dispatchEvent(customEvent);
        }
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      this.isConnecting = false;
    }
  }

  // Send data to server (with queuing)
  send(event, data = {}) {
    // Validate data before queuing
    const message = {
      type: 'message',
      event: event,
      data: data,
      timestamp: Date.now(),
      user_id: this.queryParams.user_id
    };

    if (!this.validateJSON(message)) {
      console.error('Cannot send: Invalid JSON data');
      return false;
    }

    // If connected, send immediately
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return this._sendImmediately(event, data);
    } 
    // If connecting, queue the message
    else if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.CONNECTING)) {
      console.log('⏳ Queueing message (connecting):', event);
      this.messageQueue.push({ event, data });
      return true;
    }
    // If not connected, try to connect first
    else {
      console.log('⏳ Queueing message (will connect):', event);
      this.messageQueue.push({ event, data });
      
      // Auto-connect if not already trying
      if (!this.isConnecting && !this.socket) {
        setTimeout(() => this.connect(), 0);
      }
      return true;
    }
  }

  // ========== COMPATIBILITY METHODS (for socket.io style) ==========
  
  // Emit event (socket.io style)
  emit(event, data) {
    return this.send(event, data);
  }

  // Add event listener (socket.io style)
  on(event, callback) {
    if (typeof window !== 'undefined') {
      window.addEventListener(`ws-${event}`, (e) => callback(e.detail));
    }
    return this;
  }

  // Remove event listener (socket.io style)
  off(event, callback) {
    if (typeof window !== 'undefined') {
      window.removeEventListener(`ws-${event}`, callback);
    }
    return this;
  }

  // Reconnect manually
  reconnect() {
    console.log('🔄 Manual reconnection requested');
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  // Disconnect
  disconnect() {
    this.isManualDisconnect = true;
    this.isConnecting = false;
    
    // Clear message queue
    this.messageQueue = [];
    
    // Clear heartbeat
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

  // Check connection status
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  // Get connection state
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

  // ========== NEW METHOD: Get current user info ==========
  getCurrentUser() {
    return {
      id: this.queryParams.user_id,
      name: this.queryParams.name,
      role: this.queryParams.type,
      isAuthenticated: this.queryParams.user_id !== 'anonymous'
    };
  }
}

// Create singleton instance
const socket = new GoWebSocket();

// Auto-connect when imported (optional)
if (typeof window !== 'undefined') {
  // Connect after a short delay to let page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      socket.connect();
    }, 1000);
  });
}

export { socket };
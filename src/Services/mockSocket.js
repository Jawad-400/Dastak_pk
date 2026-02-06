// Mock WebSocket server for development
// In production, use a real WebSocket server (Socket.io, etc.)

class MockWebSocketServer {
  constructor() {
    this.clients = [];
    this.requests = [];
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Listen for custom events from frontend
    window.addEventListener('new-service-request', (event) => {
      this.broadcastNewRequest(event.detail);
    });
    
    window.addEventListener('new-bid', (event) => {
      this.broadcastNewBid(event.detail);
    });
    
    window.addEventListener('accept-bid', (event) => {
      this.broadcastBidAccepted(event.detail);
    });
  }
  
  connectClient(clientId) {
    this.clients.push(clientId);
    console.log(\Client connected: \\);
  }
  
  broadcastNewRequest(request) {
    console.log('Broadcasting new request to providers:', request);
    
    // In real app, this would send to all connected providers
    // For now, we'll dispatch an event that ProviderJobsFeed.js can listen to
    const event = new CustomEvent('mock-new-request', { detail: request });
    window.dispatchEvent(event);
    
    // Also store the request
    this.requests.push({
      ...request,
      timestamp: new Date().toISOString()
    });
  }
  
  broadcastNewBid(bid) {
    console.log('Broadcasting new bid:', bid);
    const event = new CustomEvent('mock-new-bid', { detail: bid });
    window.dispatchEvent(event);
  }
  
  broadcastBidAccepted(data) {
    console.log('Broadcasting bid accepted:', data);
    const event = new CustomEvent('mock-bid-accepted', { detail: data });
    window.dispatchEvent(event);
  }
}

// Create global mock server instance
if (!window.mockWebSocketServer) {
  window.mockWebSocketServer = new MockWebSocketServer();
  console.log('✅ Mock WebSocket server initialized');
}

// Export for use in components
export const mockSocket = {
  emit: (event, data) => {
    console.log(\Mock socket emit: \\, data);
    
    // Handle different events
    switch(event) {
      case 'new-service-request':
        window.mockWebSocketServer.broadcastNewRequest(data);
        break;
      case 'new-bid':
        window.mockWebSocketServer.broadcastNewBid(data);
        break;
      case 'accept-bid':
        window.mockWebSocketServer.broadcastBidAccepted(data);
        break;
      default:
        console.log(\Unknown event: \\);
    }
  },
  
  on: (event, callback) => {
    console.log(\Mock socket listening for: \\);
    
    // Map real events to mock events
    const mockEvent = event.replace('new-service-request', 'mock-new-request')
                          .replace('new-bid', 'mock-new-bid')
                          .replace('bid-accepted', 'mock-bid-accepted');
    
    window.addEventListener(mockEvent, (e) => callback(e.detail));
  },
  
  off: (event) => {
    const mockEvent = event.replace('new-service-request', 'mock-new-request')
                          .replace('new-bid', 'mock-new-bid')
                          .replace('bid-accepted', 'mock-bid-accepted');
    
    window.removeEventListener(mockEvent);
  },
  
  connected: true
};

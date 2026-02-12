const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const mongoDB = require('../config/mongodb');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server, path: '/ws' });
    this.clients = new Map();
    this.providersByService = new Map();
    
    this.setupEventHandlers();
    console.log('✅ WebSocket server started on /ws endpoint');
  }

  setupEventHandlers() {
    this.wss.on('connection', async (ws, req) => {
      try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        
        // Get token from query parameter
        const token = url.searchParams.get('token');
        
        if (!token) {
          ws.close(1008, 'No token provided');
          console.log('❌ WebSocket connection rejected: No token');
          return;
        }

        // Verify JWT token
        let decoded;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
          ws.close(1008, 'Invalid or expired token');
          console.log('❌ WebSocket connection rejected: Invalid token');
          return;
        }

        const userId = decoded.userId.toString();
        const userType = decoded.user_type;
        const name = decoded.name || 'User';
        const service = url.searchParams.get('service') || decoded.service || '';
        
        const clientId = `${userType}_${userId}_${Date.now()}`;
        
        // Store client
        this.clients.set(clientId, { 
          ws, 
          type: userType, 
          userId, 
          name,
          service,
          token: decoded,
          connectedAt: new Date() 
        });

        // Add to providers map if provider
        if (userType === 'provider' && service) {
          if (!this.providersByService.has(service)) {
            this.providersByService.set(service, new Set());
          }
          this.providersByService.get(service).add(clientId);
          
          console.log(`👷 Provider connected: ${name} (${service}) - ID: ${userId}`);
          console.log(`📊 Total providers online: ${this.providersByService.size} services, ${this.getProviderCount()} total`);
          
          // Send pending requests to this provider
          await this.sendPendingRequests(clientId, service);
        } else {
          console.log(`👤 Customer connected: ${name} - ID: ${userId}`);
        }

        // Welcome message
        ws.send(JSON.stringify({
          event: 'welcome',
          data: {
            message: `Welcome to Dastak PK, ${name}!`,
            clientId,
            userType,
            userId,
            timestamp: new Date().toISOString()
          }
        }));

        // Handle messages
        ws.on('message', async (message) => {
          await this.handleMessage(clientId, message);
        });

        ws.on('close', () => {
          console.log(`❌ ${userType} disconnected: ${userId} (${name})`);
          this.clients.delete(clientId);
          
          if (userType === 'provider' && service) {
            const serviceProviders = this.providersByService.get(service);
            if (serviceProviders) {
              serviceProviders.delete(clientId);
              if (serviceProviders.size === 0) {
                this.providersByService.delete(service);
              }
            }
          }
        });

        ws.on('error', (error) => {
          console.error(`WebSocket error for ${userId}:`, error);
        });

      } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.close(1011, 'Internal server error');
      }
    });
  }

  // ========== SEND PENDING REQUESTS ==========
  async sendPendingRequests(clientId, serviceType) {
    try {
      const db = await mongoDB.connect();
      const ordersCollection = db.collection('orders');
      
      const query = { status: 'pending' };
      if (serviceType && serviceType !== 'all') {
        query.serviceType = serviceType;
      }
      
      const pendingRequests = await ordersCollection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();
  
      this.sendToClient(clientId, {
        event: 'pending_requests',
        data: {
          requests: pendingRequests,
          count: pendingRequests.length
        }
      });
      
      console.log(`📨 Sent ${pendingRequests.length} pending requests to provider`);
    } catch (error) {
      console.error('Error sending pending requests:', error);
    }
  }

  // ========== HANDLE MESSAGES ==========
  async handleMessage(clientId, message) {
    try {
      const client = this.clients.get(clientId);
      if (!client) return;
  
      const data = JSON.parse(message);
      console.log(`📨 WebSocket: ${data.event} from ${client.userId} (${client.type})`);
  
      switch (data.event) {
        case 'create_request':
          if (client.type !== 'customer') {
            this.sendToClient(clientId, {
              event: 'error',
              data: { message: 'Only customers can create requests' }
            });
            return;
          }
          await this.handleCreateRequest(clientId, data.data);
          break;
          
        case 'accept_request':
          if (client.type !== 'provider') {
            this.sendToClient(clientId, {
              event: 'error',
              data: { message: 'Only providers can accept requests' }
            });
            return;
          }
          await this.handleAcceptRequest(clientId, data.data);
          break;
          
        case 'get_pending_requests':
          if (client.type !== 'provider') {
            this.sendToClient(clientId, {
              event: 'error',
              data: { message: 'Only providers can get pending requests' }
            });
            return;
          }
          await this.sendPendingRequests(clientId, client.service);
          break;
          
        case 'ping':
          this.sendToClient(clientId, {
            event: 'pong',
            data: { timestamp: new Date().toISOString() }
          });
          break;
          
        default:
          console.log(`Unknown event: ${data.event}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  // ========== HANDLE CREATE REQUEST ==========
  async handleCreateRequest(clientId, requestData) {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      const request = {
        id: requestId,
        title: requestData.title,
        description: requestData.description,
        location: requestData.location,
        budget: requestData.budget,
        customerId: client.userId,
        customerName: client.name,
        serviceType: requestData.service_type,
        schedule: requestData.schedule || 'ASAP',
        contact: requestData.contact_number,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'websocket'
      };

      // Save to MongoDB
      const db = await mongoDB.connect();
      const ordersCollection = db.collection('orders');
      await ordersCollection.insertOne(request);
      
      console.log('✅ Request saved to MongoDB:', request.id);
      console.log('🔧 Service Type:', request.serviceType);

      // Send confirmation to customer
      this.sendToClient(clientId, {
        event: 'request_created',
        data: {
          success: true,
          requestId: request.id,
          message: 'Your service request has been created successfully',
          request: request
        }
      });

      // ✅ FIXED: Broadcast to ALL providers with matching service
      const providerCount = await this.broadcastToProviders(request.serviceType, {
        event: 'new_request',
        data: request
      });

      console.log(`📢 Broadcasted new ${request.serviceType} request to ${providerCount} providers`);

      if (providerCount === 0) {
        console.log(`⚠️ No ${request.serviceType} providers online right now`);
      }

    } catch (error) {
      console.error('❌ Error creating request:', error);
      this.sendToClient(clientId, {
        event: 'request_error',
        data: {
          success: false,
          message: 'Failed to create request. Please try again.'
        }
      });
    }
  }

  // ========== HANDLE ACCEPT REQUEST ==========
  async handleAcceptRequest(clientId, acceptData) {
    const provider = this.clients.get(clientId);
    if (!provider) return;

    try {
      const db = await mongoDB.connect();
      const ordersCollection = db.collection('orders');

      const request = await ordersCollection.findOne({ id: acceptData.requestId });
      
      if (!request) {
        this.sendToClient(clientId, {
          event: 'accept_error',
          data: { success: false, message: 'Request not found' }
        });
        return;
      }

      if (request.status !== 'pending') {
        this.sendToClient(clientId, {
          event: 'accept_error',
          data: { success: false, message: `Request already ${request.status}` }
        });
        return;
      }

      if (request.customerId === provider.userId) {
        this.sendToClient(clientId, {
          event: 'accept_error',
          data: { success: false, message: 'You cannot accept your own request' }
        });
        return;
      }

      await ordersCollection.updateOne(
        { id: acceptData.requestId },
        {
          $set: {
            status: 'accepted',
            providerId: provider.userId,
            providerName: provider.name,
            acceptedAt: new Date(),
            updatedAt: new Date()
          }
        }
      );

      const updatedRequest = await ordersCollection.findOne({ id: acceptData.requestId });

      // Notify customer
      this.sendToUser(request.customerId, {
        event: 'request_accepted',
        data: {
          success: true,
          requestId: request.id,
          providerName: provider.name,
          providerId: provider.userId,
          message: `${provider.name} has accepted your ${request.serviceType} request`
        }
      });

      // Notify other providers that request is taken
      this.broadcastToType('provider', {
        event: 'request_taken',
        data: {
          requestId: request.id,
          providerName: provider.name,
          serviceType: request.serviceType
        }
      });

      this.sendToClient(clientId, {
        event: 'request_accepted_confirmation',
        data: {
          success: true,
          request: updatedRequest,
          message: 'You have successfully accepted the request'
        }
      });

      console.log(`✅ Request ${request.id} accepted by provider ${provider.name}`);

    } catch (error) {
      console.error('❌ Error accepting request:', error);
      this.sendToClient(clientId, {
        event: 'accept_error',
        data: { success: false, message: 'Failed to accept request' }
      });
    }
  }

  // ========== ✅ FIXED: BROADCAST TO PROVIDERS ==========
  async broadcastToProviders(serviceType, message) {
    let count = 0;
    
    // Method 1: Broadcast via providersByService map
    const providerIds = this.providersByService.get(serviceType) || new Set();
    for (const providerId of providerIds) {
      const provider = this.clients.get(providerId);
      if (provider && provider.ws.readyState === WebSocket.OPEN) {
        try {
          provider.ws.send(JSON.stringify(message));
          count++;
          console.log(`📤 Sent to ${provider.name} (${serviceType}) via map`);
        } catch (err) {
          console.error(`Failed to send to ${providerId}:`, err.message);
        }
      }
    }
    
    // Method 2: Also broadcast to all providers directly (backup method)
    for (const [clientId, client] of this.clients) {
      // Skip if already sent via map
      if (providerIds.has(clientId)) continue;
      
      // Check if provider and matches service
      if (client.type === 'provider' && client.ws.readyState === WebSocket.OPEN) {
        const clientService = client.service || 'all';
        
        if (clientService === 'all' || clientService === serviceType) {
          try {
            client.ws.send(JSON.stringify(message));
            count++;
            console.log(`📤 Sent to ${client.name} (${client.service}) via direct`);
          } catch (err) {
            console.error(`Failed to send to ${clientId}:`, err.message);
          }
        }
      }
    }
    
    console.log(`📢 Broadcasted ${message.event} to ${count} providers for service: ${serviceType}`);
    return count;
  }

  // ========== HELPER METHODS ==========
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  broadcastToType(userType, message) {
    let count = 0;
    for (const [clientId, client] of this.clients) {
      if (client.type === userType && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
        count++;
      }
    }
    return count;
  }

  sendToUser(userId, message) {
    for (const [clientId, client] of this.clients) {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
        return true;
      }
    }
    return false;
  }

  getProviderCount() {
    let count = 0;
    for (const [clientId, client] of this.clients) {
      if (client.type === 'provider') count++;
    }
    return count;
  }

  getStats() {
    const providers = Array.from(this.clients.values()).filter(c => c.type === 'provider');
    const customers = Array.from(this.clients.values()).filter(c => c.type === 'customer');
    
    const services = {};
    for (const [service, providerSet] of this.providersByService) {
      services[service] = providerSet.size;
    }
    
    return {
      totalClients: this.clients.size,
      providers: providers.length,
      customers: customers.length,
      providersByService: services,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = WebSocketServer;
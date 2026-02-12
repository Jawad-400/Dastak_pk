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
        
        const token = url.searchParams.get('token');
        
        if (!token) {
          ws.close(1008, 'No token provided');
          console.log('❌ WebSocket connection rejected: No token');
          return;
        }

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
        
        this.clients.set(clientId, { 
          ws, 
          type: userType, 
          userId, 
          name,
          service,
          token: decoded,
          connectedAt: new Date() 
        });

        if (userType === 'provider' && service) {
          if (!this.providersByService.has(service)) {
            this.providersByService.set(service, new Set());
          }
          this.providersByService.get(service).add(clientId);
          
          console.log(`👷 Provider connected: ${name} (${service}) - ID: ${userId}`);
          console.log(`📊 Total providers online: ${this.getProviderCount()}`);
          
          await this.sendPendingRequests(clientId, service);
        } else {
          console.log(`👤 Customer connected: ${name} - ID: ${userId}`);
        }

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

      const db = await mongoDB.connect();
      const ordersCollection = db.collection('orders');
      await ordersCollection.insertOne(request);
      
      console.log('✅ Request saved to MongoDB:', request.id);
      console.log('🔧 Service Type:', request.serviceType);

      this.sendToClient(clientId, {
        event: 'request_created',
        data: {
          success: true,
          requestId: request.id,
          message: 'Your service request has been created successfully',
          request: request
        }
      });

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

  // ========== ✅ COMPLETE FIXED handleAcceptRequest ==========
  async handleAcceptRequest(clientId, acceptData) {
    const provider = this.clients.get(clientId);
    if (!provider) {
      console.log('❌ Provider not found');
      return;
    }

    console.log(`🔧 Provider ${provider.name} attempting to accept request: ${acceptData.request_id}`);

    try {
      const db = await mongoDB.connect();
      const ordersCollection = db.collection('orders');

      // Find the request
      const request = await ordersCollection.findOne({ id: acceptData.request_id });
      
      if (!request) {
        console.log(`❌ Request not found: ${acceptData.request_id}`);
        this.sendToClient(clientId, {
          event: 'accept_error',
          data: { 
            success: false, 
            message: 'Request not found',
            request_id: acceptData.request_id
          }
        });
        return;
      }

      console.log(`📦 Request found: ${request.id}, Status: ${request.status}`);

      // Check if request is still pending
      if (request.status !== 'pending') {
        console.log(`❌ Request already ${request.status}`);
        this.sendToClient(clientId, {
          event: 'accept_error',
          data: { 
            success: false, 
            message: `Request already ${request.status}`,
            request_id: acceptData.request_id
          }
        });
        return;
      }

      // Check if provider is accepting their own request
      if (request.customerId === provider.userId) {
        console.log(`❌ Provider cannot accept their own request`);
        this.sendToClient(clientId, {
          event: 'accept_error',
          data: { 
            success: false, 
            message: 'You cannot accept your own request',
            request_id: acceptData.request_id
          }
        });
        return;
      }

      // Update request status in MongoDB
      const updateResult = await ordersCollection.updateOne(
        { id: acceptData.request_id },
        {
          $set: {
            status: 'accepted',
            providerId: provider.userId,
            providerName: provider.name,
            providerService: provider.service,
            acceptedAt: new Date(),
            updatedAt: new Date()
          }
        }
      );

      if (updateResult.modifiedCount === 0) {
        console.log(`❌ Failed to update request in MongoDB`);
        this.sendToClient(clientId, {
          event: 'accept_error',
          data: { 
            success: false, 
            message: 'Failed to update request',
            request_id: acceptData.request_id
          }
        });
        return;
      }

      console.log(`✅ Request ${request.id} accepted by provider ${provider.name}`);

      const updatedRequest = await ordersCollection.findOne({ id: acceptData.request_id });

      // 1. Notify the customer
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

      // 2. Broadcast to ALL providers that this request is TAKEN
      const broadcastCount = this.broadcastToType('provider', {
        event: 'request_taken',
        data: {
          requestId: request.id,
          providerName: provider.name,
          serviceType: request.serviceType,
          message: `This request has been accepted by ${provider.name}`
        }
      });

      console.log(`📢 Broadcasted 'request_taken' to ${broadcastCount} providers`);

      // 3. Confirm to the accepting provider
      this.sendToClient(clientId, {
        event: 'request_accepted_confirmation',
        data: {
          success: true,
          request: updatedRequest,
          message: 'You have successfully accepted the request'
        }
      });

    } catch (error) {
      console.error('❌ Error accepting request:', error);
      this.sendToClient(clientId, {
        event: 'accept_error',
        data: { 
          success: false, 
          message: 'Failed to accept request: ' + error.message,
          request_id: acceptData.request_id
        }
      });
    }
  }

  // Helper methods
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

  async broadcastToProviders(serviceType, message) {
    let count = 0;
    
    for (const [clientId, client] of this.clients) {
      if (client.type === 'provider' && client.ws.readyState === WebSocket.OPEN) {
        if (client.service === serviceType || client.service === 'all') {
          client.ws.send(JSON.stringify(message));
          count++;
        }
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
    
    return {
      totalClients: this.clients.size,
      providers: providers.length,
      customers: customers.length,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = WebSocketServer;
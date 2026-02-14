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
      let clientId = null;
      
      try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        
        const token = url.searchParams.get('token');
        const service = url.searchParams.get('service') || '';
        const userType = url.searchParams.get('type') || '';
        const userId = url.searchParams.get('user_id') || '';
        const name = url.searchParams.get('name') || 'User';
        
        console.log(`🔌 New WebSocket connection attempt:`, { userType, userId, name, service });
        
        if (!token) {
          console.log('❌ No token provided');
          ws.close(1008, 'No token provided');
          return;
        }

        let decoded;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
          console.log('❌ Invalid token:', error.message);
          ws.close(1008, 'Invalid or expired token');
          return;
        }

        // Create client ID
        clientId = `${userType}_${userId}_${Date.now()}`;
        
        // Store client data
        const clientData = { 
          ws, 
          type: userType, 
          userId, 
          name,
          service,
          token: decoded,
          connectedAt: new Date() 
        };
        
        this.clients.set(clientId, clientData);

        // Broadcast user online to all clients
        this.broadcastToAll({
          event: 'user_online',
          data: {
            userId,
            userType,
            name
          }
        });

        // Send welcome message immediately
        ws.send(JSON.stringify({
          event: 'welcome',
          data: {
            message: `Welcome to Dastak PK, ${name}!`,
            clientId,
            userType,
            userId,
            service,
            timestamp: new Date().toISOString()
          }
        }));

        // Handle provider connection
        if (userType === 'provider') {
          if (service) {
            if (!this.providersByService.has(service)) {
              this.providersByService.set(service, new Set());
            }
            this.providersByService.get(service).add(clientId);
          }
          
          console.log(`👷 Provider connected: ${name} (${service}) - ID: ${userId}`);
          console.log(`📊 Total providers online: ${this.getProviderCount()}`);
          console.log(`📊 Providers by service:`, Array.from(this.providersByService.keys()).join(', '));
          
          // Send pending requests AFTER welcome message
          setTimeout(async () => {
            await this.sendPendingRequests(clientId, service);
          }, 500);
        } else {
          console.log(`👤 Customer connected: ${name} - ID: ${userId}`);
        }

        // Handle incoming messages
        ws.on('message', async (message) => {
          try {
            await this.handleMessage(clientId, message);
          } catch (error) {
            console.error('Error handling message:', error);
          }
        });

        // Handle close
        ws.on('close', (code, reason) => {
          console.log(`❌ ${userType} disconnected: ${userId} (${name}) - Code: ${code}, Reason: ${reason}`);
          
          // Broadcast user offline
          this.broadcastToAll({
            event: 'user_offline',
            data: {
              userId,
              userType,
              name
            }
          });
          
          // Remove from clients
          this.clients.delete(clientId);
          
          // Remove from providersByService
          if (userType === 'provider' && service) {
            const serviceProviders = this.providersByService.get(service);
            if (serviceProviders) {
              serviceProviders.delete(clientId);
              if (serviceProviders.size === 0) {
                this.providersByService.delete(service);
              }
            }
          }
          
          console.log(`📊 Providers remaining: ${this.getProviderCount()}`);
        });

        // Handle error
        ws.on('error', (error) => {
          console.error(`WebSocket error for ${userId}:`, error);
        });

      } catch (error) {
        console.error('WebSocket connection error:', error);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close(1011, 'Internal server error');
        }
      }
    });
  }

  async sendPendingRequests(clientId, serviceType) {
    try {
      const client = this.clients.get(clientId);
      if (!client) {
        console.log(`❌ Client ${clientId} not found for sending pending requests`);
        return;
      }

      if (client.ws.readyState !== WebSocket.OPEN) {
        console.log(`❌ Client ${clientId} WebSocket not open, state: ${client.ws.readyState}`);
        return;
      }

      const db = await mongoDB.connect();
      const ordersCollection = db.collection('orders');
      
      const query = { status: 'pending' };
      if (serviceType && serviceType !== 'all' && serviceType !== 'undefined') {
        query.$or = [
          { serviceType: serviceType },
          { service_type: serviceType }
        ];
      }
      
      console.log(`🔍 Finding pending ${serviceType} requests for client ${clientId}...`);
      
      const pendingRequests = await ordersCollection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();
  
      console.log(`📨 Found ${pendingRequests.length} pending ${serviceType} requests`);
      
      if (pendingRequests.length > 0) {
        console.log('📋 Sample request:', {
          id: pendingRequests[0].id,
          serviceType: pendingRequests[0].serviceType || pendingRequests[0].service_type,
          title: pendingRequests[0].title
        });
      }
  
      // Send the requests
      client.ws.send(JSON.stringify({
        event: 'pending_requests',
        data: pendingRequests
      }));
      
      console.log(`📨 Sent ${pendingRequests.length} pending requests to provider ${client.name}`);
      
    } catch (error) {
      console.error('Error sending pending requests:', error);
    }
  }

  async handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) {
      console.log(`❌ Client ${clientId} not found`);
      return;
    }

    try {
      const data = JSON.parse(message);
      console.log(`📨 WebSocket: ${data.event} from ${client.userId} (${client.type})`);

      switch (data.event) {
        case 'accept_request':
          if (client.type !== 'provider') {
            client.ws.send(JSON.stringify({
              event: 'error',
              data: { message: 'Only providers can accept requests' }
            }));
            return;
          }
          await this.handleAcceptRequest(clientId, data.data);
          break;
          
        case 'get_pending_requests':
          if (client.type !== 'provider') {
            client.ws.send(JSON.stringify({
              event: 'error',
              data: { message: 'Only providers can get pending requests' }
            }));
            return;
          }
          console.log(`📨 Provider ${client.name} requesting pending requests for service: ${client.service}`);
          await this.sendPendingRequests(clientId, client.service);
          break;
          
        case 'provider_online':
          console.log(`👷 Provider ${client.name} is now online`);
          this.broadcastToType('customer', {
            event: 'provider_status',
            data: {
              providerId: client.userId,
              providerName: client.name,
              service: client.service,
              status: 'online'
            }
          });
          break;

        // ============ CHAT EVENTS ============
        case 'chat_message':
          await this.handleChatMessage(clientId, data.data);
          break;

        case 'typing_indicator':
          await this.handleTypingIndicator(clientId, data.data);
          break;

        case 'messages_read':
          await this.handleMessagesRead(clientId, data.data);
          break;
          
        case 'ping':
          client.ws.send(JSON.stringify({
            event: 'pong',
            data: { timestamp: new Date().toISOString() }
          }));
          break;
          
        default:
          console.log(`Unknown event: ${data.event}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  // ============ CHAT HANDLERS ============

  async handleChatMessage(clientId, chatData) {
    const sender = this.clients.get(clientId);
    if (!sender) return;

    const { chatId, message, receiverId, jobId } = chatData;

    console.log(`💬 Chat message from ${sender.name} to user ${receiverId}:`, message.text);

    // Add metadata to message
    const enhancedMessage = {
      ...message,
      chatId,
      jobId
    };

    // Send to specific receiver
    const sent = this.sendToUser(receiverId, {
      event: 'chat_message',
      data: {
        chatId,
        message: enhancedMessage,
        senderId: sender.userId,
        senderName: sender.name,
        receiverId
      }
    });

    // Also send back to sender for confirmation (optional)
    if (sent) {
      sender.ws.send(JSON.stringify({
        event: 'chat_message_delivered',
        data: {
          chatId,
          messageId: message.id,
          timestamp: new Date().toISOString()
        }
      }));
    }

    // Save message to database (optional - for history)
    try {
      const db = await mongoDB.connect();
      const messagesCollection = db.collection('chat_messages');
      
      await messagesCollection.insertOne({
        chatId,
        messageId: message.id,
        text: message.text,
        senderId: sender.userId,
        senderName: sender.name,
        receiverId,
        jobId,
        timestamp: new Date(message.timestamp),
        delivered: true,
        read: false
      });
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  }

  async handleTypingIndicator(clientId, typingData) {
    const sender = this.clients.get(clientId);
    if (!sender) return;

    const { chatId, isTyping, receiverId } = typingData;

    console.log(`✏️ Typing indicator from ${sender.name}: ${isTyping ? 'typing' : 'stopped'}`);

    // Send typing indicator to receiver
    this.sendToUser(receiverId, {
      event: 'user_typing',
      data: {
        chatId,
        userId: sender.userId,
        isTyping,
        timestamp: new Date().toISOString()
      }
    });
  }

  async handleMessagesRead(clientId, readData) {
    const reader = this.clients.get(clientId);
    if (!reader) return;

    const { chatId, userId } = readData;

    console.log(`👁️ Messages read in chat ${chatId} by ${reader.name}`);

    // Notify the other participant that messages were read
    // Find the other participant in this chat
    for (const [otherClientId, otherClient] of this.clients) {
      if (otherClient.userId !== reader.userId) {
        // Assume this is the chat participant
        otherClient.ws.send(JSON.stringify({
          event: 'messages_read',
          data: {
            chatId,
            userId: reader.userId,
            timestamp: new Date().toISOString()
          }
        }));
        break;
      }
    }

    // Update database (optional)
    try {
      const db = await mongoDB.connect();
      const messagesCollection = db.collection('chat_messages');
      
      await messagesCollection.updateMany(
        { 
          chatId, 
          receiverId: reader.userId,
          read: false 
        },
        { 
          $set: { 
            read: true,
            readAt: new Date() 
          } 
        }
      );
    } catch (error) {
      console.error('Error updating message read status:', error);
    }
  }

  // ============ REQUEST HANDLERS ============

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

      const request = await ordersCollection.findOne({ id: acceptData.request_id });
      
      if (!request) {
        console.log(`❌ Request not found: ${acceptData.request_id}`);
        provider.ws.send(JSON.stringify({
          event: 'accept_error',
          data: { 
            success: false, 
            message: 'Request not found',
            request_id: acceptData.request_id
          }
        }));
        return;
      }

      if (request.status !== 'pending') {
        console.log(`❌ Request already ${request.status}`);
        provider.ws.send(JSON.stringify({
          event: 'accept_error',
          data: { 
            success: false, 
            message: `Request already ${request.status}`,
            request_id: acceptData.request_id
          }
        }));
        return;
      }

      // Update request
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
        console.log(`❌ Failed to update request`);
        provider.ws.send(JSON.stringify({
          event: 'accept_error',
          data: { 
            success: false, 
            message: 'Failed to update request',
            request_id: acceptData.request_id
          }
        }));
        return;
      }

      console.log(`✅ Request ${request.id} accepted by provider ${provider.name}`);

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

      // Broadcast to all providers that this request is taken
      this.broadcastToType('provider', {
        event: 'request_taken',
        data: {
          request_id: request.id,
          providerName: provider.name,
          serviceType: request.serviceType,
          message: `This request has been accepted by ${provider.name}`
        }
      });

      // Confirm to provider
      provider.ws.send(JSON.stringify({
        event: 'request_accepted_confirmation',
        data: {
          success: true,
          request: request,
          message: 'You have successfully accepted the request'
        }
      }));

    } catch (error) {
      console.error('❌ Error accepting request:', error);
      provider.ws.send(JSON.stringify({
        event: 'accept_error',
        data: { 
          success: false, 
          message: 'Failed to accept request: ' + error.message,
          request_id: acceptData.request_id
        }
      }));
    }
  }

  // ============ HELPER METHODS ============

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
        try {
          client.ws.send(JSON.stringify(message));
          count++;
        } catch (error) {
          console.error(`Error sending to ${clientId}:`, error);
        }
      }
    }
    return count;
  }

  broadcastToAll(message) {
    let count = 0;
    for (const [clientId, client] of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify(message));
          count++;
        } catch (error) {
          console.error(`Error sending to ${clientId}:`, error);
        }
      }
    }
    return count;
  }

  async broadcastToProviders(serviceType, message) {
    let count = 0;
    
    console.log(`📢 Broadcasting to providers for service: ${serviceType}`);
    
    for (const [clientId, client] of this.clients) {
      if (client.type === 'provider' && client.ws.readyState === WebSocket.OPEN) {
        // Check if provider service matches
        if (!serviceType || client.service === serviceType || client.service === 'all' || client.service === '') {
          try {
            client.ws.send(JSON.stringify(message));
            count++;
            console.log(`✅ Sent to provider ${client.name} (${client.service})`);
          } catch (error) {
            console.error(`Error sending to provider ${client.name}:`, error);
          }
        } else {
          console.log(`❌ Skipping provider ${client.name} (${client.service}) - not matching ${serviceType}`);
        }
      }
    }
    
    console.log(`📢 Broadcasted to ${count} providers`);
    return count;
  }

  sendToUser(userId, message) {
    for (const [clientId, client] of this.clients) {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify(message));
          return true;
        } catch (error) {
          console.error(`Error sending to user ${userId}:`, error);
        }
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
    
    const serviceBreakdown = {};
    providers.forEach(p => {
      serviceBreakdown[p.service] = (serviceBreakdown[p.service] || 0) + 1;
    });
    
    return {
      totalClients: this.clients.size,
      providers: providers.length,
      customers: customers.length,
      serviceBreakdown,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = WebSocketServer;
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

        // Broadcast user online
        this.broadcastToAll({
          event: 'user_online',
          data: { userId, userType, name }
        });

        // Send welcome message
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

        // Send pending messages when user comes online
        await this.sendPendingMessages(userId);

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
          
          // Send pending requests
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
          console.log(`❌ ${userType} disconnected: ${userId} (${name})`);
          this.broadcastToAll({
            event: 'user_offline',
            data: { userId, userType, name }
          });
          
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
      }
    });
  }

  // Send pending messages to user when they come online
  async sendPendingMessages(userId) {
    try {
      const db = await mongoDB.connect();
      const messagesCollection = db.collection('messages');
      
      // Find all undelivered messages for this user
      const pendingMessages = await messagesCollection.find({
        receiverId: userId,
        delivered: false
      }).toArray();
      
      if (pendingMessages.length === 0) return;
      
      console.log(`📨 Found ${pendingMessages.length} pending messages for user ${userId}`);
      
      // Group messages by chatId
      const messagesByChat = {};
      pendingMessages.forEach(msg => {
        if (!messagesByChat[msg.chatId]) {
          messagesByChat[msg.chatId] = [];
        }
        messagesByChat[msg.chatId].push(msg);
      });
      
      // Send each message to the user
      for (const [chatId, msgs] of Object.entries(messagesByChat)) {
        for (const msg of msgs) {
          const delivered = this.sendToUser(userId, {
            event: 'chat_message',
            data: {
              chatId,
              message: {
                id: msg.messageId,
                text: msg.text,
                senderId: msg.senderId,
                senderName: msg.senderName,
                timestamp: msg.timestamp
              },
              senderId: msg.senderId,
              senderName: msg.senderName,
              receiverId: userId
            }
          });
          
          // If delivered, mark as delivered in database
          if (delivered) {
            await messagesCollection.updateOne(
              { messageId: msg.messageId },
              { $set: { delivered: true, deliveredAt: new Date() } }
            );
            console.log(`✅ Delivered pending message ${msg.messageId} to ${userId}`);
          }
        }
      }
      
    } catch (error) {
      console.error('Error sending pending messages:', error);
    }
  }

  async handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

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

  async handleChatMessage(clientId, chatData) {
    const sender = this.clients.get(clientId);
    if (!sender) return;
  
    const { chatId, message, receiverId, jobId } = chatData;
  
    console.log(`💬 Chat message from ${sender.name} to user ${receiverId}:`, message.text);
  
    // Save to MongoDB
    try {
      const db = await mongoDB.connect();
      const messagesCollection = db.collection('messages');
      
      await messagesCollection.insertOne({
        chatId: chatId,
        messageId: message.id,
        text: message.text,
        senderId: sender.userId,
        senderName: sender.name,
        receiverId: receiverId,
        jobId: jobId,
        timestamp: new Date(message.timestamp),
        read: false,
        delivered: false
      });
      
      console.log(`✅ Message saved to MongoDB: ${message.id}`);
    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  
    // Try to send to receiver if online
    const delivered = this.sendToUser(receiverId, {
      event: 'chat_message',
      data: {
        chatId,
        message,
        senderId: sender.userId,
        senderName: sender.name,
        receiverId
      }
    });
    
    // If delivered, mark as delivered in database
    if (delivered) {
      try {
        const db = await mongoDB.connect();
        const messagesCollection = db.collection('messages');
        await messagesCollection.updateOne(
          { messageId: message.id },
          { $set: { delivered: true, deliveredAt: new Date() } }
        );
        console.log(`✅ Message ${message.id} delivered immediately`);
      } catch (error) {
        console.error('Error updating message delivery status:', error);
      }
    } else {
      console.log(`⏸️ User ${receiverId} is offline, message saved for later delivery`);
    }
  }

  async handleTypingIndicator(clientId, typingData) {
    const sender = this.clients.get(clientId);
    if (!sender) return;

    const { chatId, isTyping, receiverId } = typingData;

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

    const { chatId } = readData;

    // Notify the other participant
    for (const [otherClientId, otherClient] of this.clients) {
      if (otherClient.userId !== reader.userId) {
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

    // Update database
    try {
      const db = await mongoDB.connect();
      const messagesCollection = db.collection('messages');
      
      await messagesCollection.updateMany(
        { chatId, receiverId: reader.userId, read: false },
        { $set: { read: true, readAt: new Date() } }
      );
    } catch (error) {
      console.error('Error updating message read status:', error);
    }
  }

  async handleAcceptRequest(clientId, acceptData) {
    const provider = this.clients.get(clientId);
    if (!provider) return;

    try {
      const db = await mongoDB.connect();
      const ordersCollection = db.collection('orders');

      const request = await ordersCollection.findOne({ id: acceptData.request_id });
      
      if (!request || request.status !== 'pending') {
        provider.ws.send(JSON.stringify({
          event: 'accept_error',
          data: { 
            success: false, 
            message: !request ? 'Request not found' : `Request already ${request.status}`,
            request_id: acceptData.request_id
          }
        }));
        return;
      }

      await ordersCollection.updateOne(
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
    }
  }

  async sendPendingRequests(clientId, serviceType) {
    try {
      const client = this.clients.get(clientId);
      if (!client) return;

      const db = await mongoDB.connect();
      const ordersCollection = db.collection('orders');
      
      const query = { status: 'pending' };
      if (serviceType && serviceType !== 'all' && serviceType !== 'undefined') {
        query.$or = [
          { serviceType: serviceType },
          { service_type: serviceType }
        ];
      }
      
      const pendingRequests = await ordersCollection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();
  
      client.ws.send(JSON.stringify({
        event: 'pending_requests',
        data: pendingRequests
      }));
      
      console.log(`📨 Sent ${pendingRequests.length} pending requests to provider ${client.name}`);
      
    } catch (error) {
      console.error('Error sending pending requests:', error);
    }
  }

  // Helper Methods
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

  getProviderCount() {
    let count = 0;
    for (const [clientId, client] of this.clients) {
      if (client.type === 'provider') count++;
    }
    return count;
  }

  getStats() {
    const stats = {
      totalClients: this.clients.size,
      providersByService: {},
      onlineUsers: {
        customers: 0,
        providers: 0,
        total: 0
      }
    };
    
    // Count providers by service
    for (const [service, providers] of this.providersByService.entries()) {
      stats.providersByService[service] = providers.size;
    }
    
    // Count users by type
    for (const [_, client] of this.clients) {
      if (client.type === 'customer') stats.onlineUsers.customers++;
      if (client.type === 'provider') stats.onlineUsers.providers++;
    }
    
    stats.onlineUsers.total = stats.onlineUsers.customers + stats.onlineUsers.providers;
    
    return stats;
  }
}

module.exports = WebSocketServer;
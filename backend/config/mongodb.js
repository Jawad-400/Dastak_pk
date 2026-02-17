const { MongoClient } = require('mongodb');
require('dotenv').config();

class MongoDB {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
    this.connectionPromise = null;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
  }

  async connect() {
    // If already connected, return the existing connection
    if (this.isConnected && this.db) {
      console.log('📊 Reusing existing MongoDB connection');
      return this.db;
    }

    // If connection is in progress, wait for it
    if (this.connectionPromise) {
      console.log('⏳ MongoDB connection in progress, waiting...');
      return this.connectionPromise;
    }

    // Create new connection
    this.connectionPromise = this._createConnection();
    return this.connectionPromise;
  }

  async _createConnection() {
    try {
      // Get connection string from environment
      const uri = process.env.MONGODB_URI;
      
      if (!uri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }

      // Extract database name from URI or use default
      let dbName = process.env.MONGODB_DB;
      if (!dbName) {
        // Try to extract from URI
        const match = uri.match(/\/([^?]+)/);
        dbName = match ? match[1] : 'orders_db';
      }
      
      console.log('🔄 Creating new MongoDB connection...');
      console.log(`📊 Target database: ${dbName}`);

      this.client = new MongoClient(uri, {
        maxPoolSize: 50,        // Increased from 10
        minPoolSize: 5,         // Increased from 2
        maxIdleTimeMS: 60000,   // Increased from 30000 (60 seconds)
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        heartbeatFrequencyMS: 30000, // Increased from 10000
        retryWrites: true,
        retryReads: true,
        w: 'majority',
        readPreference: 'primaryPreferred'
      });

      // Connect with retry logic
      await this._connectWithRetry();
      
      this.db = this.client.db(dbName);
      this.isConnected = true;
      this.connectionAttempts = 0;
      
      console.log('✅ MongoDB connected successfully (connection pooled)');
      
      // Create indexes (don't wait for them)
      this.createIndexes().catch(err => 
        console.error('⚠️ Index creation error:', err.message)
      );

      // Setup connection event handlers


      this.client.on('error', (err) => {
        console.error('❌ MongoDB client error:', err.message);
        this.isConnected = false;
      });

      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      this.connectionPromise = null;
      
      // In production, we might want to retry indefinitely
      if (process.env.NODE_ENV === 'production') {
        console.log('🔄 Will retry connection in 5 seconds...');
        setTimeout(() => {
          this.connectionPromise = null;
          this.connect().catch(e => console.error('Retry failed:', e.message));
        }, 5000);
      }
      
      throw error;
    }
  }

  async _connectWithRetry() {
    while (this.connectionAttempts < this.maxRetries) {
      try {
        await this.client.connect();
        return; // Success
      } catch (error) {
        this.connectionAttempts++;
        console.log(`⚠️ Connection attempt ${this.connectionAttempts} failed:`, error.message);
        
        if (this.connectionAttempts >= this.maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 10000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async createIndexes() {
    try {
      const collections = await this.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);

      // Orders collection indexes
      if (collectionNames.includes('orders')) {
        console.log('📊 Checking orders collection indexes...');
        await this.db.collection('orders').createIndexes([
          { key: { id: 1 }, unique: true, name: 'id_unique' },
          { key: { customerId: 1 }, name: 'customerId_index' },
          { key: { providerId: 1 }, name: 'providerId_index' },
          { key: { status: 1 }, name: 'status_index' },
          { key: { createdAt: -1 }, name: 'createdAt_desc' },
          { key: { serviceType: 1 }, name: 'serviceType_index' }
        ]);
      } else {
        console.log('📊 Orders collection does not exist yet, skipping indexes');
      }

      // Users cache indexes
      if (collectionNames.includes('users_cache')) {
        console.log('📊 Checking users_cache collection indexes...');
        await this.db.collection('users_cache').createIndexes([
          { key: { userId: 1 }, unique: true, name: 'userId_unique' },
          { key: { email: 1 }, unique: true, name: 'email_unique' },
          { key: { phone: 1 }, name: 'phone_index' }
        ]);
      }

      // Messages collection indexes (if it exists)
      if (collectionNames.includes('messages')) {
        console.log('📊 Checking messages collection indexes...');
        await this.db.collection('messages').createIndexes([
          { key: { messageId: 1 }, unique: true, name: 'messageId_unique' },
          { key: { chatId: 1 }, name: 'chatId_index' },
          { key: { senderId: 1 }, name: 'senderId_index' },
          { key: { receiverId: 1, delivered: 1 }, name: 'receiver_delivered' },
          { key: { timestamp: -1 }, name: 'timestamp_desc' }
        ]);
      }

      console.log('✅ MongoDB indexes created/verified');
    } catch (error) {
      console.error('⚠️ Index creation error:', error.message);
    }
  }

  async getCollection(collectionName) {
    const db = await this.connect();
    return db.collection(collectionName);
  }

  async testConnection() {
    try {
      const db = await this.connect();
      await db.command({ ping: 1 });
      console.log('✅ MongoDB connection test passed');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection test failed:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      this.client = null;
      this.db = null;
      this.connectionPromise = null;
      console.log('📊 MongoDB connection closed');
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      database: this.db?.databaseName || null,
      poolSize: this.client?.options?.maxPoolSize || null,
      activeConnections: this.isConnected ? 'Connected' : 'Disconnected'
    };
  }
}

// Create and export a singleton instance
const mongoDB = new MongoDB();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📥 SIGTERM received, closing MongoDB connection...');
  await mongoDB.disconnect();
});

process.on('SIGINT', async () => {
  console.log('📥 SIGINT received, closing MongoDB connection...');
  await mongoDB.disconnect();
});

module.exports = mongoDB;
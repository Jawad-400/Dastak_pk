const { MongoClient } = require('mongodb');
require('dotenv').config();

class MongoDB {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
    this.connectionPromise = null; // ✅ Add this to prevent multiple connections
  }

  async connect() {
    // ✅ If already connected, return the existing connection
    if (this.isConnected && this.db) {
      console.log('📊 Reusing existing MongoDB connection');
      return this.db;
    }

    // ✅ If connection is in progress, wait for it
    if (this.connectionPromise) {
      console.log('⏳ MongoDB connection in progress, waiting...');
      return this.connectionPromise;
    }

    // ✅ Create new connection
    this.connectionPromise = this._createConnection();
    return this.connectionPromise;
  }

  async _createConnection() {
    try {
      const uri = process.env.MONGODB_URI || 
        'mongodb://admin:admin123@orders_mongo:27017/orders_db?authSource=admin';
      
      const dbName = process.env.MONGODB_DB || 'orders_db';
      
      console.log('🔄 Creating new MongoDB connection...');
      
      this.client = new MongoClient(uri, {
        maxPoolSize: 10,        // ✅ Limit connection pool
        minPoolSize: 2,
        maxIdleTimeMS: 30000,   // Close idle connections after 30 seconds
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000
      });

      await this.client.connect();
      this.db = this.client.db(dbName);
      this.isConnected = true;
      
      console.log('✅ MongoDB connected successfully (connection pooled)');
      
      // Create indexes (but don't wait for them)
      this.createIndexes().catch(err => 
        console.error('⚠️ Index creation error:', err.message)
      );
      
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      this.connectionPromise = null;
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Orders collection indexes
      await this.db.collection('orders').createIndexes([
        { key: { id: 1 }, unique: true, name: 'id_unique' },
        { key: { customerId: 1 }, name: 'customerId_index' },
        { key: { providerId: 1 }, name: 'providerId_index' },
        { key: { status: 1 }, name: 'status_index' },
        { key: { createdAt: -1 }, name: 'createdAt_desc' },
        { key: { serviceType: 1 }, name: 'serviceType_index' }
      ]);

      // Users cache indexes
      await this.db.collection('users_cache').createIndexes([
        { key: { userId: 1 }, unique: true, name: 'userId_unique' },
        { key: { email: 1 }, unique: true, name: 'email_unique' },
        { key: { phone: 1 }, name: 'phone_index' }
      ]);

      console.log('✅ MongoDB indexes created');
    } catch (error) {
      console.error('Index creation error:', error);
    }
  }

  async getCollection(collectionName) {
    const db = await this.connect();
    return db.collection(collectionName);
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
}

module.exports = new MongoDB();
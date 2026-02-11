const { MongoClient } = require('mongodb');
require('dotenv').config();

class MongoDB {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017';
      const dbName = process.env.MONGODB_DB || 'orders_db';
      
      this.client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 10000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db(dbName);
      this.isConnected = true;
      
      console.log('✅ MongoDB connected successfully');
      
      // Create indexes
      await this.createIndexes();
      
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Orders collection indexes
      await this.db.collection('orders').createIndexes([
        { key: { orderId: 1 }, unique: true, name: 'orderId_unique' },
        { key: { customerId: 1 }, name: 'customerId_index' },
        { key: { providerId: 1 }, name: 'providerId_index' },
        { key: { status: 1 }, name: 'status_index' },
        { key: { createdAt: -1 }, name: 'createdAt_desc' },
        { key: { 'location.coordinates': '2dsphere' }, name: 'location_geo' }
      ]);

      // Users collection (cache from MySQL)
      await this.db.collection('users_cache').createIndexes([
        { key: { userId: 1 }, unique: true, name: 'userId_unique' },
        { key: { email: 1 }, unique: true, name: 'email_unique' },
        { key: { role: 1 }, name: 'role_index' }
      ]);

      console.log('✅ MongoDB indexes created');
    } catch (error) {
      console.error('Index creation error:', error);
    }
  }

  async getCollection(collectionName) {
    if (!this.isConnected) {
      await this.connect();
    }
    return this.db.collection(collectionName);
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('MongoDB connection closed');
    }
  }

  // Helper method for transactions
  async withTransaction(operations) {
    const session = this.client.startSession();
    
    try {
      let result;
      await session.withTransaction(async () => {
        result = await operations(session);
      });
      
      return result;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }
}

module.exports = new MongoDB();


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
      // CORRECTED URI - with authSource parameter
      const uri = process.env.MONGODB_URI || 
        'mongodb://admin:admin123@orders_mongo:27017/orders_db?authSource=admin';
      
      const dbName = process.env.MONGODB_DB || 'orders_db';
      
      console.log('MongoDB connecting to:', uri.replace(/\/\/admin:.*@/, '//***:***@'));
      
      this.client = new MongoClient(uri, {
        // Modern MongoDB driver options (v4+)
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
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
      console.error('Error code:', error.code);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Try to drop old index if exists (don't fail if it doesn't)
      try {
        await this.db.collection('orders').dropIndex('orderId_unique');
        console.log('✅ Dropped old orderId_unique index');
      } catch (e) {
        // Index doesn't exist - that's fine
      }
  
      // Create indexes with error handling for each
      try {
        await this.db.collection('orders').createIndexes([
          { key: { id: 1 }, unique: true, name: 'id_unique' },
          { key: { customerId: 1 }, name: 'customerId_index' },
          { key: { providerId: 1 }, name: 'providerId_index' },
          { key: { status: 1 }, name: 'status_index' },
          { key: { createdAt: -1 }, name: 'createdAt_desc' },
          { key: { serviceType: 1 }, name: 'serviceType_index' }
        ]);
        console.log('✅ Orders indexes created');
      } catch (indexError) {
        console.error('⚠️ Orders index creation error:', indexError.message);
      }
  
      // Users cache indexes
      try {
        await this.db.collection('users_cache').createIndexes([
          { key: { userId: 1 }, unique: true, name: 'userId_unique' },
          { key: { email: 1 }, unique: true, name: 'email_unique' },
          { key: { phone: 1 }, name: 'phone_index' }
        ]);
        console.log('✅ Users cache indexes created');
      } catch (indexError) {
        console.error('⚠️ Users cache index error:', indexError.message);
      }
  
    } catch (error) {
      console.error('⚠️ Index creation error (non-critical):', error.message);
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

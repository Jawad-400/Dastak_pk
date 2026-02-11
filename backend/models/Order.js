const mongoDB = require('../config/mongodb');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

// Optional: Mongoose schema (if you prefer Mongoose)
const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true },
  customerId: { type: String, required: true },
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  providerId: { type: String, default: null },
  providerInfo: {
    name: String,
    email: String,
    phone: String
  },
  serviceType: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    address: String,
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    estimated: Boolean
  },
  schedule: {
    preferredDate: Date,
    preferredTime: String,
    estimatedDuration: Number, // in minutes
    actualStart: Date,
    actualEnd: Date
  },
  attachments: [{
    url: String,
    type: String,
    name: String,
    uploadedAt: Date
  }],
  messages: [{
    senderId: String,
    senderType: { type: String, enum: ['customer', 'provider', 'admin'] },
    message: String,
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  ratings: {
    customerRating: { type: Number, min: 1, max: 5 },
    providerRating: { type: Number, min: 1, max: 5 },
    customerReview: String,
    providerReview: String,
    ratedAt: Date
  },
  history: [{
    status: String,
    changedBy: String,
    changedByType: String,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }],
  metadata: {
    source: { type: String, default: 'web' },
    ipAddress: String,
    userAgent: String,
    referralCode: String
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ providerId: 1, status: 1 });
orderSchema.index({ 'location.coordinates': '2dsphere' });
orderSchema.index({ status: 1, priority: -1, createdAt: 1 });

const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);

// Native MongoDB driver class (alternative to Mongoose)
class Order {
  static async getCollection() {
    return await mongoDB.getCollection('orders');
  }

  // Create new order
  static async create(orderData) {
    const collection = await this.getCollection();
    
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const order = {
      orderId,
      ...orderData,
      status: 'pending',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [{
        status: 'pending',
        changedBy: orderData.customerId,
        changedByType: 'customer',
        timestamp: new Date(),
        notes: 'Order created'
      }]
    };

    const result = await collection.insertOne(order);
    return { ...order, _id: result.insertedId };
  }

  // Find order by ID
  static async findById(orderId) {
    const collection = await this.getCollection();
    return await collection.findOne({ orderId, isActive: true });
  }

  // Find orders by customer
  static async findByCustomer(customerId, { page = 1, limit = 10, status } = {}) {
    const collection = await this.getCollection();
    
    const query = { customerId, isActive: true };
    if (status) query.status = status;
    
    const skip = (page - 1) * limit;
    
    const orders = await collection.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await collection.countDocuments(query);
    
    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Find orders by provider
  static async findByProvider(providerId, { page = 1, limit = 10, status } = {}) {
    const collection = await this.getCollection();
    
    const query = { providerId, isActive: true };
    if (status) query.status = status;
    
    const skip = (page - 1) * limit;
    
    const orders = await collection.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await collection.countDocuments(query);
    
    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Find available orders for providers
  static async findAvailableOrders({ 
    page = 1, 
    limit = 20, 
    serviceType, 
    location, 
    maxDistance = 5000 // 5km
  } = {}) {
    const collection = await this.getCollection();
    
    const query = { 
      status: 'pending', 
      isActive: true,
      providerId: null 
    };
    
    if (serviceType) {
      query.serviceType = serviceType;
    }
    
    let pipeline = [
      { $match: query }
    ];
    
    // Add geo-near query if location provided
    if (location && location.coordinates) {
      pipeline.push({
        $geoNear: {
          near: { type: 'Point', coordinates: location.coordinates },
          distanceField: 'distance',
          maxDistance: maxDistance,
          spherical: true,
          query: query
        }
      });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }
    
    pipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );
    
    const orders = await collection.aggregate(pipeline).toArray();
    const total = await collection.countDocuments(query);
    
    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update order status
  static async updateStatus(orderId, status, userId, userType, notes = '') {
    const collection = await this.getCollection();
    
    const update = {
      $set: { 
        status, 
        updatedAt: new Date() 
      },
      $push: { 
        history: {
          status,
          changedBy: userId,
          changedByType: userType,
          timestamp: new Date(),
          notes
        }
      }
    };
    
    // If accepted, set providerId
    if (status === 'accepted') {
      update.$set.providerId = userId;
      // You might want to fetch provider info here
    }
    
    const result = await collection.findOneAndUpdate(
      { orderId, isActive: true },
      update,
      { returnDocument: 'after' }
    );
    
    return result.value;
  }

  // Add message to order
  static async addMessage(orderId, messageData) {
    const collection = await this.getCollection();
    
    const message = {
      ...messageData,
      timestamp: new Date(),
      read: false
    };
    
    const result = await collection.findOneAndUpdate(
      { orderId, isActive: true },
      {
        $push: { messages: message },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
    
    return result.value;
  }

  // Mark messages as read
  static async markMessagesAsRead(orderId, userId) {
    const collection = await this.getCollection();
    
    const result = await collection.findOneAndUpdate(
      { orderId, isActive: true, 'messages.read': false },
      {
        $set: { 
          'messages.$[elem].read': true,
          updatedAt: new Date()
        }
      },
      {
        arrayFilters: [{ 'elem.senderId': { $ne: userId } }],
        returnDocument: 'after'
      }
    );
    
    return result.value;
  }

  // Add rating
  static async addRating(orderId, ratingData) {
    const collection = await this.getCollection();
    
    const update = {
      $set: { 
        'ratings': ratingData,
        updatedAt: new Date()
      }
    };
    
    const result = await collection.findOneAndUpdate(
      { orderId, isActive: true },
      update,
      { returnDocument: 'after' }
    );
    
    return result.value;
  }

  // Search orders
  static async search({ 
    query, 
    status, 
    serviceType, 
    dateFrom, 
    dateTo, 
    page = 1, 
    limit = 20 
  }) {
    const collection = await this.getCollection();
    
    const searchQuery = { isActive: true };
    
    if (query) {
      searchQuery.$or = [
        { orderId: { $regex: query, $options: 'i' } },
        { 'customerInfo.name': { $regex: query, $options: 'i' } },
        { 'customerInfo.email': { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (status) searchQuery.status = status;
    if (serviceType) searchQuery.serviceType = serviceType;
    
    if (dateFrom || dateTo) {
      searchQuery.createdAt = {};
      if (dateFrom) searchQuery.createdAt.$gte = new Date(dateFrom);
      if (dateTo) searchQuery.createdAt.$lte = new Date(dateTo);
    }
    
    const skip = (page - 1) * limit;
    
    const orders = await collection.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await collection.countDocuments(searchQuery);
    
    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get order statistics
  static async getStats(timeframe = 'month') {
    const collection = await this.getCollection();
    
    let groupByFormat = '%Y-%m';
    let dateFilter = new Date();
    
    switch(timeframe) {
      case 'day':
        groupByFormat = '%Y-%m-%d';
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case 'week':
        groupByFormat = '%Y-%U';
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
      default: // month
        groupByFormat = '%Y-%m';
        dateFilter.setMonth(dateFilter.getMonth() - 12);
    }
    
    const pipeline = [
      {
        $match: {
          isActive: true,
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupByFormat, date: '$createdAt' }
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$price.amount' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ];
    
    return await collection.aggregate(pipeline).toArray();
  }

  // Soft delete order
  static async delete(orderId, userId) {
    const collection = await this.getCollection();
    
    const result = await collection.findOneAndUpdate(
      { orderId, isActive: true },
      {
        $set: { 
          isActive: false,
          updatedAt: new Date()
        },
        $push: {
          history: {
            status: 'deleted',
            changedBy: userId,
            changedByType: 'admin',
            timestamp: new Date(),
            notes: 'Order deleted'
          }
        }
      },
      { returnDocument: 'after' }
    );
    
    return result.value;
  }

  // Update order
  static async update(orderId, updates) {
    const collection = await this.getCollection();
    
    const result = await collection.findOneAndUpdate(
      { orderId, isActive: true },
      {
        $set: { 
          ...updates,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    
    return result.value;
  }
}

module.exports = Order;
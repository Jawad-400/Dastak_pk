const mongoDB = require('../config/mongodb');
const mysqlDB = require('../config/database');

// ==================== GET REQUESTS ====================
exports.getRequests = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const db = await mongoDB.connect();
    const ordersCollection = db.collection('orders');

    const query = {};
    if (status) {
      query.status = status;
    }

    const requests = await ordersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();

    const total = await ordersCollection.countDocuments(query);

    res.json({
      success: true,
      data: {
        requests,
        total,
        count: requests.length
      }
    });
  } catch (error) {
    console.error('❌ Get requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ==================== GET SINGLE REQUEST ====================
exports.getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await mongoDB.connect();
    const ordersCollection = db.collection('orders');

    const request = await ordersCollection.findOne({ id });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('❌ Get request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ==================== CREATE REQUEST ====================
exports.createRequest = async (req, res) => {
  try {
    const { 
      title, description, location, locationCoords, budget, 
      customerId, customerName, serviceType, schedule, contact 
    } = req.body;

    // Validate
    if (!title || !location || !customerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const db = await mongoDB.connect();
    const ordersCollection = db.collection('orders');

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // ✅ Save coordinates with correct format
    const request = {
      id: requestId,
      title,
      description,
      location,
      locationCoords: locationCoords ? {
        lat: Number(locationCoords.lat),
        lng: Number(locationCoords.lng),
        address: locationCoords.address || location
      } : null,
      budget: budget || 'Negotiable',
      customerId: customerId.toString(),
      customerName: customerName || req.user?.name || 'Customer',
      serviceType: serviceType || 'general',
      service_type: serviceType || 'general', // For compatibility
      schedule: schedule || 'ASAP',
      contact: contact || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await ordersCollection.insertOne(request);
    
    console.log('✅ Request saved with coordinates:', request.locationCoords);
    console.log('🔧 Service Type:', request.serviceType);
    
    // ✅ Broadcast to providers via WebSocket
    if (global.wss && typeof global.wss.broadcastToProviders === 'function') {
      try {
        await global.wss.broadcastToProviders(serviceType, {
          event: 'new_request',
          data: request
        });
        console.log(`📢 Broadcasted new ${serviceType} request to providers`);
      } catch (wsError) {
        console.error('❌ WebSocket broadcast error:', wsError);
      }
    } else {
      console.warn('⚠️ WebSocket server not available for broadcasting');
    }

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: request
    });

  } catch (error) {
    console.error('❌ Create request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ==================== ACCEPT REQUEST ====================
exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { worker_id: providerId } = req.body;

    if (!providerId) {
      return res.status(400).json({
        success: false,
        error: 'Worker ID is required'
      });
    }

    const db = await mongoDB.connect();
    const ordersCollection = db.collection('orders');

    const request = await ordersCollection.findOne({ id });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Request already ${request.status}`
      });
    }

    // Get provider name
    let providerName = 'Provider';
    try {
      const [providers] = await mysqlDB.pool.execute(
        'SELECT name FROM users WHERE id = ?',
        [providerId]
      );
      if (providers.length > 0) {
        providerName = providers[0].name;
      }
    } catch (dbError) {
      console.error('Error fetching provider name:', dbError);
    }

    await ordersCollection.updateOne(
      { id },
      {
        $set: {
          status: 'accepted',
          providerId: providerId.toString(),
          providerName,
          acceptedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    const updatedRequest = await ordersCollection.findOne({ id });

    // ✅ Broadcast via WebSocket
    if (global.wss) {
      // Notify customer
      global.wss.sendToUser(request.customerId, {
        event: 'request_accepted',
        data: {
          requestId: id,
          providerName,
          providerId,
          message: `${providerName} has accepted your request`
        }
      });

      // Notify other providers that this request is taken
      global.wss.broadcastToType('provider', {
        event: 'request_taken',
        data: {
          request_id: id,
          providerName,
          serviceType: request.serviceType,
          message: `This request has been accepted by ${providerName}`
        }
      });
    }

    res.json({
      success: true,
      message: 'Request accepted successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('❌ Accept request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ==================== COMPLETE REQUEST ====================
exports.completeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await mongoDB.connect();
    const ordersCollection = db.collection('orders');

    const request = await ordersCollection.findOne({ id });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const result = await ordersCollection.updateOne(
      { id },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const updatedRequest = await ordersCollection.findOne({ id });

    // ✅ Notify customer via WebSocket
    if (global.wss) {
      global.wss.sendToUser(request.customerId, {
        event: 'order_completed',
        data: {
          requestId: id,
          message: 'Your service request has been marked as completed',
          completedAt: new Date()
        }
      });
    }

    res.json({
      success: true,
      message: 'Request completed successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('❌ Complete request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ==================== GET USER REQUESTS ====================
exports.getUserRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query; // 'customer' or 'provider'
    
    console.log(`📋 Fetching requests for user: ${userId}, type: ${type}`);
    
    const db = await mongoDB.connect();
    const ordersCollection = db.collection('orders');
    
    let query = {};
    if (type === 'customer') {
      query.customerId = userId;
      console.log(`👤 Customer query:`, query);
    } else if (type === 'provider') {
      query.providerId = userId;
    }
    
    const requests = await ordersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
      
    console.log(`✅ Found ${requests.length} requests`);
    
    res.json({
      success: true,
      data: {
        requests,
        count: requests.length
      }
    });
    
  } catch (error) {
    console.error('❌ Get user requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ==================== PAYMENT STUBS ====================
exports.createPayment = async (req, res) => {
  res.json({
    success: true,
    message: 'Payment created',
    data: {
      paymentId: `pay_${Date.now()}`,
      status: 'pending'
    }
  });
};

exports.verifyPayment = async (req, res) => {
  res.json({
    success: true,
    message: 'Payment verified',
    data: {
      verified: true,
      timestamp: new Date().toISOString()
    }
  });
};

// ==================== RATE REQUEST ====================
exports.rateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review, customerId, providerId } = req.body;
    
    const db = await mongoDB.connect();
    const ordersCollection = db.collection('orders');
    
    await ordersCollection.updateOne(
      { id },
      {
        $set: {
          rating,
          review,
          ratedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Rating submitted successfully'
    });
    
  } catch (error) {
    console.error('❌ Rate request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
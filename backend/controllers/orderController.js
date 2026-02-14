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

// ==================== COMPLETE REQUEST ====================
exports.completeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await mongoDB.connect();
    const ordersCollection = db.collection('orders');

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

    // Broadcast via WebSocket
    if (global.wss) {
      global.wss.sendToUser(updatedRequest.customerId, {
        event: 'order_completed',
        data: {
          requestId: id,
          message: 'Your service request has been marked as completed'
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

// ==================== CREATE REQUEST ====================
exports.createRequest = async (req, res) => {
  try {
    const { 
      title, description, location, locationCoords, budget, 
      customerId, serviceType, schedule, contact 
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
    
    // ✅ FIX: Ensure coordinates are saved with correct format
    const request = {
      id: requestId,
      title,
      description,
      location,
      locationCoords: locationCoords ? {  // ✅ Save coordinates!
        lat: Number(locationCoords.lat),
        lng: Number(locationCoords.lng),
        address: locationCoords.address || location
      } : null,
      budget: budget || '0',
      customerId: customerId.toString(),
      customerName: req.user?.name || 'Customer',
      serviceType: serviceType || 'general',
      schedule: schedule || 'ASAP',
      contact: contact || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await ordersCollection.insertOne(request);
    
    // ✅ DEBUG - Log saved coordinates
    console.log('✅ Request saved with coordinates:', request.locationCoords);
    
    // Broadcast via WebSocket
    if (global.wss) {
      global.wss.broadcastToProviders(serviceType, {
        event: 'new_request',
        data: request
      });
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

    // Broadcast via WebSocket
    if (global.wss) {
      global.wss.sendToUser(request.customerId, {
        event: 'request_accepted',
        data: {
          requestId: id,
          providerName,
          providerId
        }
      });

      global.wss.broadcastToType('provider', {
        event: 'request_taken',
        data: {
          requestId: id,
          providerName,
          serviceType: request.serviceType
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
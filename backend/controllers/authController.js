const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysqlDB = require('../config/database');
const mongoDB = require('../config/mongodb');

// ==================== REGISTER ====================
exports.register = async (req, res) => {
  try {
    const { email, password, name, phone, user_type, service, city, cnic, address } = req.body;

    if (!user_type || !['customer', 'provider', 'admin'].includes(user_type)) {
      return res.status(400).json({
        success: false,
        error: 'Valid user type is required (customer, provider, or admin)'
      });
    }

    if (user_type === 'provider' && !service) {
      return res.status(400).json({
        success: false,
        error: 'Service type is required for providers'
      });
    }

    const [existingUsers] = await mysqlDB.pool.execute(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email or phone number already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await mysqlDB.pool.execute(
      `INSERT INTO users (
        email, password, name, phone, user_type, service, city, cnic, address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        email,
        hashedPassword,
        name,
        phone,
        user_type,
        user_type === 'provider' ? service : null,
        city || null,
        cnic || null,
        address || null
      ]
    );

    const userId = result.insertId;

    const token = jwt.sign(
      { 
        userId, 
        email, 
        name,
        user_type,
        service: user_type === 'provider' ? service : null
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // MongoDB cache - non-critical
    try {
      const db = await mongoDB.connect();
      const usersCollection = db.collection('users_cache');
      await usersCollection.updateOne(
        { userId: userId.toString() },
        {
          $set: {
            userId: userId.toString(),
            email,
            name,
            phone,
            userType: user_type,
            service: user_type === 'provider' ? service : null,
            city: city || null,
            cnic: cnic || null,
            address: address || null,
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
    } catch (mongoError) {
      console.error('⚠️ MongoDB cache error:', mongoError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: userId,
          email,
          name,
          phone,
          user_type,
          service: user_type === 'provider' ? service : null,
          city: city || null,
          cnic: cnic || null,
          address: address || null
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ==================== LOGIN - FIXED VERSION ====================
exports.login = async (req, res) => {
  try {
    console.log('📝 Login request received:', req.body);
    
    const { phone, password } = req.body;
    
    if (!phone) {
      console.log('❌ No phone provided');
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    if (!password) {
      console.log('❌ No password provided');
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    const cleanPhone = phone.toString().replace(/\D/g, '');
    console.log('🔍 Searching for phone:', cleanPhone);

    const [users] = await mysqlDB.pool.execute(
      `SELECT id, email, password, name, phone, user_type, service, city, cnic, address, is_active, created_at 
       FROM users WHERE phone = ?`,
      [cleanPhone]
    );

    console.log(`🔍 Found ${users.length} users`);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid phone number or password'
      });
    }

    const user = users[0];
    console.log('👤 User found:', { id: user.id, name: user.name, type: user.user_type });

    if (user.is_active === 0) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔑 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid phone number or password'
      });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        name: user.name,
        user_type: user.user_type,
        service: user.service,
        phone: user.phone
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    console.log('✅ Login successful for:', user.name);

    // MongoDB cache - non-critical
    try {
      const db = await mongoDB.connect();
      const usersCollection = db.collection('users_cache');
      await usersCollection.updateOne(
        { userId: user.id.toString() },
        {
          $set: {
            userId: user.id.toString(),
            email: user.email,
            name: user.name,
            phone: user.phone,
            userType: user.user_type,
            service: user.service,
            city: user.city,
            cnic: user.cnic,
            address: user.address,
            lastLogin: new Date(),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    } catch (mongoError) {
      console.error('⚠️ MongoDB cache error:', mongoError.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          user_type: user.user_type,
          service: user.service,
          city: user.city,
          cnic: user.cnic,
          address: user.address
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
  }
};

// ==================== VERIFY TOKEN ====================
exports.verifyToken = (req, res) => {
  return res.json({
    success: true,
    data: {
      user: req.user,
      valid: true
    }
  });
};

// ==================== GET USER ====================
exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.userId != userId && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to view this user'
      });
    }

    const [users] = await mysqlDB.pool.execute(
      `SELECT id, email, name, phone, user_type, service, city, cnic, address, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    return res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        user_type: user.user_type,
        service: user.service,
        city: user.city,
        cnic: user.cnic,
        address: user.address,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('❌ Get user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ==================== GET USER REQUESTS - COMPLETE VERSION ====================
exports.getUserRequests = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`📋 Fetching requests for user: ${userId}, type: ${req.user.user_type}`);

    // Check authorization
    if (req.user.userId != userId && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to view these requests'
      });
    }

    const db = await mongoDB.connect();
    const ordersCollection = db.collection('orders');

    let query = {};
    
    // Build query based on user type
    if (req.user.user_type === 'provider') {
      // Providers see jobs they've accepted
      query = {
        providerId: userId.toString(),
        status: { $in: ['accepted', 'completed'] }
      };
      console.log('🔧 Provider query:', query);
    } else if (req.user.user_type === 'customer') {
      // Customers see their posted requests
      query.customerId = userId.toString();
      console.log('👤 Customer query:', query);
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
        total: requests.length
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
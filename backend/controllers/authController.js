const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysqlDB = require('../config/database');
const mongoDB = require('../config/mongodb');

// ==================== REGISTER ====================
// ==================== REGISTER - FIXED ====================
exports.register = async (req, res) => {
  try {
    const { email, password, name, phone, user_type, service, city, cnic, address } = req.body;

    // Validate user_type
    if (!user_type || !['customer', 'provider', 'admin'].includes(user_type)) {
      return res.status(400).json({
        success: false,
        error: 'Valid user type is required (customer, provider, or admin)'
      });
    }

    // Validate provider has service
    if (user_type === 'provider' && !service) {
      return res.status(400).json({
        success: false,
        error: 'Service type is required for providers'
      });
    }

    // Check if user exists by email OR phone
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into MySQL
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

    // Generate JWT token
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

    // ✅ FIXED: Try MongoDB cache, but DON'T FAIL if it errors
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
      console.log('✅ MongoDB cache updated for user:', userId);
    } catch (mongoError) {
      // ⚠️ DON'T FAIL REGISTRATION - just log the error
      console.error('⚠️ MongoDB cache error (non-critical):', mongoError.message);
    }

    // ✅ ALWAYS return success if MySQL insert worked
    res.status(201).json({
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
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ==================== LOGIN - SUPPORTS BOTH EMAIL AND PHONE ====================
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    
    let query;
    let params;
    
    // 👇 PRIORITIZE PHONE over email
    if (phone) {
      query = `SELECT id, email, password, name, phone, user_type, service, city, cnic, address, is_active, created_at 
               FROM users WHERE phone = ?`;
      params = [phone.replace(/\D/g, '')];
    } else if (email) {
      query = `SELECT id, email, password, name, phone, user_type, service, city, cnic, address, is_active, created_at 
               FROM users WHERE email = ?`;
      params = [email];
    } else {
      return res.status(400).json({
        success: false,
        error: 'Phone number or email is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    const [users] = await mysqlDB.pool.execute(query, params);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    const user = users[0];

    if (user.is_active === 0) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        name: user.name,
        user_type: user.user_type,
        service: user.service
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

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
      console.error('⚠️ MongoDB cache update failed:', mongoError.message);
    }

    res.json({
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
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ==================== VERIFY TOKEN ====================
exports.verifyToken = (req, res) => {
  res.json({
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

    res.json({
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
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// ==================== GET USER REQUESTS ====================
exports.getUserRequests = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.userId != userId && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to view these requests'
      });
    }

    const db = await mongoDB.connect();
    const ordersCollection = db.collection('orders');

    let query = {};
    
    if (req.user.user_type === 'customer') {
      query.customerId = userId.toString();
    } else if (req.user.user_type === 'provider') {
      query.providerId = userId.toString();
    }

    const requests = await ordersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

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
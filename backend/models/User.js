const db = require('../config/database');
const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class User {
  // Create new user
  static async create(userData) {
    const transaction = await db.transaction();
    
    try {
      const uuid = uuidv4();
      const hashedPassword = await bcryptjs.hash(userData.password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Insert into users table
      const sql = `
        INSERT INTO users (uuid, email, username, password_hash, full_name, phone, role, verification_token)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        uuid,
        userData.email,
        userData.username,
        hashedPassword,
        userData.full_name || null,
        userData.phone || null,
        userData.role || 'customer',
        verificationToken
      ];
      
      const result = await transaction.query(sql, params);
      const userId = result.insertId;
      
      // Create user profile
      const profileSql = `
        INSERT INTO user_profiles (user_id, preferences, metadata)
        VALUES (?, ?, ?)
      `;
      
      await transaction.query(profileSql, [
        userId,
        JSON.stringify({ email_notifications: true }),
        JSON.stringify({ source: userData.source || 'web' })
      ]);
      
      // Log the action
      await transaction.query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values) VALUES (?, ?, ?, ?, ?)',
        [userId, 'REGISTER', 'USER', uuid, JSON.stringify({ email: userData.email, role: userData.role || 'customer' })]
      );
      
      await transaction.commit();
      
      return {
        id: userId,
        uuid,
        email: userData.email,
        username: userData.username,
        verificationToken
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = `
      SELECT u.*, up.preferences, up.metadata 
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.email = ? AND u.is_active = TRUE
    `;
    
    const users = await db.query(sql, [email]);
    return users[0] || null;
  }

  // Find user by username
  static async findByUsername(username) {
    const sql = `
      SELECT u.*, up.preferences, up.metadata 
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.username = ? AND u.is_active = TRUE
    `;
    
    const users = await db.query(sql, [username]);
    return users[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const sql = `
      SELECT u.*, up.preferences, up.metadata, up.bio, up.location, up.website, up.social_links
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ? AND u.is_active = TRUE
    `;
    
    const users = await db.query(sql, [id]);
    return users[0] || null;
  }

  // Find user by UUID
  static async findByUuid(uuid) {
    const sql = `
      SELECT u.*, up.preferences, up.metadata 
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.uuid = ? AND u.is_active = TRUE
    `;
    
    const users = await db.query(sql, [uuid]);
    return users[0] || null;
  }

  // Verify password
  static async verifyPassword(user, password) {
    return await bcryptjs.compare(password, user.password_hash);
  }

  // Update user
  static async update(id, updates) {
    const allowedFields = ['full_name', 'phone', 'avatar_url', 'is_verified', 'is_active'];
    const updateFields = [];
    const params = [];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        params.push(updates[key]);
      }
    });
    
    if (updateFields.length === 0) {
      return null;
    }
    
    params.push(id);
    
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await db.query(sql, params);
    
    // Update profile if needed
    const profileUpdates = ['bio', 'location', 'website', 'social_links', 'preferences'];
    const profileUpdateFields = [];
    const profileParams = [];
    
    Object.keys(updates).forEach(key => {
      if (profileUpdates.includes(key)) {
        if (key === 'social_links' || key === 'preferences') {
          profileUpdateFields.push(`${key} = ?`);
          profileParams.push(JSON.stringify(updates[key]));
        } else {
          profileUpdateFields.push(`${key} = ?`);
          profileParams.push(updates[key]);
        }
      }
    });
    
    if (profileUpdateFields.length > 0) {
      profileParams.push(id);
      const profileSql = `
        INSERT INTO user_profiles (user_id, ${profileUpdates.join(', ')})
        VALUES (?, ${profileUpdates.map(() => '?').join(', ')})
        ON DUPLICATE KEY UPDATE ${profileUpdateFields.map(field => `${field.split(' = ')[0]} = VALUES(${field.split(' = ')[0]})`).join(', ')}
      `;
      await db.query(profileSql, [id, ...profileParams.slice(0, -1)]);
    }
    
    return this.findById(id);
  }

  // Create session
  static async createSession(userId, sessionData) {
    const sessionToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const sql = `
      INSERT INTO user_sessions (user_id, session_token, device_info, ip_address, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await db.query(sql, [
      userId,
      sessionToken,
      sessionData.device_info || null,
      sessionData.ip_address || null,
      expiresAt
    ]);
    
    return { sessionToken, expiresAt };
  }

  // Validate session
  static async validateSession(sessionToken) {
    const sql = `
      SELECT us.*, u.email, u.username, u.role, u.is_active, u.is_verified
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.session_token = ? AND us.expires_at > NOW() AND u.is_active = TRUE
    `;
    
    const sessions = await db.query(sql, [sessionToken]);
    return sessions[0] || null;
  }

  // Delete session
  static async deleteSession(sessionToken) {
    const sql = 'DELETE FROM user_sessions WHERE session_token = ?';
    await db.query(sql, [sessionToken]);
  }

  // Update last login
  static async updateLastLogin(userId) {
    const sql = 'UPDATE users SET last_login = NOW(), login_count = login_count + 1 WHERE id = ?';
    await db.query(sql, [userId]);
  }

  // Search users
  static async search({ query, role, limit = 20, offset = 0 }) {
    let sql = `
      SELECT u.id, u.uuid, u.email, u.username, u.full_name, u.avatar_url, u.role, u.created_at
      FROM users u
      WHERE u.is_active = TRUE
    `;
    
    const params = [];
    
    if (query) {
      sql += ` AND (u.email LIKE ? OR u.username LIKE ? OR u.full_name LIKE ?)`;
      const searchQuery = `%${query}%`;
      params.push(searchQuery, searchQuery, searchQuery);
    }
    
    if (role) {
      sql += ` AND u.role = ?`;
      params.push(role);
    }
    
    sql += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const users = await db.query(sql, params);
    
    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM users u WHERE u.is_active = TRUE`;
    const countParams = [];
    
    if (query) {
      countSql += ` AND (u.email LIKE ? OR u.username LIKE ? OR u.full_name LIKE ?)`;
      const searchQuery = `%${query}%`;
      countParams.push(searchQuery, searchQuery, searchQuery);
    }
    
    if (role) {
      countSql += ` AND u.role = ?`;
      countParams.push(role);
    }
    
    const [countResult] = await db.query(countSql, countParams);
    
    return {
      users,
      total: countResult.total,
      limit,
      offset
    };
  }

  // Generate reset token
  static async generateResetToken(email) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    
    const sql = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?';
    await db.query(sql, [resetToken, resetTokenExpiry, user.id]);
    
    return { user, resetToken };
  }

  // Verify reset token
  static async verifyResetToken(token) {
    const sql = `
      SELECT * FROM users 
      WHERE reset_token = ? AND reset_token_expiry > NOW() AND is_active = TRUE
    `;
    
    const users = await db.query(sql, [token]);
    return users[0] || null;
  }

  // Reset password
  static async resetPassword(token, newPassword) {
    const user = await this.verifyResetToken(token);
    if (!user) return false;
    
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    
    const sql = `
      UPDATE users 
      SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL 
      WHERE id = ?
    `;
    
    await db.query(sql, [hashedPassword, user.id]);
    return true;
  }

  // Verify email
  static async verifyEmail(token) {
    const sql = `
      UPDATE users 
      SET is_verified = TRUE, verification_token = NULL 
      WHERE verification_token = ? AND is_active = TRUE
    `;
    
    const result = await db.query(sql, [token]);
    return result.affectedRows > 0;
  }

  // Get user statistics
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verified_users,
        SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as customers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'provider' THEN 1 ELSE 0 END) as providers,
        DATE(created_at) as date,
        COUNT(*) as daily_registrations
      FROM users 
      WHERE is_active = TRUE
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;
    
    return await db.query(sql);
  }
}

module.exports = User;
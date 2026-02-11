const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');
const sendEmail = require('../utils/emailService');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const { email, username, password, full_name, phone, role } = req.body;

      // Validation
      if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ error: 'Valid email is required' });
      }

      if (!username || username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      // Check if user exists
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ error: 'Username already taken' });
      }

      // Create user
      const userData = { email, username, password, full_name, phone, role };
      const user = await User.create(userData);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.uuid, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Create session
      const session = await User.createSession(user.id, {
        device_info: req.headers['user-agent'],
        ip_address: req.ip
      });

      // Send verification email (optional)
      if (process.env.SEND_VERIFICATION_EMAIL === 'true') {
        await sendEmail({
          to: email,
          subject: 'Verify your email',
          template: 'verification',
          context: {
            name: full_name || username,
            verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${user.verificationToken}`
          }
        });
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.uuid,
            email: user.email,
            username: user.username,
            full_name: user.full_name,
            role: user.role,
            is_verified: false
          },
          token,
          session: session.sessionToken,
          expiresAt: session.expiresAt
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed', details: error.message });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if account is active
      if (!user.is_active) {
        return res.status(403).json({ error: 'Account is deactivated' });
      }

      // Verify password
      const isValidPassword = await User.verifyPassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.uuid, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Create session
      const session = await User.createSession(user.id, {
        device_info: req.headers['user-agent'],
        ip_address: req.ip
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.uuid,
            email: user.email,
            username: user.username,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            role: user.role,
            is_verified: user.is_verified
          },
          token,
          session: session.sessionToken,
          expiresAt: session.expiresAt
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed', details: error.message });
    }
  }

  // Logout user
  static async logout(req, res) {
    try {
      const sessionToken = req.headers['x-session-token'] || req.cookies?.session_token;
      
      if (sessionToken) {
        await User.deleteSession(sessionToken);
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findByUuid(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove sensitive data
      delete user.password_hash;
      delete user.verification_token;
      delete user.reset_token;
      delete user.reset_token_expiry;

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  // Update profile
  static async updateProfile(req, res) {
    try {
      const updates = req.body;
      const userId = req.user.userId;

      const user = await User.findByUuid(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Don't allow role changes unless admin
      if (updates.role && req.user.role !== 'admin') {
        delete updates.role;
      }

      // Don't allow email changes without verification
      if (updates.email) {
        // Check if email already exists
        const existingUser = await User.findByEmail(updates.email);
        if (existingUser && existingUser.uuid !== userId) {
          return res.status(409).json({ error: 'Email already registered' });
        }
      }

      const updatedUser = await User.update(user.id, updates);

      // Remove sensitive data
      delete updatedUser.password_hash;
      delete updatedUser.verification_token;
      delete updatedUser.reset_token;
      delete updatedUser.reset_token_expiry;

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // Request password reset
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const result = await User.generateResetToken(email);
      
      if (!result) {
        // Return success even if email doesn't exist (security)
        return res.json({
          success: true,
          message: 'If your email is registered, you will receive a reset link'
        });
      }

      const { user, resetToken } = result;

      // Send reset email
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        template: 'password_reset',
        context: {
          name: user.full_name || user.username,
          resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
        }
      });

      res.json({
        success: true,
        message: 'Password reset email sent'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process request' });
    }
  }

  // Reset password
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const success = await User.resetPassword(token, newPassword);

      if (!success) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      res.json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }

  // Verify email
  static async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({ error: 'Verification token is required' });
      }

      const success = await User.verifyEmail(token);

      if (!success) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      res.json({
        success: true,
        message: 'Email verified successfully'
      });

    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({ error: 'Failed to verify email' });
    }
  }

  // Validate session
  static async validateSession(req, res) {
    try {
      const sessionToken = req.headers['x-session-token'] || req.cookies?.session_token;
      
      if (!sessionToken) {
        return res.status(401).json({ error: 'No session token provided' });
      }

      const session = await User.validateSession(sessionToken);
      
      if (!session) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }

      // Update session expiry (refresh)
      const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      // You would update this in the database

      res.json({
        success: true,
        data: {
          user: {
            id: session.uuid,
            email: session.email,
            username: session.username,
            role: session.role,
            is_verified: session.is_verified
          },
          session: {
            expiresAt: newExpiry
          }
        }
      });

    } catch (error) {
      console.error('Session validation error:', error);
      res.status(500).json({ error: 'Session validation failed' });
    }
  }

  // Get users (admin only)
  static async getUsers(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { query, role, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const result = await User.search({
        query,
        role,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  // Get user by ID (admin only)
  static async getUserById(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { userId } = req.params;
      const user = await User.findByUuid(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove sensitive data
      delete user.password_hash;
      delete user.verification_token;
      delete user.reset_token;
      delete user.reset_token_expiry;

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  // Update user (admin only)
  static async updateUser(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { userId } = req.params;
      const updates = req.body;

      const user = await User.findByUuid(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await User.update(user.id, updates);

      // Remove sensitive data
      delete updatedUser.password_hash;
      delete updatedUser.verification_token;
      delete updatedUser.reset_token;
      delete updatedUser.reset_token_expiry;

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  // Delete user (admin only)
  static async deleteUser(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { userId } = req.params;

      const user = await User.findByUuid(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Soft delete by deactivating
      await User.update(user.id, { is_active: false });

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  // Get statistics (admin only)
  static async getStats(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const stats = await User.getStats();

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
}

module.exports = AuthController;
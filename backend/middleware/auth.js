const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = {
  // Verify JWT token
  verifyToken: (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1] || 
                   req.cookies?.token || 
                   req.query.token;

      if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
      }

      jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
          if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
          }
          return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = decoded;
        next();
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  },

  // Verify session token
  verifySession: async (req, res, next) => {
    try {
      const sessionToken = req.headers['x-session-token'] || req.cookies?.session_token;

      if (!sessionToken) {
        return res.status(401).json({ error: 'No session token provided' });
      }

      const session = await User.validateSession(sessionToken);
      
      if (!session) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }

      req.user = {
        userId: session.uuid,
        email: session.email,
        username: session.username,
        role: session.role,
        is_verified: session.is_verified,
        sessionId: session.id
      };

      next();
    } catch (error) {
      console.error('Session verification error:', error);
      res.status(500).json({ error: 'Session validation failed' });
    }
  },

  // Role-based authorization
  authorize: (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: `Access denied. Required roles: ${roles.join(', ')}` 
        });
      }

      next();
    };
  },

  // Optional authentication (for public routes)
  optionalAuth: (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1] || 
                   req.cookies?.token || 
                   req.query.token;

      if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
          if (!error) {
            req.user = decoded;
          }
        });
      }

      next();
    } catch (error) {
      next();
    }
  },

  // Rate limiting (optional, use with express-rate-limit)
  rateLimit: require('express-rate-limit')({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
  }),

  // Validate request data
  validateRequest: (schema) => {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.details.map(detail => detail.message) 
        });
      }
      
      next();
    };
  }
};

module.exports = authMiddleware;
console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
console.log('🔴 SERVER.JS IS EXECUTING AT: ' + new Date().toISOString());
console.log('🔴 CURRENT WORKING DIRECTORY: ' + process.cwd());
console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const http = require('http');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Database connections
const mysqlDB = require('./config/database');
const mongoDB = require('./config/mongodb');

// Import routes  
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const messagesRoutes = require('./routes/messages');

console.log('🔵🔵🔵 ROUTES IMPORT CHECK 🔵🔵🔵');
console.log('Auth routes:', authRoutes ? 'EXISTS' : 'MISSING');
console.log('Order routes:', orderRoutes ? 'EXISTS' : 'MISSING');
console.log('Messages routes:', messagesRoutes ? 'EXISTS' : 'MISSING');



// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Create HTTP server (required for WebSocket)
const server = http.createServer(app);

// ============ MIDDLEWARE ============

// Security middleware - optimized for Render
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - critical for Render
// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL].filter(Boolean)  // Just use FRONTEND_URL from env
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Token', 'X-Requested-With'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

app.get('/api/messages/test', (req, res) => {
  res.json({ success: true, message: 'Messages test route works' });
});

// Body parsing middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging - different formats for production/development
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // Apache combined format for production logs
} else {
  app.use(morgan('dev')); // Colorful dev logs
}

// ============ HEALTH CHECK ENDPOINTS ============

// Health check endpoint (critical for Render)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    services: {
      mysql: mysqlDB.isConnected ? 'connected' : 'disconnected',
      mongodb: mongoDB.isConnected ? 'connected' : 'disconnected'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Dastak PK Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      orders: '/api/*',
      messages: '/api/messages/*',
      websocket: '/ws',
      websocketStats: '/api/websocket/stats'
    }
  });
});

// ============ API ROUTES ============

// Auth routes
app.use('/api/auth', authRoutes);

// Order routes
app.use('/api', orderRoutes);

app.use('/api/messages', messagesRoutes);


// WebSocket stats endpoint
app.get('/api/websocket/stats', (req, res) => {
  if (global.wss) {
    try {
      // Get stats from WebSocket server
      const stats = {
        totalClients: global.wss.clients?.size || 0,
        providersByService: {},
        onlineUsers: []
      };
      
      // Count providers by service
      if (global.wss.providersByService) {
        for (const [service, providers] of global.wss.providersByService.entries()) {
          stats.providersByService[service] = providers.size;
        }
      }
      
      // Get online users count by type
      let customers = 0;
      let providers = 0;
      
      if (global.wss.clients) {
        for (const [_, client] of global.wss.clients) {
          if (client.type === 'customer') customers++;
          if (client.type === 'provider') providers++;
        }
      }
      
      stats.onlineUsers = {
        customers,
        providers,
        total: customers + providers
      };
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.json({
        success: false,
        message: 'Error getting WebSocket stats',
        error: error.message
      });
    }
  } else {
    res.json({
      success: false,
      message: 'WebSocket server not initialized'
    });
  }
});

// ============ ERROR HANDLING ============

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  // Don't leak error details in production
  const errorResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message
  };
  
  // Add stack trace in development only
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
});

// ============ SERVER STARTUP ============

async function startServer() {
  try {
    console.log('\n🚀 Starting Dastak PK Backend...');
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Node version: ${process.version}`);
    
    // Connect to databases
    console.log('\n📊 Connecting to databases...');
    
    // Connect to MySQL
    console.log('🔄 Connecting to MySQL...');
    await mysqlDB.connect();
    console.log('✅ MySQL connected successfully');
    
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoDB.connect();
    console.log('✅ MongoDB connected successfully');
    
    // Start HTTP server (not app.listen - we need server for WebSocket)
    server.listen(PORT, () => {
      console.log('\n🌐 Server is ready!');
      console.log(`🚀 HTTP: http://localhost:${PORT}`);
      console.log(`📡 WebSocket: ws://localhost:${PORT}/ws`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`🔗 Frontend origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n`);
    });

    // Initialize WebSocket server AFTER server is created
    console.log('🔌 Initializing WebSocket server...');
    const WebSocketServer = require('./websocket/server');
    const wss = new WebSocketServer(server);
    global.wss = wss; // Make accessible globally
    
    console.log('✅ WebSocket server ready');

    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal} signal, starting graceful shutdown...`);
  
  // Set a timeout for forced shutdown
  const forceShutdownTimeout = setTimeout(() => {
    console.error('⚠️ Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);

  try {
    // Close WebSocket server if exists
    if (global.wss && global.wss.wss) {
      console.log('📡 Closing WebSocket connections...');
      
      // Notify all clients
      global.wss.broadcastToAll({
        event: 'server_shutdown',
        data: { message: 'Server is shutting down for maintenance' }
      });
      
      // Close all client connections
      global.wss.wss.clients.forEach((client) => {
        client.close(1001, 'Server shutting down');
      });
      
      // Close WebSocket server
      await new Promise((resolve) => {
        global.wss.wss.close(resolve);
      });
      console.log('✅ WebSocket server closed');
    }

    // Close HTTP server
    console.log('👋 Closing HTTP server...');
    await new Promise((resolve) => {
      server.close(resolve);
    });
    console.log('✅ HTTP server closed');

    // Close database connections
    console.log('📊 Closing database connections...');
    
    if (mysqlDB) {
      await mysqlDB.disconnect();
      console.log('✅ MySQL connection closed');
    }
    
    if (mongoDB) {
      await mongoDB.disconnect();
      console.log('✅ MongoDB connection closed');
    }

    clearTimeout(forceShutdownTimeout);
    console.log('✅ Graceful shutdown complete');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    clearTimeout(forceShutdownTimeout);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer();

// Export for testing
module.exports = { app, server };
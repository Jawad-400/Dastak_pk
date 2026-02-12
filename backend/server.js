const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
require('dotenv').config();

// Database connections
const mysqlDB = require('./config/database');
const mongoDB = require('./config/mongodb');

// Import routes
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Token']
};
app.use(cors(corsOptions));

// Other middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      mysql: mysqlDB.pool ? 'connected' : 'disconnected',
      mongodb: mongoDB.isConnected ? 'connected' : 'disconnected'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', orderRoutes);

// WebSocket stats endpoint
app.get('/api/websocket/stats', (req, res) => {
  if (global.wss) {
    res.json({
      success: true,
      data: global.wss.getStats()
    });
  } else {
    res.json({
      success: false,
      message: 'WebSocket server not running'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Database connection and server startup
async function startServer() {
  try {
    // Connect to databases
    await mysqlDB.connect();
    await mongoDB.connect();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 MySQL: mysql:3306`);
      console.log(`🗄️  MongoDB: orders_mongo:27017`);
      console.log(`🌐 CORS Origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });

    // Initialize WebSocket server
    const WebSocketServer = require('./websocket/server');
    const wss = new WebSocketServer(server);
    global.wss = wss; // Make accessible globally
    console.log(`✅ WebSocket server ready at ws://localhost:${PORT}/ws`);

    // Graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    async function gracefulShutdown() {
      console.log('🛑 Received shutdown signal');
      
      server.close(async () => {
        console.log('👋 HTTP server closed');
        
        await mysqlDB.disconnect();
        await mongoDB.disconnect();
        
        console.log('📊 Database connections closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    }

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
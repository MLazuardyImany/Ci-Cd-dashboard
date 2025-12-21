require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('./config/database');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Socket.IO connection
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('subscribe-build', (buildId) => {
    socket.join(`build-${buildId}`);
    logger.info(`Client ${socket.id} subscribed to build ${buildId}`);
  });
  
  socket.on('unsubscribe-build', (buildId) => {
    socket.leave(`build-${buildId}`);
    logger.info(`Client ${socket.id} unsubscribed from build ${buildId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'CI/CD Dashboard API', 
    version: '1.0.0',
    status: 'running',
    timestamp: new Date()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API routes (akan ditambahkan nanti)
app.get('/api/projects', (req, res) => {
  res.json({ message: 'Projects endpoint - Coming soon' });
});

app.get('/api/builds', (req, res) => {
  res.json({ message: 'Builds endpoint - Coming soon' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Error occurred:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

const PORT = process.env.PORT || 5000;

// Database connection & server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    // Sync models (creates tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('Database models synchronized');
    
    // Start server
    server.listen(PORT, () => {
      logger.info('=================================');
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🌐 API URL: http://localhost:${PORT}`);
      logger.info(`💚 Health Check: http://localhost:${PORT}/health`);
      logger.info('=================================');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
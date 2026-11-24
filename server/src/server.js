const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// Database readiness check middleware
app.use((req, res, next) => {
  // Allow health check and root
  if (req.path === '/api/health' || req.path === '/') {
    return next();
  }

  // If MongoDB is still connecting or disconnected, return helpful guidance
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'MongoDB Atlas is connecting or not yet configured.',
      tip: 'Please check your MONGO_URI in server/.env with your MongoDB Atlas connection string and run "npm run seed".',
      databaseState: mongoose.connection.readyState,
    });
  }
  next();
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/pharmacies', require('./routes/pharmacyRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'MedFinder - Medicine Availability & Pharmacy Comparison API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected (set MONGO_URI in server/.env)',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Central Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` MedFinder Server is running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Configure MONGO_URI in server/.env'}`);
  console.log(`====================================================`);
});

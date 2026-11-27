
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from server/.env
dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

// Import database connection after loading .env
const connectDB = require('./config/db');

const app = express();

// Middlewares
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true
    })
);

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        project: 'MedFinder',
        database:
            mongoose.connection.readyState === 1
                ? 'connected'
                : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/pharmacies', require('./routes/pharmacyRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: `Route not found: ${req.originalUrl}`
    });
});

// Central error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);

    res.status(500).json({
        message: err.message || 'Internal Server Error'
    });
});

// Start server only after MongoDB connects
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log('========================================');
            console.log('MedFinder Backend Started Successfully');
            console.log(`Server: http://localhost:${PORT}`);
            console.log(`Health: http://localhost:${PORT}/api/health`);
            console.log('MongoDB: Connected');
            console.log('========================================');
        });
    } catch (error) {
        console.error('Failed to start MedFinder:', error.message);
        process.exit(1);
    }
};

startServer();

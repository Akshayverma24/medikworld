
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// ==========================================
// 1. LOAD ENVIRONMENT VARIABLES
// ==========================================

dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

const connectDB = require('./config/db');

const app = express();

// ==========================================
// 2. CORS CONFIGURATION
// ==========================================

const allowedOrigins = (
    process.env.CLIENT_URL || 'http://localhost:5173'
)
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests without an Origin header
            // (e.g. Postman or server-to-server requests)
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log('Blocked CORS origin:', origin);

            return callback(
                new Error('Not allowed by CORS')
            );
        },
        credentials: true,
        methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS'
        ],
        allowedHeaders: [
            'Content-Type',
            'Authorization'
        ]
    })
);

// ==========================================
// 3. BODY PARSING MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 4. HEALTH CHECK ROUTES
// ==========================================

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'MedFinder Backend is running',
        status: 'online'
    });
});

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

// ==========================================
// 5. API ROUTES
// ==========================================

app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/medicines', require('./routes/medicineRoutes'));

app.use('/api/pharmacies', require('./routes/pharmacyRoutes'));

app.use('/api/inventory', require('./routes/inventoryRoutes'));

app.use('/api/reservations', require('./routes/reservationRoutes'));

// ==========================================
// 6. 404 HANDLER
// ==========================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
});

// ==========================================
// 7. CENTRAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS: Origin not allowed'
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// ==========================================
// 8. START SERVER AFTER DATABASE CONNECTION
// ==========================================

const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log('====================================');
            console.log('MedFinder Backend Started Successfully');
            console.log(`Port: ${PORT}`);
            console.log(`Health: /api/health`);
            console.log('MongoDB: Connected');
            console.log('====================================');
        });

    } catch (error) {
        console.error(
            'Failed to start MedFinder:',
            error.message
        );

        process.exit(1);
    }
};

// Start only when this file is executed directly.
// Export the Express app for testing or serverless adapters.
if (require.main === module) {
    startServer();
}

module.exports = app;


const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;

        // Check environment variable
        if (!mongoURI) {
            throw new Error('MONGO_URI is missing in server/.env');
        }

        // Connect to MongoDB Atlas
        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000
        });

        console.log('================================');
        console.log('MongoDB Connected Successfully');
        console.log('Host:', conn.connection.host);
        console.log('Database:', conn.connection.name);
        console.log('================================');

        return conn;

    } catch (error) {
        console.error('================================');
        console.error('MongoDB Connection Failed!');
        console.error('Reason:', error.message);
        console.error('================================');

        // Important: Pass error to server.js
        throw error;
    }
};

module.exports = connectDB;

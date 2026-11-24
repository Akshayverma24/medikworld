const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Connection Warning: ${error.message}`);
    console.warn('Backend is running. Make sure MongoDB Atlas connection string is provided in server/.env if not using local MongoDB.');
  }
};

module.exports = connectDB;

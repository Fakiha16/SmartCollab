// backend/src/config/db.js

const mongoose = require('mongoose');
require('dotenv').config(); // To access your environment variables

// Database connection function
const connectDB = async () => {
  try {
    // Connect to MongoDB using connection string from .env
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`); // This log confirms the connection

  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit the application in case of connection failure
  }
};

module.exports = connectDB;
// 1. Load the environment variables FIRST
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// 2. Assign the URI to a variable to check it
const uri = process.env.MONGO_URI;

if (!uri) {
    console.error("❌ Error: MONGO_URI is not defined in your .env file!");
    process.exit(1); // Stop the server if the URI is missing
}

// 3. Connect using the variable
mongoose.connect(uri)
    .then(() => console.log("✅ Successfully connected to MongoDB Atlas!"))
    .catch((err) => console.error("❌ Connection error:", err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
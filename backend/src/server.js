// backend/src/server.js

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Connect to DB
connectDB();

app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/auth.routes"); // Updated
app.use("/api/auth", authRoutes);

// Other routes can be added similarly
// e.g., app.use("/api/project", projectRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');
require("dotenv").config();
const app = express();


connectDB();

app.use(cors());
app.use(express.json());


const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5000;

app.get("/", (req,res)=>{
 res.send("SmartCollab API Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();

// ✅ Connect Database
connectDB();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Static folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);

const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);

const inviteRoutes = require("./routes/inviteRoutes");
app.use("/api/invite", inviteRoutes);

const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

// ❌ remove duplicate line (tumhare code me tha)
// app.use("/api/tasks", require("./routes/taskRoutes"));

// ================= SOCKET.IO =================

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {

  console.log("User connected");

  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
  });

  socket.on("sendMessage", async (data) => {

    const Message = require("./models/Message");

    const newMsg = new Message(data);
    await newMsg.save();

    io.to(data.projectId).emit("receiveMessage", newMsg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

});

// =============================================

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
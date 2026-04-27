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

const projectRoutes = require("./routes/projectRoutes");
app.use("/api/projects", projectRoutes);

// ================= SOCKET.IO =================

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

// In-memory store for online members per project
// { projectId: [ { email, name, socketId } ] }
const projectRooms = {};

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // ── Join Project Room ──────────────────────────────────
  // Frontend sends: { projectId, user: { email, name } }
  socket.on("joinProject", async (payload) => {

    // Handle both old format (string) and new format (object)
    let projectId, user;
    if (typeof payload === "string" || payload === null || payload === undefined) {
      projectId = payload;
      user = { email: "unknown" };
    } else {
      projectId = payload.projectId;
      user = payload.user || { email: "unknown" };
    }

    if (!projectId) {
      console.log("⚠️ joinProject called with no projectId, ignoring.");
      return;
    }

    socket.join(projectId);
    socket.projectId = projectId;
    socket.user = user || { email: "unknown" };

    // ── Update online members list ──
    if (!projectRooms[projectId]) projectRooms[projectId] = [];

    // Remove old entry for same email (reconnect case)
    projectRooms[projectId] = projectRooms[projectId].filter(
      (m) => m.email !== socket.user.email
    );
    projectRooms[projectId].push({ ...socket.user, socketId: socket.id });

    // ── Send previous messages from DB ──
    try {
      const Message = require("./models/Message");
      const previousMsgs = await Message.find({ projectId })
        .sort({ createdAt: 1 })
        .limit(100);
      socket.emit("previousMessages", previousMsgs);
    } catch (err) {
      console.error("Error loading messages:", err);
    }

    // ── Broadcast updated members list to everyone in room ──
    io.to(projectId).emit("projectMembers", projectRooms[projectId]);

    console.log(`📌 ${socket.user.email} joined project ${projectId}`);
  });

  // ── Send Message ───────────────────────────────────────
  socket.on("sendMessage", async (data) => {
    try {
      const Message = require("./models/Message");
      const newMsg = new Message(data);
      await newMsg.save();

      // Broadcast to ALL members in the project room
      io.to(data.projectId).emit("receiveMessage", newMsg);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // ── Typing Indicators ──────────────────────────────────
  socket.on("typing", ({ projectId, name, email }) => {
    // Send to everyone EXCEPT the typer
    socket.to(projectId).emit("userTyping", { name, email });
  });

  socket.on("stopTyping", ({ projectId, email }) => {
    socket.to(projectId).emit("userStoppedTyping", { email });
  });

  // ── File Broadcast ─────────────────────────────────────
  // When someone uploads a file, notify all other members
  socket.on("broadcastFile", ({ projectId, file }) => {
    socket.to(projectId).emit("fileUploaded", file);
  });

  // ── Disconnect ─────────────────────────────────────────
  socket.on("disconnect", () => {
    const { projectId, user } = socket;

    if (projectId && projectRooms[projectId]) {
      // Remove this socket from members list
      projectRooms[projectId] = projectRooms[projectId].filter(
        (m) => m.socketId !== socket.id
      );
      // Notify remaining members
      io.to(projectId).emit("projectMembers", projectRooms[projectId]);
    }

    console.log(`❌ ${user?.email || "User"} disconnected`);
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
  console.log(`🚀 Server running on port ${PORT}`);
});
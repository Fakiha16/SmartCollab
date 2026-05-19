const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// GET messages project-wise
router.get("/", async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.json([]);
    }

    const messages = await Message.find({
      projectId: String(projectId),
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({
      message: "Error fetching messages",
      error: err.message,
    });
  }
});

// CREATE message
router.post("/", async (req, res) => {
  try {
    const {
      text,
      sender,
      senderName,
      senderRole,
      receiverRole,
      type,
      time,
      projectId,
    } = req.body;

    if (!text || !sender || !projectId) {
      return res.status(400).json({
        message: "text, sender and projectId are required",
      });
    }

    const message = new Message({
      text: text.trim(),
      sender,
      senderName: senderName || sender,
      senderRole: senderRole || "",
      receiverRole: receiverRole || "",
      type: type || "client-manager",
      time: time || "",
      projectId: String(projectId),
    });

    await message.save();

    res.status(201).json(message);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({
      message: "Error sending message",
      error: err.message,
    });
  }
});

// DELETE single message
router.delete("/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Delete message error:", err);
    res.status(500).json({
      message: "Error deleting message",
      error: err.message,
    });
  }
});

// CLEAR project chat
router.delete("/", async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    await Message.deleteMany({ projectId: String(projectId) });

    res.json({ message: "Project chat cleared successfully" });
  } catch (err) {
    console.error("Clear messages error:", err);
    res.status(500).json({
      message: "Error clearing messages",
      error: err.message,
    });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// GET all messages
router.get("/", async (req, res) => {
  const messages = await Message.find().sort({ createdAt: 1 });
  res.json(messages);
});

// POST message
router.post("/", async (req, res) => {
  const msg = new Message(req.body);
  await msg.save();
  res.json(msg);
});

// DELETE single
router.delete("/:id", async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// DELETE all
router.delete("/", async (req, res) => {
  await Message.deleteMany({});
  res.json({ success: true });
});

module.exports = router;   // ✅ IMPORTANT
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// ✅ GET messages by type
router.get("/", async (req, res) => {
  const { type } = req.query;

  const messages = await Message.find({ type }).sort({ createdAt: 1 });

  res.json(messages);
});

// ✅ SEND message
router.post("/", async (req, res) => {
  const newMsg = new Message(req.body);
  await newMsg.save();
  res.json(newMsg);
});

// delete single
router.delete("/:id", async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// clear all (by type)
router.delete("/", async (req, res) => {
  const { type } = req.query;
  await Message.deleteMany({ type });
  res.json({ success: true });
});

module.exports = router;
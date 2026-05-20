const StatusUpdate = require("../models/StatusUpdate");

exports.createStatusUpdate = async (req, res) => {
  try {
    const update = new StatusUpdate(req.body);
    await update.save();
    res.status(201).json({ message: "Status updated successfully", update });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save status update" });
  }
};

exports.getStatusUpdates = async (req, res) => {
  try {
    const { projectId } = req.query;
    const updates = await StatusUpdate.find({ projectId }).sort({ createdAt: -1 });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch status updates" });
  }
};
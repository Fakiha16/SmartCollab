const StatusUpdate = require("../models/StatusUpdate");

exports.createStatusUpdate = async (req, res) => {
  try {
    const {
      projectId,
      manager,
      managerEmail,
      date,
      frontendProgress,
      backendProgress,
      workDone,
      currentErrors,
      nextWork,
      demoLink,
    } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    const update = new StatusUpdate({
      projectId,
      manager: manager || "",
      managerEmail: managerEmail || "",
      date: date || "",
      frontendProgress: frontendProgress || "",
      backendProgress: backendProgress || "",
      workDone: workDone || "",
      currentErrors: currentErrors || "",
      nextWork: nextWork || "",
      demoLink: demoLink || "",
    });

    await update.save();

    res.status(201).json({
      message: "Status updated successfully",
      update,
    });
  } catch (err) {
    console.error("Create status update error:", err);
    res.status(500).json({
      error: "Failed to save status update",
      details: err.message,
    });
  }
};

exports.getStatusUpdates = async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    const updates = await StatusUpdate.find({ projectId }).sort({
      createdAt: -1,
    });

    res.json(updates);
  } catch (err) {
    console.error("Fetch status updates error:", err);
    res.status(500).json({
      error: "Failed to fetch status updates",
      details: err.message,
    });
  }
};
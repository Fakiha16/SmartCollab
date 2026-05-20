const mongoose = require("mongoose");

const statusUpdateSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  manager: String,
  managerEmail: String,
  date: String,
  frontendProgress: String,
  backendProgress: String,
  workDone: String,
  currentErrors: String,
  nextWork: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("StatusUpdate", statusUpdateSchema);
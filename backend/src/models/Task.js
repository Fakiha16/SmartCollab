const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  desc: String,
  status: String,
  projectId: String,
  assignedTo: String,

  // ✅ ADD THESE (IMPORTANT)
  taskType: String,
  taskStartDate: String,
  taskEndDate: String,
});

module.exports = mongoose.model("Task", taskSchema);
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  desc: String,
  status: {
    type: String,
    enum: ["backlog", "inprogress", "review", "completed"],
    default: "backlog",
  },
  projectId: String,
  assignedTo: String,
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
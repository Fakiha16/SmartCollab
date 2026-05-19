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


  assignedByEmail: {
  type: String,
  default: "",
},

assignedByName: {
  type: String,
  default: "",
},

managerEmail: {
  type: String,
  default: "",
},

managerName: {
  type: String,
  default: "",
},
});

module.exports = mongoose.model("Task", taskSchema);
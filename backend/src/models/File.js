const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  name: String,
  uploadedBy: String,
  projectId: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("File", fileSchema);
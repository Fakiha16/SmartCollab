const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc:  { type: String, default: "" },
  status: { type: String, default: "Active" },
  managerId: { type: String, default: "" },
  team: {
    Frontend: [String],
    Backend:  [String],
    QA:       [String],
    Designer: [String],
  },
  date: { type: String, default: () => new Date().toDateString() },
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);
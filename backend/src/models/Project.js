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

  // ✅ Performance fields (manager updates these)
  performance: {
    frontend: {
      status: { type: String, default: "Not Started" }, // "In Progress", "Completed", "Not Started"
      progress: { type: Number, default: 0 },           // 0-100
    },
    backend: {
      status: { type: String, default: "Not Started" },
      progress: { type: Number, default: 0 },
    },
    testing: {
      status: { type: String, default: "Not Started" },
      progress: { type: Number, default: 0 },
    },
    deadline: { type: String, default: "" },
    demoLink: { type: String, default: "" },
    chartData: {
      achieved: { type: [Number], default: [2, 3, 3.5, 4, 5, 6, 7, 8] },
      target:   { type: [Number], default: [1, 2, 2.5, 3, 4, 5, 6, 7] },
    },
  },
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);
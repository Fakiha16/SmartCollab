const mongoose = require("mongoose");

const statusUpdateSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    manager: {
      type: String,
      default: "",
    },

    managerEmail: {
      type: String,
      default: "",
    },

    date: {
      type: String,
      default: "",
    },

    frontendProgress: {
      type: String,
      default: "",
    },

    backendProgress: {
      type: String,
      default: "",
    },

    workDone: {
      type: String,
      default: "",
    },

    currentErrors: {
      type: String,
      default: "",
    },

    nextWork: {
      type: String,
      default: "",
    },

    demoLink: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StatusUpdate", statusUpdateSchema);
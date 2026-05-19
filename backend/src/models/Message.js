const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },

    sender: {
      type: String,
      required: true,
    },

    senderName: {
      type: String,
      default: "",
    },

    senderRole: {
      type: String,
      default: "",
    },

    receiverRole: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      default: "client-manager",
    },

    time: {
      type: String,
      default: "",
    },

    projectId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
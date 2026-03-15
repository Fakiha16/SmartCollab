const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  message: {
    type: String,
    required: true
  },

  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  }

}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
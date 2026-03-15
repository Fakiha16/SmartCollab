const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ["admin", "employee", "client"]
  }
});

module.exports = mongoose.model("Role", roleSchema);
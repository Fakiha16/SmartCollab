const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    team: String,
    empType: {
  type: String,
  default: "",
},

    // ✅ YE ADD KIYA — employee ka assigned projectId
    projectId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
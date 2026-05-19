const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    team: String,
    empType: String,
    phone: String, // added phone field

    // ✅ YE ADD KIYA — employee ka assigned projectId
    projectIds: {
      type: [String],
      default: [],
    }, 
    
    isMember: {
  type: Boolean,
  default: true,
}, 
    projectId: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
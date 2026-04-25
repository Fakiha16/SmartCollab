const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  team: String, // 🔥 important for your case
});

module.exports = mongoose.model("User", userSchema);
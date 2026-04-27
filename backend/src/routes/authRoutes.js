const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/authController");
const User = require("../models/User");

router.post("/signup", signup);
router.post("/login", login);

// ✅ NEW ROUTE — employee ka projectId fetch karo email se
// Dashboard.js isko call karega agar localStorage mein projectId na ho
router.get("/user/project", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ projectId: user.projectId || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
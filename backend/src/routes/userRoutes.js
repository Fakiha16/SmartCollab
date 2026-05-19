// router.get("/employees/:team", async (req, res) => {
//   try {
//     const users = await User.find({
//       role: "employee",
//       team: req.params.team,
//     });

//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching employees" });
//   }
// });
const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/employees/:team", async (req, res) => {
  try {
    const users = await User.find({
      role: "employee",
      team: req.params.team,
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching employees" });
  }
});

// Update user profile
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      empType: user.empType,
      projectId: user.projectId
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ message: "Error updating user profile" });
  }
});

module.exports = router;
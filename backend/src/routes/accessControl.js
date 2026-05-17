const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Project = require("../models/Project");

// Access already present  Projects

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add new member to project

router.post("/add", async (req, res) => {
  try {
    const { email, name, projectId, team } = req.body;
    const user = new User({ email, name, projectId, team });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete member from project

router.delete("/delete", async (req, res) => {      
    try {
        const { email, projectId } = req.body;
        await User.findOneAndDelete({ email, projectId });
        res.json({ message: "Member deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;    
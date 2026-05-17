const express = require("express");
const router  = express.Router();
const Project = require("../models/Project");
const User = require("../models/User");

// ── GET all projects ──────────────────────────────
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
// ── GET single project by ID (With Members) ─────────────────
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    // 1. Import or use your User model to find members assigned to this project
    // Note: Make sure you require your User model at the top of this file if you haven't! 
    const members = await User.find({ projectId: req.params.id });
    // 2. Extract just the emails into a simple list
    const memberEmails = members.map(user => user.email);
    // 3. Fake the "team" object structure your React frontend is looking for
    const projectData = {
      ...project.toObject(),
      team: {
       allMembers: memberEmails
      }
   };
    res.json(projectData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── CREATE project ────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { title, desc, managerId, team } = req.body;
    const project = new Project({ title, desc, managerId, team });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── UPDATE project ────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, desc: req.body.desc },
      { new: true }
    );
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── DELETE project ────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
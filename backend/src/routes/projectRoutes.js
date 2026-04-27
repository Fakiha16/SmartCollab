const express = require("express");
const router  = express.Router();
const Project = require("../models/Project");

// ── GET all projects ──────────────────────────────
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
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
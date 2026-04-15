const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// GET ALL TASKS
router.get("/", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// CREATE TASK (Manager)
router.post("/", async (req, res) => {
  const task = await Task.create(req.body);
  res.json(task);
});

// UPDATE TASK STATUS (Employee)
router.put("/:id", async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(task);
});

module.exports = router;
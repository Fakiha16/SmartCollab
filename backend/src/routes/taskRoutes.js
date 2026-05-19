const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");


// ✅ GET ALL TASKS (FIX ADDED)
// ✅ GET project performance stats
// IMPORTANT: ye route generic routes se pehle rehna chahiye
router.get("/performance/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await Task.find({ projectId });

    const completed = tasks.filter((task) => {
      const status = (task.status || "").toLowerCase();
      return status === "completed";
    }).length;

    const pending = tasks.filter((task) => {
      const status = (task.status || "").toLowerCase();
      return (
        status === "backlog" ||
        status === "inprogress" ||
        status === "in progress" ||
        status === "review"
      );
    }).length;

    const errors = tasks.filter((task) => {
      const status = (task.status || "").toLowerCase();
      const taskType = (task.taskType || "").toLowerCase();

      return (
        status === "error" ||
        status === "errors" ||
        taskType === "error" ||
        taskType === "bug"
      );
    }).length;

    res.json({
      projectId,
      completed,
      pending,
      errors,
      total: tasks.length,
    });
  } catch (err) {
    console.error("Performance stats error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// ✅ GET ALL TASKS
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// ✅ CREATE TASK MANAGER ONLY
router.post("/", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Error creating task" });
  }
});

// ✅ GET MY TASKS
router.get("/my-tasks/:email", async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.params.email,
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// ✅ UPDATE TASK STATUS
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Error updating task" });
  }
});

// ✅ DELETE TASK
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting task" });
  }
});

router.get("/assigned/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const tasks = await Task.find({
      $or: [
        { assignedTo: email },
        { assigneeEmail: email },
        { employeeEmail: email },
        { assignedToEmail: email },
        { "assignedTo.email": email },
        { assignedEmail: email },
      ],
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error("Assigned tasks fetch error:", err);
    res.status(500).json({ message: "Error fetching assigned tasks" });
  }
});


// GET assigned tasks by employee email
router.get("/assigned/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);

    const user = await User.findOne({ email });

    const userId = user?._id?.toString();
    const userName = user?.name;
    const empType = user?.empType;

    const tasks = await Task.find({
      $or: [
        { assignedTo: email },
        { assigneeEmail: email },
        { employeeEmail: email },
        { assignedToEmail: email },
        { assignedEmail: email },

        { "assignedTo.email": email },
        { "assignee.email": email },
        { "employee.email": email },

        { assignedTo: userId },
        { assignee: userId },
        { employee: userId },

        { "assignedTo._id": userId },
        { "assignee._id": userId },
        { "employee._id": userId },

        { assignedTo: userName },
        { assignee: userName },
        { employee: userName },

        { assignedTo: empType },
        { assignee: empType },
        { employeeRole: empType },
        { empType: empType },
      ],
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error("Assigned tasks fetch error:", err);
    res.status(500).json({ message: "Error fetching assigned tasks" });
  }
});

module.exports = router;
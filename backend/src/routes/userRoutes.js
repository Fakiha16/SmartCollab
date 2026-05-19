const express = require("express");
const router = express.Router();
const User = require("../models/User");

const Task = require("../models/Task");
const Project = require("../models/Project");

// GET employees by team
router.get("/employees/:team", async (req, res) => {
  try {
    const team = decodeURIComponent(req.params.team).trim();

    const users = await User.find({
      team: { $regex: `^${team}$`, $options: "i" },
    }).select("-password");

    res.json(users);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ message: "Error fetching employees" });
  }
});

// GET logged user/profile by email
router.get("/profile/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);

    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE profile
router.put("/profile/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const { name, empType, team, isMember, avatar } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        name,
        empType,
        team,
        isMember,
        avatar,
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// GET managers worked with by employee email
router.get("/worked-with-managers/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);

    const employee = await User.findOne({ email }).select("-password");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const employeeId = employee._id.toString();

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
        { assignedTo: employeeId },
        { assignee: employeeId },
        { employee: employeeId },
      ],
    });

    const managerIds = new Set();
    const managerEmails = new Set();

    tasks.forEach((task) => {
      if (task.createdBy) managerIds.add(task.createdBy.toString());
      if (task.assignedBy) managerIds.add(task.assignedBy.toString());
      if (task.managerId) managerIds.add(task.managerId.toString());
      if (task.projectManager) managerIds.add(task.projectManager.toString());

      if (task.createdByEmail) managerEmails.add(task.createdByEmail);
      if (task.assignedByEmail) managerEmails.add(task.assignedByEmail);
      if (task.managerEmail) managerEmails.add(task.managerEmail);
    });

    const projectIds = tasks
      .map((task) => task.projectId || task.project)
      .filter(Boolean);

    if (projectIds.length > 0) {
      const projects = await Project.find({ _id: { $in: projectIds } });

      projects.forEach((project) => {
        if (project.createdBy) managerIds.add(project.createdBy.toString());
        if (project.managerId) managerIds.add(project.managerId.toString());
        if (project.projectManager) managerIds.add(project.projectManager.toString());
        if (project.adminId) managerIds.add(project.adminId.toString());

        if (project.createdByEmail) managerEmails.add(project.createdByEmail);
        if (project.managerEmail) managerEmails.add(project.managerEmail);
        if (project.adminEmail) managerEmails.add(project.adminEmail);
      });
    }

    const managers = await User.find({
      $or: [
        { _id: { $in: Array.from(managerIds) } },
        { email: { $in: Array.from(managerEmails) } },
        { role: { $in: ["manager", "admin", "projectManager"] } },
      ],
    }).select("-password");

    res.json(managers);
  } catch (err) {
    console.error("Worked with managers fetch error:", err);
    res.status(500).json({ message: "Error fetching worked with managers" });
  }
});
module.exports = router;
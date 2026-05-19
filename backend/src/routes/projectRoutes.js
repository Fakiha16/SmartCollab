const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const User = require("../models/User");



// ── TEMP FIX: Update old managerId to manager email ─────────────────
// ── TEMP FIX: Mark pending invite as joined ─────────────────
router.put("/mark-invite-joined", async (req, res) => {
  try {
    const { projectId, email } = req.body;

    if (!projectId || !email) {
      return res.status(400).json({
        message: "projectId and email are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const invitedMembers = project.invitedMembers || [];

    const inviteIndex = invitedMembers.findIndex(
      (member) => member.email?.trim().toLowerCase() === cleanEmail
    );

    if (inviteIndex === -1) {
      return res.status(404).json({
        message: "Invite not found for this email",
        email: cleanEmail,
        invitedMembers,
      });
    }

    project.invitedMembers[inviteIndex].status = "Joined";
    await project.save();

const updatedUser = await User.findOneAndUpdate(
  { email: cleanEmail },
  {
    $set: { projectId },
    $addToSet: { projectIds: projectId },
  },
  { new: true }
);

    res.json({
      message: "Invite marked as joined and user projectId updated",
      updatedUser,
      invitedMembers: project.invitedMembers,
    });
  } catch (err) {
    console.error("Mark invite joined error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});


// ── DELETE member from project ─────────────────────
router.delete("/:projectId/member", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    if (!projectId || !email) {
      return res.status(400).json({
        message: "projectId and email are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    await Project.findByIdAndUpdate(projectId, {
      $pull: {
        invitedMembers: {
          email: cleanEmail,
        },
      },
    });

const user = await User.findOne({ email: cleanEmail });

if (user) {
  user.projectIds = (user.projectIds || []).filter((id) => id !== projectId);

  if (user.projectId === projectId) {
    user.projectId = user.projectIds[0] || "";
  }

  await user.save();
}

    res.json({
      message: "Member removed successfully",
      email: cleanEmail,
    });
  } catch (err) {
    console.error("Delete member error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});



// ── JOIN project / mark invite as joined ─────────────────────
router.post("/join-project", async (req, res) => {
  try {
    const { projectId, email } = req.body;

    if (!projectId || !email) {
      return res.status(400).json({
        message: "projectId and email are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const inviteIndex = (project.invitedMembers || []).findIndex(
      (member) => member.email?.trim().toLowerCase() === cleanEmail
    );

    if (inviteIndex !== -1) {
      project.invitedMembers[inviteIndex].status = "Joined";
      await project.save();
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: cleanEmail },
      {
        $set: { projectId },
        $addToSet: { projectIds: projectId },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Project joined successfully",
      user: updatedUser,
      invitedMembers: project.invitedMembers,
    });
  } catch (err) {
    console.error("Join project error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});


// ── TEMP FIX: Migrate old user projectId into projectIds ─────────────────
router.put("/migrate-user-projects", async (req, res) => {
  try {
    const users = await User.find({
      projectId: { $exists: true, $ne: "" },
    });

    let updatedCount = 0;

    for (const user of users) {
      if (!Array.isArray(user.projectIds)) {
        user.projectIds = [];
      }

      if (user.projectId && !user.projectIds.includes(user.projectId)) {
        user.projectIds.push(user.projectId);
        await user.save();
        updatedCount++;
      }
    }

    res.json({
      message: "User project migration completed",
      totalUsersChecked: users.length,
      updatedCount,
    });
  } catch (err) {
    console.error("Migration error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// ── GET project performance ─────────────────────────────
router.get("/:projectId/performance", async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json({
      projectId: project._id,
      title: project.title,
      status: project.status,
      performance: project.performance,
    });
  } catch (err) {
    console.error("Fetch performance error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// ── UPDATE project performance ──────────────────────────
router.put("/:projectId/performance", async (req, res) => {
  try {
    const { projectId } = req.params;

    const {
      frontend,
      backend,
      testing,
      deadline,
      demoLink,
      chartData,
    } = req.body;

    const updateData = {};

    if (frontend) updateData["performance.frontend"] = frontend;
    if (backend) updateData["performance.backend"] = backend;
    if (testing) updateData["performance.testing"] = testing;
    if (deadline !== undefined) updateData["performance.deadline"] = deadline;
    if (demoLink !== undefined) updateData["performance.demoLink"] = demoLink;
    if (chartData) updateData["performance.chartData"] = chartData;

    const project = await Project.findByIdAndUpdate(
      projectId,
      { $set: updateData },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json({
      message: "Performance updated successfully",
      projectId: project._id,
      performance: project.performance,
    });
  } catch (err) {
    console.error("Update performance error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});


// ── GET projects by manager ──────────────────────────────
// IMPORTANT: ye route "/:id" se pehle hona chahiye
router.get("/manager/:managerId", async (req, res) => {
  try {
    const { managerId } = req.params;

    const projects = await Project.find({ managerId }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error("Fetch manager projects error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET all projects ──────────────────────────────
// Is route ko manager panel mein use na karo
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error("Fetch all projects error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET single project by ID with joined members + pending invites ─────────────
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

const members = await User.find({
  $or: [
    { projectId: req.params.id },
    { projectIds: req.params.id },
  ],
});
    const joinedMembers = members.map((user) => ({
      _id: user._id,
      name: user.name || user.fullName || "Team Member",
      email: user.email,
      role: user.role || "Employee",
      empType: user.empType || "",
      status: "Joined",
    }));

    const joinedEmails = joinedMembers.map((member) =>
      member.email?.trim().toLowerCase()
    );

    const pendingInvites = (project.invitedMembers || [])
      .filter((member) => {
        const inviteEmail = member.email?.trim().toLowerCase();

        return (
          member.status === "Pending" &&
          inviteEmail &&
          !joinedEmails.includes(inviteEmail)
        );
      })
      .map((member) => ({
        email: member.email,
        status: member.status || "Pending",
        invitedAt: member.invitedAt,
      }));

    const projectData = {
      ...project.toObject(),

      joinedMembers,
      pendingInvites,

      team: {
        ...project.team,
        allMembers: joinedMembers.map((member) => member.email),
      },
    };

    res.json(projectData);
  } catch (err) {
    console.error("Fetch single project error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── CREATE project ────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { title, desc, managerId, team } = req.body;

    if (!title || !managerId) {
      return res.status(400).json({
        message: "Title and managerId are required",
      });
    }

    const project = new Project({
      title,
      desc,
      managerId,
      team,
    });

    await project.save();

    res.status(201).json(project);
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── UPDATE project ────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        desc: req.body.desc,
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    console.error("Update project error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── DELETE project ────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete project error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
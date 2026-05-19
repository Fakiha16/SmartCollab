const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Project = require("../models/Project");

router.post("/", async (req, res) => {
  console.log("Invite API hit");

  const { email, projectId, managerName } = req.body;

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  if (!projectId) {
    return res.status(400).json({ error: "projectId is required" });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        error: "Project not found. Invalid projectId.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bismaumar001@gmail.com",
        pass: "neeu kefk bhat nprd",
      },
    });

    const mailOptions = {
      from: `"${managerName || "Project Manager"} via SmartCollab" <bismaumar001@gmail.com>`,
      to: cleanEmail,
      subject: "SmartCollab Invitation 🚀",
      html: `
        <h2>You are invited to SmartCollab 🚀</h2>
        <p><b>${managerName || "Project Manager"}</b> invited you to join a project on SmartCollab.</p>
        <p>Click below to join the project:</p>
        <a href="http://localhost:5173/signup?projectId=${projectId}"
           style="background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
          Join Project
        </a>
      `,
    };

    await transporter.sendMail(mailOptions);

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        $addToSet: {
          invitedMembers: {
            email: cleanEmail,
            status: "Pending",
          },
        },
      },
      { new: true }
    );

    console.log("Invite saved in project:", updatedProject.invitedMembers);

    res.status(200).json({
      message: "Invitation sent and saved as pending",
      invitedMembers: updatedProject.invitedMembers,
    });
  } catch (error) {
    console.log("Invite error ❌", error);
    res.status(500).json({
      error: "Invitation failed",
      details: error.message,
    });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Project = require("../models/Project");

router.post("/", async (req, res) => {
  console.log("Invite API hit");

  const {
    email,
    projectId,
    managerName,
    inviterName,
    invitedBy,
    inviteRole,
    role,
    name,
  } = req.body;

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

    /*
      inviteRole:
      - client panel se inviteRole: "client" aayega
      - access control/team member invite se role: "Frontend/Backend/QA/Designer" aa sakta hai
      - signupRole decides actual account role
    */
    const signupRole = inviteRole === "client" ? "client" : "employee";
    const displayRole = inviteRole === "client" ? "client" : role || "employee";

    const senderName =
      managerName || inviterName || invitedBy || "Project Manager";

    const joinLink = `http://localhost:5173/signup?projectId=${projectId}&role=${signupRole}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "bismaumar001@gmail.com",
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${senderName} via SmartCollab" <${
        process.env.EMAIL_USER || "bismaumar001@gmail.com"
      }>`,
      to: cleanEmail,
      subject: "SmartCollab Invitation 🚀",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>You are invited to SmartCollab 🚀</h2>

          <p>
            <b>${senderName}</b> invited you to join a project on SmartCollab as 
            <b>${signupRole}</b>.
          </p>

          <p>Click below to join the project:</p>

          <a href="${joinLink}"
             style="background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Join Project
          </a>

          <p style="margin-top:20px;color:#555;font-size:13px;">
            If the button does not work, copy and paste this link in your browser:<br/>
            ${joinLink}
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    await Project.findByIdAndUpdate(projectId, {
      $pull: {
        invitedMembers: {
          email: cleanEmail,
        },
      },
    });

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        $push: {
          invitedMembers: {
            email: cleanEmail,
            name: name || "",
            role: displayRole,
            inviteRole: signupRole,
            status: "Pending",
            invitedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    console.log("Invite saved in project:", updatedProject.invitedMembers);

    res.status(200).json({
      message: "Invitation sent and saved as pending",
      email: cleanEmail,
      projectId,
      inviteRole: signupRole,
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
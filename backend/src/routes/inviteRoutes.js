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
    inviteType,
    userType,
    role,
    name,
    empType,
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
      Invite role handling:

      Manager panel "Create Team":
      frontend sends:
      role: "employee"
      inviteType: "employee"
      userType: "employee"

      Client invite:
      frontend should send:
      role: "client"
      inviteRole: "client"
      inviteType: "client"

      Agar kuch bhi na aaye, default client rakha hai
      taake existing ClientPanel flow break na ho.
    */

    const normalizedInviteRole = String(inviteRole || "")
      .trim()
      .toLowerCase();

    const normalizedInviteType = String(inviteType || "")
      .trim()
      .toLowerCase();

    const normalizedUserType = String(userType || "")
      .trim()
      .toLowerCase();

    const normalizedRole = String(role || "")
      .trim();

    const normalizedRoleLower = normalizedRole.toLowerCase();

    const teamRoles = [
      "frontend",
      "backend",
      "qa",
      "designer",
      "testing",
      "development",
      "developer",
      "tester",
      "employee",
    ];

    const isClientInvite =
      normalizedInviteRole === "client" ||
      normalizedInviteType === "client" ||
      normalizedUserType === "client" ||
      normalizedRoleLower === "client";

    const isEmployeeInvite =
      normalizedInviteRole === "employee" ||
      normalizedInviteType === "employee" ||
      normalizedUserType === "employee" ||
      teamRoles.includes(normalizedRoleLower);

    let signupRole = "client";

    if (isEmployeeInvite && !isClientInvite) {
      signupRole = "employee";
    }

    if (isClientInvite) {
      signupRole = "client";
    }

    const displayRole =
      signupRole === "employee"
        ? normalizedRole && normalizedRoleLower !== "employee"
          ? normalizedRole
          : empType || "employee"
        : "client";

    const senderName =
      managerName || inviterName || invitedBy || "Project Manager";

    const joinLink = `http://localhost:5173/signup?projectId=${projectId}&role=${signupRole}&inviteType=${signupRole}`;

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
      subject:
        signupRole === "employee"
          ? "SmartCollab Team Invitation 🚀"
          : "SmartCollab Client Invitation 🚀",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>You are invited to SmartCollab 🚀</h2>

          <p>
            <b>${senderName}</b> invited you to join a project on SmartCollab as 
            <b>${signupRole}</b>.
          </p>

          <p>Project: <b>${project.title || project.name || "SmartCollab Project"}</b></p>

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
      role: displayRole,
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
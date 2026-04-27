const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {

  console.log("Invite API hit");
  const { email, projectId } = req.body; // ✅ projectId bhi lo

  if (!projectId) {
    return res.status(400).json({ error: "projectId is required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bismaumar001@gmail.com",
        pass: "neeu kefk bhat nprd",
      },
    });

    const mailOptions = {
      from: "bismaumar001@gmail.com",
      to: email,
      subject: "SmartCollab Invitation 🚀",
      html: `
        <h2>You are invited to SmartCollab 🚀</h2>
        <p>Click below to join the project:</p>
        <a href="http://localhost:5173/signup?projectId=${projectId}" 
           style="background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Join Project
        </a>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent ✅ with projectId:", projectId);
    res.status(200).json({ message: "Email sent" });

  } catch (error) {
    console.log("Email error ❌", error);
    res.status(500).json({ error: "Email failed" });
  }
});

module.exports = router;
const Project = require("../models/Project");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const addProjectToUser = async (user, projectId) => {
  if (!projectId) return user;

  user.projectId = projectId;

  if (!Array.isArray(user.projectIds)) {
    user.projectIds = [];
  }

  if (!user.projectIds.includes(projectId)) {
    user.projectIds.push(projectId);
  }

  await user.save();
  return user;
};


const markInviteAsJoined = async (projectId, email) => {
  if (!projectId || !email) return;

  const cleanEmail = email.trim().toLowerCase();

  const updatedProject = await Project.findOneAndUpdate(
    {
      _id: projectId,
      "invitedMembers.email": cleanEmail,
    },
    {
      $set: {
        "invitedMembers.$.status": "Joined",
      },
    },
    { new: true }
  );

  console.log("Invite joined update result:", {
    projectId,
    email: cleanEmail,
    updated: !!updatedProject,
  });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, empType, projectId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      if (projectId) {
        existingUser.projectId = projectId;
        await existingUser.save();
        await markInviteAsJoined(projectId, cleanEmail);
      }

      return res.status(400).json({
        message: "Email already registered. Please login to continue.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role,
      empType: empType || "",
      projectId: projectId || "",
      projectIds: projectId ? [projectId] : [],

    });

    await user.save();

    if (projectId) {
      await markInviteAsJoined(projectId, cleanEmail);
    }

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        empType: user.empType,
        projectId: user.projectId || null,
        projectIds: user.projectIds || [],

      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      message: "Signup failed",
      error: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, projectId } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        message: "Account not found. Please signup first",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const finalProjectId = projectId || user.projectId || "";

    if (finalProjectId) {
      user.projectId = finalProjectId;
      await user.save();

      await markInviteAsJoined(finalProjectId, cleanEmail);
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        empType: user.empType,
        projectId: user.projectId || null,
        projectIds: user.projectIds || [],

      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      message: "Login failed",
      error: err.message,
    });
  }
};
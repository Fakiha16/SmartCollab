const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const File = require("../models/File");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// upload file
router.post("/", upload.single("file"), async (req, res) => {

  const newFile = new File({
    name: req.file.filename,
    uploadedBy: req.body.email,
    projectId: req.body.projectId
  });

  await newFile.save();
  res.json(newFile);
});

// get files
router.get("/:projectId", async (req, res) => {
  const files = await File.find({ projectId: req.params.projectId });
  res.json(files);
});

router.delete("/:filename", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../uploads", req.params.filename);

    // 1️⃣ delete from disk
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log(err);
      }
    });

    // 2️⃣ delete from DB (🔥 IMPORTANT)
    await File.deleteOne({ name: req.params.filename });

    res.json({ message: "File deleted successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

const fs = require("fs");
const path = require("path");



module.exports = router;
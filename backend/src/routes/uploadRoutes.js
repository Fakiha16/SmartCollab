const express = require("express");
const router = express.Router();
const multer = require("multer");

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

module.exports = router;
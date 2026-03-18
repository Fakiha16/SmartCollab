const express = require("express");
const router = express.Router(); // ✅ YE MISSING THA

const multer = require("multer");
const File = require("../models/File");
const fs = require("fs");
const path = require("path");

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ✅ Upload file
router.post("/", upload.single("file"), async (req, res) => {
  try {

    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    const savedFile = await File.create({
      url: fileUrl,
      uploadedBy: req.body.user || "unknown"
    });

    res.json(savedFile);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get all files
router.get("/", async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Delete file (DB + folder)
router.delete("/:id", async (req, res) => {
  try {

    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const fileName = file.url.split("/uploads/")[1];

    const filePath = path.join(process.cwd(), "uploads", fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await File.findByIdAndDelete(req.params.id);

    res.json({ message: "File deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
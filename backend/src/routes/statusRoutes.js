const express = require("express");
const router = express.Router();
const { createStatusUpdate, getStatusUpdates } = require("../controllers/statusController");

router.post("/update-status", createStatusUpdate);
router.get("/update-status", getStatusUpdates);

module.exports = router;
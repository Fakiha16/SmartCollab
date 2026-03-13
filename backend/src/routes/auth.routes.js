// backend/src/routes/auth.routes.js

const express = require('express');
const router = express.Router();

const { signup, login } = require('../middleware/auth');

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
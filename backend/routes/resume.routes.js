const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const resumeController = require("../controllers/resume.controller");

router.post("/improve", authMiddleware, resumeController.improveResume);

module.exports = router;

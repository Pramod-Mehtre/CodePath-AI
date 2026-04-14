const express = require("express");
const router = express.Router();
const skillController = require("../controllers/skill.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.get("/analysis", skillController.getSkillsAnalysis);

module.exports = router;

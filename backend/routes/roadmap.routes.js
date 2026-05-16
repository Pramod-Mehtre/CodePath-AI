const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const roadmapController = require("../controllers/roadmap.controller");

router.post("/generate", authMiddleware, roadmapController.generateRoadmap);

module.exports = router;

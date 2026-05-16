const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const mockInterviewController = require("../controllers/mockInterview.controller");

router.post("/generate-questions", authMiddleware, mockInterviewController.generateQuestions);

module.exports = router;

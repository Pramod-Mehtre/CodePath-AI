const express = require("express");
const router = express.Router();
const jdController = require("../controllers/jd.controller");
const authMiddleware = require("../middleware/auth.middleware");
const multer = require("multer");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(authMiddleware);

// Endpoint taking form-data with "resume" file and "jobDescription" text
router.post("/analyze", upload.single("resume"), jdController.analyzeJD);

module.exports = router;

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const analyticsController = require("../controllers/analytics.controller");

router.get("/insights", authMiddleware, analyticsController.getInsights);

module.exports = router;

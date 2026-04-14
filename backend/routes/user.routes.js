const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.put("/goal", userController.setDailyGoal);
router.get("/streak", userController.getStreakInfo);

module.exports = router;

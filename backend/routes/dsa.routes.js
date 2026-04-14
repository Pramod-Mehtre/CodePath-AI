const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const {
  addProblem,
  getProblems,
  deleteProblem,
  updateProblem,
} = require("../controllers/dsa.controller");

// 🔒 PROTECTED ROUTES
router.post("/add", auth, addProblem);
router.get("/", auth, getProblems);
router.put("/:id", auth, updateProblem);
router.delete("/:id", auth, deleteProblem);

module.exports = router;
const express = require("express");
const router = express.Router();
const {
  getCompanies,
  getCompanyProblems
} = require("../controllers/companyProblem.controller");

// Auth middleware if needed, but the prompt didn't specify. We can leave it open or add it.
// Assuming company data is public or we should protect it as per PrepTracker norms.
const { protect } = require("../middleware/auth.middleware");

// Routes
router.route("/companies").get(protect, getCompanies);
router.route("/:company").get(protect, getCompanyProblems);

module.exports = router;

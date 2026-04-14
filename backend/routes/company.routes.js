const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

// Must be before /:company
router.get("/companies", companyController.getCompanies);

router.get("/:company", companyController.getCompanyProblems);
router.post("/solve", companyController.solveProblem);
router.get("/progress/:company", companyController.getProgress);

module.exports = router;

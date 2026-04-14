const SolvedCompanyProblem = require("../models/solvedCompanyProblem.model");
const Problem = require("../models/problem.model");
const CompanyProblem = require("../models/companyProblem.model");
const AppError = require("../utils/AppError");
const { updateStreak } = require("./dsa.controller");

exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await CompanyProblem.distinct("company");
    res.status(200).json({
      success: true,
      data: companies.sort()
    });
  } catch (error) {
    next(error);
  }
};

exports.getCompanyProblems = async (req, res, next) => {
  try {
    // We match cases case-insensitively
    const companyName = req.params.company;
    const companyData = await CompanyProblem.find({ company: { $regex: new RegExp(`^${companyName}$`, "i") } });

    if (!companyData || companyData.length === 0) {
      return next(new AppError("Company not found", 404));
    }

    // Since they all have the exact same company string from DB, we pick it from the first one
    const exactCompany = companyData[0].company;

    const solvedRecords = await SolvedCompanyProblem.find({ userId: req.user.id, company: exactCompany });
    // Use the `_id` of the problem stringified
    const solvedIds = new Set(solvedRecords.map(s => s.problemId));

    const problemsWithStatus = companyData.map(p => {
      const pObj = p.toObject();
      return {
        ...pObj,
        id: pObj._id.toString(),
        solved: solvedIds.has(pObj._id.toString())
      };
    });

    res.status(200).json({
      success: true,
      data: problemsWithStatus
    });
  } catch (error) {
    next(error);
  }
};

exports.solveProblem = async (req, res, next) => {
  try {
    const { problemId, company } = req.body;
    const userId = req.user.id;

    if (!problemId || !company) {
      return next(new AppError("Missing required fields", 400));
    }

    const problemData = await CompanyProblem.findById(problemId);
    if (!problemData) return next(new AppError("Problem not found in dataset", 404));

    // Check duplicate
    const existing = await SolvedCompanyProblem.findOne({ userId, problemId, company: problemData.company });
    if (existing) {
      return next(new AppError("Already solved", 400));
    }

    // Insert isolated track record
    await SolvedCompanyProblem.create({ userId, problemId, company: problemData.company });

    // Ensure it feeds natively into general dashboard / skills analyzer implicitly!
    const existingGeneral = await Problem.findOne({ userId, title: problemData.title });
    if (!existingGeneral) {
      await Problem.create({
        userId,
        title: problemData.title,
        topic: problemData.topic,
        difficulty: problemData.difficulty,
        platform: problemData.company + " Sheet",
      });
    }

    // Call precisely decoupled streak update logic
    await updateStreak(userId);

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.getProgress = async (req, res, next) => {
  try {
    const companyName = req.params.company;
    const companyData = await CompanyProblem.find({ company: { $regex: new RegExp(`^${companyName}$`, "i") } });

    if (!companyData || companyData.length === 0) {
      return next(new AppError("Company not found", 404));
    }

    const exactCompany = companyData[0].company;

    const solvedCount = await SolvedCompanyProblem.countDocuments({ userId: req.user.id, company: exactCompany });
    const total = companyData.length;

    res.status(200).json({
      success: true,
      data: {
        solved: solvedCount,
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

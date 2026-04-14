const CompanyProblem = require("../models/companyProblem.model");
const AppError = require("../utils/AppError");

exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await CompanyProblem.distinct("company");
    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies.sort()
    });
  } catch (error) {
    next(error);
  }
};

exports.getCompanyProblems = async (req, res, next) => {
  try {
    const { company } = req.params;
    
    // Find all problems for this company
    const problems = await CompanyProblem.find({ company });
    
    if (!problems || problems.length === 0) {
      return next(new AppError(`No problems found for company: ${company}`, 404));
    }
    
    res.status(200).json({
      success: true,
      count: problems.length,
      data: problems
    });
  } catch (error) {
    next(error);
  }
};

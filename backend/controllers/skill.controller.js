const Problem = require("../models/problem.model");
const AppError = require("../utils/AppError");

exports.getSkillsAnalysis = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const problems = await Problem.find({ userId });

    const topicCounts = {};
    problems.forEach(p => {
      if (p.topic) {
        topicCounts[p.topic] = (topicCounts[p.topic] || 0) + 1;
      }
    });

    const skills = Object.entries(topicCounts).map(([topic, count]) => {
      let level = "Beginner";
      if (count >= 16) level = "Advanced";
      else if (count >= 6) level = "Intermediate";

      return { topic, count, level };
    });

    res.status(200).json({
      success: true,
      skills
    });
  } catch (error) {
    next(error);
  }
};

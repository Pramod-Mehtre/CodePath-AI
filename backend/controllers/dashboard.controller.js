const Problem = require("../models/problem.model");
const AppError = require("../utils/AppError");

exports.getDashboard = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
        return next(new AppError("Not authorized", 401));
    }

    const userId = req.user.id;

    const problems = await Problem.find({ userId });

    // total
    const total = problems.length;

    // difficulty count
    const difficultyCount = {};
    problems.forEach((p) => {
      difficultyCount[p.difficulty] =
        (difficultyCount[p.difficulty] || 0) + 1;
    });

    // topic count
    const topicCount = {};
    problems.forEach((p) => {
      topicCount[p.topic] =
        (topicCount[p.topic] || 0) + 1;
    });

    // recent problems
    const recent = problems.slice(-5);

    // skills metrics
    let strongestTopic = "N/A";
    let weakestTopic = "N/A";
    
    if (Object.keys(topicCount).length > 0) {
      const sortedTopics = Object.entries(topicCount).sort((a, b) => b[1] - a[1]);
      strongestTopic = sortedTopics[0][0];
      weakestTopic = sortedTopics[sortedTopics.length - 1][0];
    }

    res.json({
      total,
      difficultyCount,
      topicCount,
      recent,
      skills: {
        strongestTopic,
        weakestTopic
      }
    });
  } catch (error) {
    next(error);
  }
};
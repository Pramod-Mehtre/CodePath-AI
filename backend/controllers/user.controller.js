const User = require("../models/user.model");
const Problem = require("../models/problem.model");
const AppError = require("../utils/AppError");

exports.setDailyGoal = async (req, res, next) => {
  try {
    const { dailyGoal } = req.body;
    
    if (dailyGoal === undefined || dailyGoal < 0) {
      return next(new AppError("Please provide a valid daily goal", 400));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.dailyGoal = dailyGoal;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        dailyGoal: user.dailyGoal
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getStreakInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Determine current streak validity
    // If lastSolvedDate is before yesterday, the streak is lost
    let currentStreak = user.currentStreak;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (user.lastSolvedDate) {
      const lastSolved = new Date(user.lastSolvedDate);
      lastSolved.setHours(0, 0, 0, 0);

      // if last solved is less than yesterday, it means they missed yesterday, so streak breaks unless they haven't set a goal yet or whatever.
      // But we just return 0 if they broke it. The actual saving of broken streak can happen safely.
      if (lastSolved.getTime() < yesterday.getTime()) {
        currentStreak = 0;
      }
    }

    // Also fetch today's count to compute progress bar efficiently 
    const todayCount = await Problem.countDocuments({
      userId: user._id,
      date: { $gte: today }
    });

    res.status(200).json({
      success: true,
      data: {
        dailyGoal: user.dailyGoal,
        currentStreak: currentStreak,
        longestStreak: user.longestStreak,
        lastSolvedDate: user.lastSolvedDate,
        todayCount: todayCount
      }
    });
  } catch (error) {
    next(error);
  }
};

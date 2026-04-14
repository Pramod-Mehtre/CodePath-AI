const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  dailyGoal: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastSolvedDate: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
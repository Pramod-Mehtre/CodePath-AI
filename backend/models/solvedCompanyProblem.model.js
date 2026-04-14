const mongoose = require("mongoose");

const solvedCompanyProblemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  problemId: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  solvedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Prevent duplicate solving of exact same company problem
solvedCompanyProblemSchema.index({ userId: 1, problemId: 1, company: 1 }, { unique: true });

module.exports = mongoose.model("SolvedCompanyProblem", solvedCompanyProblemSchema);

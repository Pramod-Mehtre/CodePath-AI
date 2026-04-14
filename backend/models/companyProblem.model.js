const mongoose = require("mongoose");

const companyProblemSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      default: "Uncategorized",
    },
    link: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index to avoid duplicate problems per company
companyProblemSchema.index({ company: 1, link: 1 }, { unique: true });

module.exports = mongoose.model("CompanyProblem", companyProblemSchema);

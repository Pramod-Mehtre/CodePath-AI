const mongoose = require("mongoose");

const pendingSkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  sourceJobId: {
    type: String,
    default: "JD Analyzer"
  },
  count: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

pendingSkillSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("PendingSkill", pendingSkillSchema);

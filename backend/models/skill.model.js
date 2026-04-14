const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  aliases: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: ["language", "framework", "database", "tool", "concept", "other"],
    default: "other"
  }
}, { timestamps: true });

// Create a unified search field to speed up regex matching if needed
skillSchema.index({ aliases: 1 });

module.exports = mongoose.model("Skill", skillSchema);

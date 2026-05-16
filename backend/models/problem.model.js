const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: String,
  topic: String,
  difficulty: String,
  platform: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

// ✅ ADDED COMPOUND INDEX TO PREVENT DUPLICATES
problemSchema.index({ userId: 1, title: 1 }, { unique: true });

module.exports = mongoose.model("Problem", problemSchema);
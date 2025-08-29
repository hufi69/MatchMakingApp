const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  userOne: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userTwo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  matchedAt: { type: Date, default: Date.now }
});

// Ensure no duplicate matches
MatchSchema.index({ userOne: 1, userTwo: 1 }, { unique: true });

module.exports = mongoose.model("Match", MatchSchema);  

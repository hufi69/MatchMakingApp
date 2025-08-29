const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  favoriteUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

// Index for fast lookup (who favorited who)
FavoriteSchema.index({ userId: 1, favoriteUserId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", FavoriteSchema);

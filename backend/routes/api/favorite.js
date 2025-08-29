const express = require("express");
const Favorite = require("../../models/Favorite");
const { authenticateTokenReview } = require("../../middleware/auth");
const Match = require("../../models/Match");
const router = express.Router();

// route to add a favorite
router.get("/", authenticateTokenReview, async (req, res) => {
  try {
    const userId = req.user._id;

    const favorites = await Favorite.find({ userId }).populate(
      "favoriteUserId",
      "name email role location"
    );

    res.status(200).json(favorites);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/", authenticateTokenReview, async (req, res) => {
  try {
    const { favoriteUserId } = req.body;
    const userId = req.user._id; // from auth middleware

    // Prevent self-favorite
    if (userId.toString() === favoriteUserId.toString()) {
      return res.status(400).json({ message: "You cannot favorite yourself" });
    }

    // Add favorite
    const favorite = await Favorite.create({
      userId,
      favoriteUserId,
    });

    // Check for match
    const reverseFavorite = await Favorite.findOne({
      userId: favoriteUserId,
      favoriteUserId: userId,
    });

    if (reverseFavorite) {
      console.log('🎯 Potential match found!', {
        user1: userId,
        user2: favoriteUserId,
        timestamp: new Date().toISOString()
      });
      
      // Create match if not already existing
      const existingMatch = await Match.findOne({
        $or: [
          { userOne: userId, userTwo: favoriteUserId },
          { userOne: favoriteUserId, userTwo: userId },
        ],
      });

      if (!existingMatch) {
        try {
          const newMatch = await Match.create({ userOne: userId, userTwo: favoriteUserId });
          console.log('✅ Match created successfully:', newMatch._id);
        } catch (error) {
          console.error('❌ Error creating match:', error.message);
          // Continue with favorite creation even if match fails
        }
      } else {
        console.log('ℹ️ Match already exists:', existingMatch._id);
      }
    } else {
      console.log('💔 No mutual like yet for users:', userId, favoriteUserId);
    }

    res.status(201).json({ message: "Favorite added successfully", favorite });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", authenticateTokenReview, async (req, res) => {
  try {
    const userId = req.user._id;
    const { favoriteUserId } = req.params;

    await Favorite.findOneAndDelete({ userId, favoriteUserId });

    // If match exists, remove it
    await Match.findOneAndDelete({
      $or: [
        { userOne: userId, userTwo: favoriteUserId },
        { userOne: favoriteUserId, userTwo: userId },
      ],
    });

    res.status(200).json({
      message: "Favorite (and match if existed) removed successfully",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/me", authenticateTokenReview, async (req, res) => {
  try {
    const userId = req.user._id;

    const favoritedBy = await Favorite.find({
      favoriteUserId: userId,
    }).populate("userId", "name email role location");

    res.status(200).json(favoritedBy);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
module.exports = router;

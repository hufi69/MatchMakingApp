const express = require("express");
const Match = require("../../models/Match");
const { authenticateTokenReview } = require("../../middleware/auth");
const router = express.Router();

// route to add a favorite
router.get("/", authenticateTokenReview, async (req, res) => {
  try {
    const userId = req.user._id;

    const matches = await Match.find({
      $or: [{ userOne: userId }, { userTwo: userId }]
    }).populate("userOne userTwo", "name email location role phoneNumber profilePicture");

    res.status(200).json(matches);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
module.exports = router;

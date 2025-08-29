const express = require("express");
const User = require("../../models/User");
const { authenticateTokenReview } = require("../../middleware/auth");
const router = express.Router();

// Get users by role (for matching - brands see influencers, influencers see brands)
router.get('/', authenticateTokenReview, async (req, res) => {
  try {
    const { role } = req.query;
    const currentUserId = req.user._id;
    
    if (!role) {
      return res.status(400).json({ 
        success: false, 
        message: "Role parameter is required" 
      });
    }

    // Get users of the specified role, excluding the current user
    const users = await User.find({ 
      role: role,
      _id: { $ne: currentUserId }, // Exclude current user
      isActive: true,
      isVerified: true
    }).select('name email role location about interests profilePicture phoneNumber');

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error getting users by role:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Get user profile by ID
router.get('/:id', authenticateTokenReview, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('name email role location about interests profilePicture phoneNumber');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

module.exports = router;

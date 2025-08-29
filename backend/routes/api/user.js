const express = require("express");
const { ResponseHandler } = require("../../utils/responseHandler");
const User = require("../../models/User");
const { authenticateTokenReview } = require("../../middleware/auth");
const { changePasswordSchema } = require("../../validators/user");
const  validate = require('../../validators/validate')
const router = express.Router();


router.post('/change-password', authenticateTokenReview, validate(changePasswordSchema), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return ResponseHandler.badRequest(res, "User not found");
        }
        const isPasswordValid = await user.verifyPassword(currentPassword);
        if (!isPasswordValid) {
            return ResponseHandler.badRequest(res, "Invalid current password");
        }
        user.password = user.generatePassword(newPassword);
        await user.save();
        return ResponseHandler.ok(res, "Password changed successfully");
    } catch (error) {
        return ResponseHandler.serverError(res, error);
    }
})

// create a route to send user profile information, that includes fullName, Username, dob, Email, Country, and profileImage
router.get('/profile', authenticateTokenReview, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return ResponseHandler.badRequest(res, "User not found");
        } 
        const profile = {
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            dob: user.dob,
            gender: user.gender,
            race: user.race,
            ethnicity: user.ethnicity,
            address: user.address,
            email: user.email,
            phone: user.phone,
            accountStatus: user.accountStatus,
            reviewSelfie: user.reviewSelfie,
            reviewId: user.reviewId,
        }
        return ResponseHandler.ok(res, profile);
    } catch (error) {
        return ResponseHandler.serverError(res, error);
    }
})


// create a route to update the user documents, i.e the reviewSelfie and reviewId
router.put('/documents', authenticateTokenReview, async (req, res) => {
    try {
        const { reviewSelfie, reviewId } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return ResponseHandler.badRequest(res, "User not found");
        }

        // Update documents if provided
        if (reviewSelfie !== undefined) {
            user.reviewSelfie = reviewSelfie;
        }
        if (reviewId !== undefined) {
            user.reviewId = reviewId;
        }

        // If documents are being updated, set account status to pending review
        if (reviewSelfie || reviewId) {
            if (user.accountStatus === 4) {
                user.accountStatus = 2; // Set to pending review
            }
        }

        await user.save();
        return ResponseHandler.ok(res, "Documents updated successfully");
    } catch (error) {
        return ResponseHandler.serverError(res, error);
    }
});

// route to update user profile
router.put('/profile', authenticateTokenReview, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return ResponseHandler.badRequest(res, "User not found");
        }
        const { firstName, lastName, dob, gender, race, ethnicity, address, email, country, phone, profilePicture } = req.body;
        if(!firstName || !lastName || !dob || !gender || !race || !ethnicity || !address || !email || !country || !phone) {
            return ResponseHandler.badRequest(res, "All fields are required");
        }
        if(user.accountStatus === 1 || user.accountStatus === 4){
            user.accountStatus = 2;
        }
        user.firstName = firstName;
        user.lastName = lastName;
        user.dob = dob;
        user.gender = gender;
        user.race = race;
        user.ethnicity = ethnicity;
        user.address = address;
        user.phone = phone;
        user.profilePicture = profilePicture;
        await user.save();
        return ResponseHandler.ok(res, "Profile updated successfully");
    } catch (error) {
        return ResponseHandler.serverError(res, error);
    }
})

module.exports = router;
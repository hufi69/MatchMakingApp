const express = require("express");
const { ResponseHandler } = require("../../utils/responseHandler");
const User = require("../../models/User");
const { registerSchema, loginSchema, verifyOTPSchema, forgotPasswordSchema, resetPasswordSchema, resendOTPSchema, twoFASchema, verificationSchema } = require("../../validators/user");
const { authenticateToken, handleTokenRefresh, authenticateWithAutoRefresh, authenticateTokenReview } = require("../../middleware/auth");
const passport = require("passport");
const { generateTokens, generateToken } = require("../../utils/jwt"); // Import both functions
const config = require("../../config");
const validate = require("../../validators/validate");
const { sendEmail } = require("../../utils/mailer");
const upload = require("../../utils/multer");

const router = express.Router();

// get current user context
router.get('/context', authenticateTokenReview, async (req, res) => {
  try {
    // Return only selected user properties
    const { _id, firstName, lastName, email, accountStatus, role, isVerified, isActive, profilePicture } = req.user;
    ResponseHandler.ok(res, { user: {
      id: _id,
      firstName,
      lastName,
      email,
      accountStatus,
      role,
      profilePicture,
      isVerified,
      isActive
    }});
  } catch (error) {
    ResponseHandler.serverError(res, error);
  }
});


// Refresh token endpoint
router.post('/refresh-token', handleTokenRefresh);


const handleEmailSendingInBackground = async (user, subject, template, data) => {
  try {
    await sendEmail(user, subject, template, data);
  } catch (error) {
    console.error('Email sending error:', error);
  }
}

// Registration with profile picture support
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    console.log("req.body", req.body)
    const { name, email, password, role, location, phoneNumber, profilePicture } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified && existingUser.accountStatus === 0){
        const otp = existingUser.generateOTP();
        await existingUser.save();
        await sendEmail(existingUser, "OTP for Aesthira", {verifyOTP: true, otp});
        return ResponseHandler.ok(res, { message: "User already exists. Please verify your email"});
      }
      return ResponseHandler.badRequest(res, "User already exists");
    }
    
    // Create user with profile picture if provided
    const userData = { name, email, role, isVerified: true, location, phoneNumber };
    if (profilePicture) {
      userData.profilePicture = profilePicture;
    }
    
    const newUser = new User(userData);
    const hashPassword = newUser.generatePassword(password);
    newUser.password = hashPassword;  
    
    await newUser.save();
    return ResponseHandler.ok(res, { 
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profilePicture: newUser.profilePicture
      }
    });
    
  } catch (error) {
    console.log(error)
    ResponseHandler.serverError(res, error);
  }
});

// Registration with file upload (alternative approach)
router.post('/register-with-photo', upload.single('profilePicture'), async (req, res) => {
  try {
    console.log("Registration with photo - req.body:", req.body);
    console.log("Registration with photo - req.file:", req.file);
    
    const { name, email, password, role, location, phoneNumber } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return ResponseHandler.badRequest(res, "Name, email, password, and role are required");
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified && existingUser.accountStatus === 0){
        const otp = existingUser.generateOTP();
        await existingUser.save();
        await sendEmail(existingUser, "OTP for Aesthira", {verifyOTP: true, otp});
        return ResponseHandler.ok(res, { message: "User already exists. Please verify your email"});
      }
      return ResponseHandler.badRequest(res, "User already exists");
    }
    
    // Create user data
    const userData = { name, email, role, isVerified: true, location, phoneNumber };
    
    // Add profile picture if uploaded
    if (req.file) {
      const filePath = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
      userData.profilePicture = filePath;
      console.log('Profile picture path saved:', filePath);
    }
    
    const newUser = new User(userData);
    const hashPassword = newUser.generatePassword(password);
    newUser.password = hashPassword;  
    
    await newUser.save();
    console.log('User created with profile picture:', newUser.profilePicture);
    
    return ResponseHandler.ok(res, { 
      message: "User created successfully with profile picture",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profilePicture: newUser.profilePicture
      }
    });
    
  } catch (error) {
    console.log('Registration error:', error);
    ResponseHandler.serverError(res, error);
  }
});

// login route with refresh token support
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password, rememberMe = true } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return ResponseHandler.badRequest(res, "User not found");
    }

    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return ResponseHandler.badRequest(res, "Invalid password");
    }

    // check if user is admin
    if (user.role === 'admin') {
      return ResponseHandler.badRequest(res, "Admin login is not allowed");
    }

    if (!user.isActive) {
      return ResponseHandler.badRequest(res, "This account has been deactivated. Please contact support");
    }
    
    // if (user.twoFAEnabled){
    //   const otp = user.generateOTP();
    //   await user.save()
    //   handleEmailSendingInBackground(user, "OTP for Aesthira", {verifyTwoFA: true, otp});
    //   return ResponseHandler.ok(res, { 
    //     requirestwoFA: true, 
    //     message: "TwoFA is enabled. Please enter your OTP",
    //   });
    // }
    if (user.accountStatus === 0){
      return ResponseHandler.ok(res, {
        message: "Please upload the required documents to complete your account setup",
        accountStatus: 0
      });
    }
    if (!user.isVerified){
      const otp = user.generateOTP();
      await user.save();
      handleEmailSendingInBackground(user, "OTP for Aesthira", {verifyTwoFA: true, otp});
      return ResponseHandler.ok(res, { 
        requirestwoFA: true, 
        message: "Please verify your email",
      });
    }
    
    // Generate both access and refresh tokens
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role
    };
    
    const { accessToken, refreshToken } = generateTokens(payload, rememberMe);
    
    // Store refresh token in database
    user.addRefreshToken(refreshToken, rememberMe);
    await user.save();

    // send refresh token as a cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24, // 30 days
      sameSite: 'strict'
    });
    return ResponseHandler.ok(res, { 
      accessToken,
      rememberMe,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountStatus: user.accountStatus,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        profilePicture: user.profilePicture
      }
    });
  }
  catch (error) {
    console.error('Login error:', error);
    ResponseHandler.serverError(res, error);
  }
});

// Admin login route - simplified admin authentication
router.post('/admin-login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return ResponseHandler.badRequest(res, "User not found");
    }

    if (user.role !== 'admin') {
      return ResponseHandler.badRequest(res, "Access denied. Admin privileges required.");
    }

    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return ResponseHandler.badRequest(res, "Invalid password");
    }

    if (!user.isActive) {
      return ResponseHandler.badRequest(res, "This account has been deactivated. Please contact support");
    }

    if (!user.isVerified) {
      return ResponseHandler.badRequest(res, "Account not verified. Please verify your email first.");
    }
    
    // Generate access token for admin
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role
    };
    
    const { accessToken, refreshToken } = generateTokens(payload);
    
    // Store refresh token in database
    user.addRefreshToken(refreshToken);
    await user.save();

    // send refresh token as a cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 30 days
      sameSite: 'strict'
    });
    return ResponseHandler.ok(res, { 
      accessToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountStatus: user.accountStatus,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        profilePicture: user.profilePicture
      }
    });
  }
  catch (error) {
    console.error('Admin login error:', error);
    ResponseHandler.serverError(res, error);
  }
});

// Logout route - removes specific refresh token
router.post('/logout', authenticateTokenReview, async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const user = req.user;
    
    if (refreshToken) {
      user.removeRefreshToken(refreshToken);
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
      });
      await user.save();
    }

    ResponseHandler.ok(res, { message: "Logged out successfully" });
    
  } catch (error) {
    console.error('Logout error:', error);
    ResponseHandler.serverError(res, error);
  }
});


// forgot password route
router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return ResponseHandler.badRequest(res, "User not found");
    }
    const otp = user.generateOTP();
    await user.save();
    console.log("otp", otp)
    handleEmailSendingInBackground(user, "Password Reset OTP for Aesthira", { resetPassword: true, otp });
    return ResponseHandler.ok(res, { message: "OTP sent to your email for password reset" });
  } catch (error) {
    ResponseHandler.serverError(res, error);
  }
});

// reset password route
router.post('/reset-password', validate(resetPasswordSchema), async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return ResponseHandler.badRequest(res, "User not found");
    }
    const isOTPValid = user.verifyOTP(otp);
    if (!isOTPValid) {
      return ResponseHandler.badRequest(res, "Invalid or expired OTP");
    }
    user.password = user.generatePassword(newPassword);
    user.otp.value = null;
    user.otp.expiresAt = null;
    
    // Clear all refresh tokens on password reset for security
    user.clearAllRefreshTokens();
    
    await user.save();
    return ResponseHandler.ok(res, { message: "Password reset successful. Please login again." });
  } catch (error) {
    ResponseHandler.serverError(res, error);
  }
});

// resend otp route
router.post('/resend-otp', validate(resendOTPSchema), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return ResponseHandler.badRequest(res, "User not found");
    }
    const otp = user.generateOTP();
    await user.save();
    if (user.twoFAEnabled){
      handleEmailSendingInBackground(user, "OTP for Aesthira", { verifyTwoFA: true, otp });
    } else {
      handleEmailSendingInBackground(user, "OTP for Aesthira", { verifyOTP: true, otp });
    }
    return ResponseHandler.ok(res, { message: "OTP resent to your email" });
  } catch (error) {
    ResponseHandler.serverError(res, error);
  }
});

// verify OTP with refresh token support
router.post('/verify-otp', validate(verifyOTPSchema), async (req, res) => {
  try {
    const { email, otp, rememberMe = false } = req.body;
    console.log(email, otp)
    const user = await User.findOne({ email });
    if (!user) {
      return ResponseHandler.badRequest(res, "User not found");
    }
    console.log("otp", otp)
    // verify otp and generate token
    const isOTPValid = user.verifyOTP(otp);
    console.log("isOTPValid", isOTPValid)
    if (!isOTPValid) {
      return ResponseHandler.badRequest(res, "Invalid or expired OTP");
    }
    if (!user.isVerified){
      user.isVerified = true;
    }



    // clear otp
    user.otp.value = null;
    user.otp.expiresAt = null;
    await user.save();
    if (user.accountStatus === 0){
      return ResponseHandler.ok(res, { message: "Please upload the required documents to complete your account setup", accountStatus: 0 });
    }
    // Generate both access and refresh tokens
    const payload = {
      id: user._id,
      email: user.email,
      payload: user.role
    };
    
    const { accessToken, refreshToken } = generateTokens(payload, rememberMe);
    
    // Store refresh token in database
    user.addRefreshToken(refreshToken, rememberMe);
    await user.save();

    // send refresh token as a cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24, // 30 days
      sameSite: 'strict'
    });
    return ResponseHandler.ok(res, { 
      accessToken,
      rememberMe,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountStatus: user.accountStatus,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        profilePicture: user.profilePicture
      }
    });
  } catch(err) {
    console.log(err)
    ResponseHandler.serverError(res, err)
  }
});


// twoFA status
router.get('/twoFA', authenticateTokenReview, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return ResponseHandler.ok(res, { twoFAEnabled: user.twoFAEnabled });
  } catch(err) {
    ResponseHandler.serverError(res, err)
  }
});
// twoFA enable, disable
router.patch('/twoFA', validate(twoFASchema), authenticateTokenReview, async (req, res) => {
  try {
    const { twoFAEnabled } = req.body;
    const user = await User.findById(req.user._id);
    user.twoFAEnabled = twoFAEnabled;
    await user.save();
    return ResponseHandler.ok(res, { message: "TwoFA toggled successfully" });
  } catch(err) {
    ResponseHandler.serverError(res, err)
  }
});

// auth verification route
router.post('/verification', validate(verificationSchema), async (req, res) => {
  try {
    const { email, selfieUrls, idUrls } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return ResponseHandler.badRequest(res, "User not found");
    }
    const payload = {
      id: user._id,
      email: user.email,
      payload: user.role
    };
    
    const { accessToken, refreshToken } = generateTokens(payload);
    
    // Store refresh token in database
    // Update user verification status and image URLs
    user.accountStatus = 1; // Pending review
    user.reviewSelfie = selfieUrls;
    user.reviewId = idUrls;
    user.isVerified = true;
    user.addRefreshToken(refreshToken);
    await user.save();

    // send refresh token as a cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      sameSite: 'strict'
    });
    return ResponseHandler.ok(res, { 
      accessToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountStatus: user.accountStatus,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        profilePicture: user.profilePicture
      }
    });
  } catch(err) {
    console.log(err);
    ResponseHandler.serverError(res, err);
  }
});

module.exports = router;
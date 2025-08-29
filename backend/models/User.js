const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: null,
  },
  phoneNumber: {
    type: String,
  },

  dob: {
    type: Date,
    default: null,
  },
  gender: {
    type: String,
    default: null,
  },

  otp: {
    value: { type: Number },
    expiresAt: { type: Date },
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ["brand", "influencer"],
    default: "brand",
  },
  // Store refresh tokens
  refreshTokens: [
    {
      token: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      expiresAt: {
        type: Date,
        required: true,
      },
      rememberMe: {
        type: Boolean,
        default: false,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.methods.generatePassword = function (password) {
  return bcrypt.hashSync(password, 13);
};

UserSchema.methods.verifyPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// generate otp
UserSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000);
  this.otp.value = otp;
  this.otp.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return otp;
};

// verify otp
UserSchema.methods.verifyOTP = function (otp) {
  return this.otp.value === otp && this.otp.expiresAt > Date.now();
};

// Add refresh token to user
UserSchema.methods.addRefreshToken = function (
  refreshToken,
  rememberMe = false
) {
  const expiryTime = rememberMe
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  this.refreshTokens.push({
    token: refreshToken,
    expiresAt: expiryTime,
    rememberMe: rememberMe,
  });

  // Clean up expired tokens
  this.cleanExpiredRefreshTokens();
};

// Remove specific refresh token
UserSchema.methods.removeRefreshToken = function (refreshToken) {
  this.refreshTokens = this.refreshTokens.filter(
    (tokenObj) => tokenObj.token !== refreshToken
  );
};

// Clean expired refresh tokens
UserSchema.methods.cleanExpiredRefreshTokens = function () {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter(
    (tokenObj) => tokenObj.expiresAt > now
  );
};

// Check if refresh token is valid for this user
UserSchema.methods.hasValidRefreshToken = function (refreshToken) {
  this.cleanExpiredRefreshTokens();
  return this.refreshTokens.some(
    (tokenObj) =>
      tokenObj.token === refreshToken && tokenObj.expiresAt > new Date()
  );
};

// Remove all refresh tokens (logout from all devices)
UserSchema.methods.clearAllRefreshTokens = function () {
  this.refreshTokens = [];
};

module.exports = mongoose.model("User", UserSchema);

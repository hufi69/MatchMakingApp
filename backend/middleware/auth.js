
const { verifyAccessToken, verifyRefreshToken, refreshAccessToken } = require('../utils/jwt');
const User = require('../models/User');

// JWT Authentication Middleware for Access Tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
  
  // Find user and check if still active
  User.findById(decoded.id)
    .then(user => {
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }
      if (!user.isVerified) {
        return res.status(401).json({ error: 'User is not verified' });
      }
      if (user.accountStatus !== 3) {
        return res.status(401).json({ error: 'User is under review or rejected' });
      }
      
      req.user = user;
      next();
    })
    .catch(err => {
      return res.status(500).json({ error: 'Authentication error' });
    });
};
const authenticateTokenReview = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
  
  // Find user and check if still active
  User.findById(decoded.id)
    .then(user => {
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }
      if (!user.isVerified) {
        return res.status(401).json({ error: 'User is not verified' });
      }
      req.user = user;
      next();
    })
    .catch(err => {
      return res.status(500).json({ error: 'Authentication error' });
    });
};

// Middleware to handle token refresh
const handleTokenRefresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    // Check if refresh token is valid for this user
    if (!user.hasValidRefreshToken(refreshToken)) {
      return res.status(401).json({ error: 'Refresh token not found or expired' });
    }
    
    // Generate new access token
    const result = refreshAccessToken(refreshToken);
    if (!result) {
      return res.status(401).json({ error: 'Unable to refresh token' });
    }
    
    res.json({
      success: true,
      accessToken: result.accessToken,
      message: 'Token refreshed successfully'
    });
    
  } catch (error) {
    return res.status(500).json({ error: 'Token refresh error' });
  }
};

module.exports = {
  authenticateToken,
  authenticateTokenReview,
  handleTokenRefresh,
};
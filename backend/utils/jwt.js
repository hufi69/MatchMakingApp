const jwt = require('jsonwebtoken');
const config = require('../config');

const { jwtSecret, jwtExpire } = config;

// Generate both access and refresh tokens
const generateTokens = (payload, rememberMe = false) => {
  // Access token - short lived (1 hour)
  const accessToken = jwt.sign(
    { ...payload, type: 'access' }, 
    jwtSecret, 
    { expiresIn: '15m' }
  );
  
  // Refresh token - longer lived based on rememberMe
  const refreshTokenExpiry = rememberMe ? '30d' : '24h';
  const refreshToken = jwt.sign(
    { 
      ...payload, 
      type: 'refresh',
      rememberMe 
    }, 
    jwtSecret, 
    { expiresIn: refreshTokenExpiry }
  );
  
  return {
    accessToken,
    refreshToken,
    expiresIn: rememberMe ? '30d' : '24h'
  };
};

// Legacy function for backward compatibility
const generateToken = (payload, rememberMe = false) => {
  const expiresIn = rememberMe ? '30d' : jwtExpire;
  return jwt.sign(payload, jwtSecret, { expiresIn });
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.type && decoded.type !== 'access') {
      return null; // Wrong token type
    }
    return decoded;
  } catch (error) {
    return null;
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.type !== 'refresh') {
      return null; // Wrong token type
    }
    return decoded;
  } catch (error) {
    return null;
  }
};

// Generate new access token from refresh token
const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return null;
    }
    
    // Create new access token with same payload (excluding refresh token specific fields)
    const { type, iat, exp, rememberMe, ...userPayload } = decoded;
    const newAccessToken = jwt.sign(
      { ...userPayload, type: 'access' }, 
      jwtSecret, 
      { expiresIn: '1h' }
    );
    
    return {
      accessToken: newAccessToken,
      user: userPayload
    };
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken, // Keep for backward compatibility
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  refreshAccessToken
};
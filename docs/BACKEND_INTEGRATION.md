# 🚀 Backend Integration Guide

## 📋 Overview

Your React Native app has been successfully integrated with the Node.js/Express/MongoDB backend! This integration provides:

- **JWT Authentication** with refresh tokens
- **Real-time user management**
- **Favorites and matching system**
- **File upload capabilities**
- **Secure API communication**

## 🛠️ Setup Instructions

### 1. Backend Setup

1. **Navigate to your backend folder:**
   ```bash
   cd ~/Downloads/match-making-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   PORT=5000
   DB_URL=mongodb://localhost:27017/match-making-db
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   SESSION_SECRET=your_session_secret_here
   PUBLIC_PICS=public/uploads
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB** (if not running):
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # Or start manually
   mongod
   ```

5. **Start the backend server:**
   ```bash
   npm start
   ```

   The server will run on `http://localhost:5000`

### 2. React Native App Configuration

1. **Update API URL** in `src/config/api.js`:
   ```javascript
   // If localhost doesn't work, try your computer's IP address
   // Find it by running: ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Install additional dependencies** (if needed):
   ```bash
   npm install
   ```

## 🔐 Authentication Flow

### Registration Process:
1. User fills signup form
2. Backend creates user account
3. User receives OTP via email
4. User verifies OTP
5. User gets access token and can login

### Login Process:
1. User enters email/password
2. Backend validates credentials
3. User receives access token + refresh token
4. App stores tokens securely
5. User is authenticated

## 📱 Key Features

### 1. **User Authentication**
- JWT-based authentication
- Automatic token refresh
- Secure logout
- Email verification with OTP

### 2. **User Management**
- Profile creation and updates
- Role-based access (brand/influencer)
- Document verification system

### 3. **Favorites & Matching**
- Add/remove favorites
- Automatic match detection
- View matches and favorites

### 4. **File Upload**
- Profile picture uploads
- Document verification uploads
- Secure file storage

## 🔧 API Service Usage

### Basic Usage:
```javascript
import apiService from '../services/api';

// Login
const result = await apiService.login({ email, password });

// Get user profile
const profile = await apiService.getUserProfile();

// Add favorite
await apiService.addFavorite(userId);

// Get matches
const matches = await apiService.getMatches();
```

### Authentication Context:
```javascript
import { useAuth } from '../context/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Network request failed"**
   - Check if backend is running
   - Verify API URL in config
   - Try using IP address instead of localhost

2. **"Authentication failed"**
   - Check JWT secret in backend
   - Verify token expiration settings
   - Check if user exists in database

3. **"CORS error"**
   - Backend CORS is configured for development
   - Update `allowedOrigins` in backend config if needed

### Debug Steps:

1. **Check backend logs** for errors
2. **Verify MongoDB connection**
3. **Test API endpoints** with Postman/Insomnia
4. **Check React Native console** for network errors

## 📊 Database Schema

### User Model:
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "brand" | "influencer",
  location: String,
  phoneNumber: String,
  isVerified: Boolean,
  isActive: Boolean,
  profilePicture: String,
  refreshTokens: Array
}
```

### Favorite Model:
```javascript
{
  userId: ObjectId,
  favoriteUserId: ObjectId
}
```

### Match Model:
```javascript
{
  userOne: ObjectId,
  userTwo: ObjectId
}
```

## 🚀 Next Steps

1. **Test the integration** with sample users
2. **Customize the UI** to match your brand
3. **Add real-time features** with Socket.io
4. **Implement push notifications**
5. **Add analytics and monitoring**

## 📞 Support

If you encounter issues:
1. Check the console logs
2. Verify backend configuration
3. Test API endpoints independently
4. Check MongoDB connection status

---

**🎉 Congratulations! Your app now has a production-ready backend!**

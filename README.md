# 🚀 MatchMaking - Full Stack Application

A complete matchmaking platform built with React Native (frontend) and Node.js/Express/MongoDB (backend).

## 📁 Project Structure

```
MatchMaking/
├── frontend/          # React Native mobile application
└── backend/           # Node.js/Express API server
```

## 🎯 Features

### Frontend (React Native)
- User authentication (login/signup)
- Profile management
- Favorites and matching system
- Real-time chat functionality
- Role-based access (brand/influencer)

### Backend (Node.js/Express)
- RESTful API endpoints
- JWT authentication with refresh tokens
- MongoDB database integration
- File upload capabilities
- Email verification system
- Real-time socket connections

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- React Native development environment
- iOS Simulator or Android Emulator

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npx react-native run-ios     # For iOS
npx react-native run-android # For Android
```

## 🔧 Configuration

### Backend Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DB_URL=mongodb://localhost:27017/match-making-db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
SESSION_SECRET=your_session_secret_here
PUBLIC_PICS=public/uploads
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration
Update the API URL in `frontend/src/config/api.js` to point to your backend server.

## 📱 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/favorites` - Add to favorites
- `GET /api/matches` - Get user matches

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Development mode with nodemon
```

### Frontend Development
```bash
cd frontend
npx react-native start  # Start Metro bundler
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please create an issue in the repository.

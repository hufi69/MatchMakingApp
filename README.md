# MatchMaking10 🚀

A React Native mobile application for business partner matching between brands and influencers.

## 📱 Features

- **User Authentication**: Secure login/signup with JWT tokens
- **Profile Management**: Complete user profiles with photos
- **Smart Matching**: Swipe-based matching system
- **Real-time Chat**: In-app messaging for matched users
- **Role-based System**: Support for both brands and influencers
- **Cross-platform**: Works on Android devices

## 🛠️ Tech Stack

- **Frontend**: React Native
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Authentication**: JWT with refresh tokens
- **Storage**: AsyncStorage for local data
- **UI Components**: Custom components with LinearGradient
- **Gesture Handling**: React Native Gesture Handler

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- React Native CLI
- Android Studio with SDK
- Java Development Kit (JDK)
- Gradle

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd MatchMaking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Android setup**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

4. **Run the app**
   ```bash
   npx react-native run-android
   ```

### Building APK

```bash
cd android
./gradlew assembleRelease
```

APK will be generated at: `android/app/build/outputs/apk/release/app-release.apk`

## 🌐 API Configuration

The app requires a backend server running on port 5000. For development:

- **Local**: `http://localhost:5000/api`
- **Network**: `http://[your-ip]:5000/api`
- **Production**: Update `src/services/api.js` with your backend URL

## 📱 App Screens

1. **LoginScreen**: User authentication
2. **SignupScreen**: User registration with profile creation
3. **HomeScreen**: Profile swiping and matching
4. **MatchesScreen**: View matched users
5. **ChatScreen**: Messaging interface

## 🎯 User Roles

- **Brand**: Businesses looking for influencer partnerships
- **Influencer**: Content creators seeking brand collaborations

## 🔐 Security Features

- JWT token-based authentication
- Secure password storage
- Input validation and sanitization
- Network security configuration for Android

## 📊 State Management

- **Redux Toolkit** for global state
- **Slices**: profiles, favorites, matches
- **Async thunks** for API calls
- **Persistent storage** with redux-persist

## 🎨 UI/UX Features

- **Modern Design**: Clean, intuitive interface
- **Gesture Controls**: Swipe-based interactions
- **Responsive Layout**: Adapts to different screen sizes
- **Loading States**: Smooth user experience
- **Error Handling**: User-friendly error messages

## 🚀 Deployment

### Development
- Run with Metro bundler
- Connect device via USB debugging
- Use localhost backend

### Production
- Build release APK
- Deploy backend to cloud server
- Update API configuration
- Test on multiple devices

## 📋 Requirements

- Android 6.0 (API level 23) or higher
- Internet connection for API calls
- Camera permission for profile photos
- Storage permission for image uploads

## 🐛 Troubleshooting

### Common Issues

1. **Network request failed**
   - Check backend is running
   - Verify API URL configuration
   - Check network security settings

2. **Build errors**
   - Clean project: `./gradlew clean`
   - Reset Metro cache: `npx react-native start --reset-cache`

3. **Device connection**
   - Enable USB debugging
   - Run `adb devices` to verify connection

## 📞 Support

For technical support:
- Check console logs for error messages
- Verify environment configuration
- Test API endpoints individually
- Review network security settings

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ using React Native**
# MatchMakingApp

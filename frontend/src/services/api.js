import AsyncStorage from '@react-native-async-storage/async-storage';

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
};

// API Configuration
export const API_CONFIG = {
  // ngrok URL for public access - APK will work everywhere now!
  BASE_URL: 'https://2f6cc4eb85c0.ngrok-free.app/api',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH_TOKEN: '/auth/refresh-token',
      VERIFY_OTP: '/auth/verify-otp',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      CONTEXT: '/auth/context',
    },
    USER: {
      PROFILE: '/user/profile',
      UPDATE_PROFILE: '/user/profile',
      CHANGE_PASSWORD: '/user/change-password',
    },
    USERS: {
      LIST: '/users',
      PROFILE: '/users',
    },
    FAVORITE: {
      LIST: '/favorites',
      ADD: '/favorites',
      REMOVE: '/favorites',
      FAVORITED_BY: '/favorites/me',
    },
    MATCH: {
      LIST: '/match',
    },
    UPLOAD: {
      FILE: '/upload',
    },
  },
};

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    
    // Log the configuration being used
    console.log('🔧 API Service Initialized:');
    console.log('🔗 Base URL:', this.baseURL);
    console.log('🔧 Is Dev Mode:', __DEV__);
    console.log('📦 Build Type:', __DEV__ ? 'Debug Mode' : 'Release APK');
  }

  // Get stored access token
  async getAccessToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Get stored refresh token
  async getRefreshToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Store tokens
  async storeTokens(accessToken, refreshToken) {
    try {
      await AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  // Store user data
  async storeUserData(userData) {
    try {
      await AsyncStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  // Get user data
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(TOKEN_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Clear all stored data (logout)
  async clearStoredData() {
    try {
      await AsyncStorage.multiRemove([
        TOKEN_KEYS.ACCESS_TOKEN,
        TOKEN_KEYS.REFRESH_TOKEN,
        TOKEN_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing stored data:', error);
    }
  }

  // Make API request with authentication
  async makeRequest(endpoint, options = {}) {
    try {
      const accessToken = await this.getAccessToken();
      
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const url = `${this.baseURL}${endpoint}`;
      
      // Debug info - this will show on screen
      console.log('🚀 Making API request to:', url);
      console.log('🔗 Base URL being used:', this.baseURL);
      console.log('🔧 Is Dev Mode:', __DEV__);
      console.log(' With token:', accessToken.substring(0, 20) + '...');
      

      
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, requestOptions);
      console.log(' Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Token expired, trying to refresh...');
          // Token expired, try to refresh
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            console.log('Token refreshed, retrying request...');
            // Retry request with new token
            return this.makeRequest(endpoint, options);
          }
        }
        
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('API Response:', responseData);
      return responseData;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshAccessToken() {
    try {
      const refreshToken = await this.getRefreshToken();
      
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await this.storeTokens(data.accessToken, data.refreshToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  // Get current user from backend
  async getCurrentUser() {
    try {
      const response = await this.makeRequest(API_CONFIG.ENDPOINTS.AUTH.CONTEXT);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Authentication methods
  async register(userData) {
    try {
      console.log('🚀 Registering user with data:', userData);
      console.log('🔗 Base URL being used:', this.baseURL);
      console.log('🔧 Is Dev Mode:', __DEV__);
      
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      await this.storeTokens(data.accessToken, data.refreshToken);
      
      // Store user data if available
      if (data.user) {
        await this.storeUserData(data.user);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.makeRequest(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearStoredData();
    }
  }

  async verifyOTP(email, otp, rememberMe = false) {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, rememberMe }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'OTP verification failed');
      }

      const data = await response.json();
      
      // Store tokens and user data if available
      if (data.accessToken) {
        await this.storeTokens(data.accessToken, data.refreshToken);
      }
      if (data.user) {
        await this.storeUserData(data.user);
      }
      
      return data;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  // User profile methods
  async getUserProfile() {
    return this.makeRequest(API_CONFIG.ENDPOINTS.USER.PROFILE);
  }

  async updateUserProfile(profileData) {
    return this.makeRequest(API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Users methods
  async getProfilesByRole(role) {
    return this.makeRequest(`${API_CONFIG.ENDPOINTS.USERS.LIST}?role=${role}`);
  }

  // Favorites methods
  async getFavorites() {
    return this.makeRequest(API_CONFIG.ENDPOINTS.FAVORITE.LIST);
  }

  async addFavorite(favoriteUserId) {
    return this.makeRequest(API_CONFIG.ENDPOINTS.FAVORITE.ADD, {
      method: 'POST',
      body: JSON.stringify({ favoriteUserId }),
    });
  }

  async removeFavorite(favoriteUserId) {
    return this.makeRequest(API_CONFIG.ENDPOINTS.FAVORITE.REMOVE, {
      method: 'DELETE',
      body: JSON.stringify({ favoriteUserId }),
    });
  }

  // Matches methods
  async getMatches() {
    return this.makeRequest(API_CONFIG.ENDPOINTS.MATCH.LIST);
  }

  // File upload method
  async uploadFile(file, type = 'profile') {
    try {
      const accessToken = await this.getAccessToken();
      
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.UPLOAD.FILE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'File upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;



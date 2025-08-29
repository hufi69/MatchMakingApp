import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  register: () => {},
  logout: () => {},
  verifyOTP: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cheking user is already authenticated 
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const userData = await apiService.getUserData();
      const accessToken = await apiService.getAccessToken();

      if (userData && accessToken) {
        
        try {
          const currentUser = await apiService.getCurrentUser();
          if (currentUser.success) {
            setUser(currentUser.data.user);
            setIsAuthenticated(true);
          } else {
            
            await apiService.clearStoredData();
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          
          await apiService.clearStoredData();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, data: response };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const verifyOTP = async (email, otp, rememberMe = false) => {
    try {
      const response = await apiService.verifyOTP(email, otp, rememberMe);
      
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, data: response };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, message: error.message || 'OTP verification failed' };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    verifyOTP,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

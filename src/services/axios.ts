import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../config/api';
import useStore from '../store/useStore';

// Define non-authenticated endpoints
const nonAuthEndpoints = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-code',
  '/auth/verify-email',
  '/auth/reset-password',
  '/auth/refresh',
  '/auth/google',
  '/auth/apple',
  '/auth/facebook',
];

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('my_token');
      
      // Only add token if endpoint requires auth and we have a token
      if (token && !nonAuthEndpoints.some(endpoint => config.url?.includes(endpoint))) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Adding auth token to request:', config.url);
      } else if (!token && !nonAuthEndpoints.some(endpoint => config.url?.includes(endpoint))) {
        console.log('No auth token available for protected endpoint:', config.url);
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(error);
    }

    // Handle 401/403 errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Don't handle auth errors for login/register endpoints
      if (nonAuthEndpoints.some(endpoint => originalRequest?.url?.includes(endpoint))) {
        return Promise.reject(error);
      }

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        
        // If we have a refresh token, try to refresh
        if (refreshToken) {
          try {
            console.log('Attempting token refresh with token:', refreshToken.substring(0, 10) + '...');
            const response = await axiosInstance.post('/auth/refresh', {
              refresh_token: refreshToken
            });

            const { access_token, refresh_token: newRefreshToken, user } = response.data;
            
            console.log('Token refresh successful:', {
              hasAccessToken: !!access_token,
              hasNewRefreshToken: !!newRefreshToken,
              userId: user?.id
            });
            
            // Update tokens in storage
            await AsyncStorage.setItem('my_token', access_token);
            if (newRefreshToken) {
              await AsyncStorage.setItem('refresh_token', newRefreshToken);
            }
            
            // Update store with new authentication state
            const store = useStore.getState();
            store.setAuthenticated(true, access_token, user?.id || store.userId || '');
            
            // Retry original request
            if (originalRequest) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear tokens and logout
            await handleLogout();
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token, logout
          console.log('No refresh token available, logging out');
          try {
            const keys = await AsyncStorage.getAllKeys();
            console.log('Available storage keys:', keys);
          } catch (keysError) {
            console.log('Could not get storage keys:', keysError);
          }
          await handleLogout();
          return Promise.reject(error);
        }
      } catch (storageError) {
        console.error('Error accessing storage during token refresh:', storageError);
        await handleLogout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle logout
const handleLogout = async () => {
  try {
    // Clear stored tokens
    await AsyncStorage.removeItem('my_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user_id');
    
    // Update store state
    const store = useStore.getState();
    store.logout();
    
    console.log('User logged out due to token expiration');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

// Helper function to set auth tokens
export const setAuthTokens = async (accessToken: string, refreshToken?: string, userId?: string) => {
  try {
    await AsyncStorage.setItem('my_token', accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem('refresh_token', refreshToken);
    }
    if (userId) {
      await AsyncStorage.setItem('user_id', userId);
    }
  } catch (error) {
    console.error('Error setting auth tokens:', error);
  }
};

// Helper function to clear auth tokens
export const clearAuthTokens = async () => {
  try {
    await AsyncStorage.removeItem('my_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user_id');
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
};

export default axiosInstance;

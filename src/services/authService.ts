import { API_CONFIG } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useStore from '../store/useStore';
import {pushNotifications} from '@macro-meals/push-notifications';
import axiosInstance from './axios';

const API_URL = `${API_CONFIG.BASE_URL}/api/v1`;

interface SignupResponse {
    message: string;
    user: {
        id?: string;
        email: string;
    };
    session?: {
        access_token?: string;
        refresh_token?: string;
    };
}

interface SignupData {
    email: string;
    password: string;
    nickname?: string;
}

interface LoginCredentials {
    email: string;
    password: string;
    fcm_token?: string;
}

export const authService = {
    login: async (credentials: LoginCredentials) => {
        try {
            // Use stored FCM token from app initialization, or get a new one if needed
            let fcmToken = await AsyncStorage.getItem('fcm_token');
            if (fcmToken) {
                console.log('FCM TOKEN FROM APP INITIALIZATION', fcmToken);
                console.log('Using stored FCM token from app initialization');
            } else {
                console.log('No stored FCM token, attempting to get a new one...');
                try {
                    fcmToken = await pushNotifications.getFCMToken();
                    if (fcmToken) {
                        await AsyncStorage.setItem('fcm_token', fcmToken);
                        console.log('New FCM token obtained and stored:', fcmToken);
                    } else {
                        console.log('Failed to get new FCM token, continuing without push notifications');
                    }
                } catch (error) {
                    console.log('Error getting FCM token:', error);
                }
            }

            // Prepare login payload with FCM token if available
            const loginPayload = {
                email: credentials.email,
                password: credentials.password,
                ...(fcmToken && { fcm_token: fcmToken })
            };

            console.log('Login payload being sent:', {
                email: loginPayload.email,
                hasFcmToken: !!loginPayload.fcm_token,
                fcmTokenLength: loginPayload.fcm_token?.length
            });

            const response = await axiosInstance.post('/auth/login', loginPayload);
            
            console.log('Login response status:', response.status);
            console.log('Login response data:', response.data);
            
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    
    signup: async (data: SignupData) => {
        try {
            const response = await axiosInstance.post('/auth/signup', {
                email: data.email,
                password: data.password,
            });

            return response.data.user.id;
        } catch (error) {
            console.error('Signup service error:', error);
            throw error;
        }
    },
    
    logout: async () => {
        try {
            // Remove tokens from AsyncStorage
            await AsyncStorage.removeItem('my_token');
            await AsyncStorage.removeItem('refresh_token');
            await AsyncStorage.removeItem('user_id');
            await AsyncStorage.removeItem('fcm_token'); // Clear FCM token on logout
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    // Function to refresh FCM token
    refreshFCMToken: async () => {
        try {
            console.log('Refreshing FCM token...');
            const newToken = await pushNotifications.getFCMToken();
            
            if (newToken) {
                await AsyncStorage.setItem('fcm_token', newToken);
                console.log('FCM token refreshed and stored successfully');
                return newToken;
            } else {
                console.log('Failed to refresh FCM token');
                return null;
            }
        } catch (error) {
            console.error('Error refreshing FCM token:', error);
            return null;
        }
    },

    // Function to get current FCM token
    getFCMToken: async () => {
        try {
            return await AsyncStorage.getItem('fcm_token');
        } catch (error) {
            console.error('Error getting FCM token:', error);
            return null;
        }
    },

    forgotPassword: async(email: string) => {
        try {
            const response = await axiosInstance.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    },
    
    verifyCode: async (params: { email: string, otp: string }) => {
        try {
            const response = await axiosInstance.post('/auth/verify-otp', params);
            console.log('responseData', response.data);
            return response.data;
        } catch (error) {
            console.error('Verification error:', error);
            throw error;
        }
    },
    
    verifyEmail: async (params: { email: string, otp: string }) => {
        try {
            const response = await axiosInstance.post('/auth/verify-email', params);
            console.log('responseData', response.data);
            return response.data;
        } catch (error) {
            console.error('Verification error:', error);
            throw error;
        }
    },
    

    resetPassword: async (resetPasswordData: { email: string, session_token: string, new_password: string }) => {
        try {
            const response = await axiosInstance.post('/auth/reset-password', resetPasswordData);
            return response.data;
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    },
    
    getCurrentToken: async () => {
        try {
            return await AsyncStorage.getItem('my_token');
        } catch (error) {
            console.error('Get token error:', error);
            return null;
        }
    },

    requestPasswordReset: async (email: string) => {
        try {
            const response = await axiosInstance.post('/auth/reset-password', { email });
            return response.data;
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    },

    resendVerificationCode: async (params: { email: string }) => {
        try {
            const response = await axiosInstance.post('/auth/resend-otp', params);
            return response.data;
        } catch (error) {
            console.error('Resend verification code error:', error);
            throw error;
        }
    },
    
    resendEmailVerification: async (params: { email: string }) => {
        try {
            const response = await axiosInstance.post('/auth/resend-verification', params);
            return response.data;
        } catch (error) {
            console.error('Resend verification code error:', error);
            throw error;
        }
    },

    deleteAccount: async () => {
        try {
            // Clear all authentication data from AsyncStorage
            await AsyncStorage.removeItem('my_token');
            await AsyncStorage.removeItem('refresh_token');
            await AsyncStorage.removeItem('user_id');
            await AsyncStorage.removeItem('fcm_token');
            
            // Call the store logout to clear state
            useStore.getState().logout();
        } catch (error) {
            // Even if there's an error, still try to logout
            useStore.getState().logout();
            throw error;
        }
    }
};

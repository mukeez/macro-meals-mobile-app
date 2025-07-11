import { API_CONFIG } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useStore from '../store/useStore';
import {pushNotifications} from '@macro-meals/push-notifications';

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

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginPayload),
            });
            const responseData = await response.json();
            
            console.log('Login response status:', response.status);
            console.log('Login response data:', responseData);
            
            if (!response.ok) {
            throw new Error(
                responseData.message ||
                responseData.detail ||
                'Login failed'
            );
        }
        return responseData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    signup: async (data: SignupData) => {
        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
            throw new Error(
                responseData.message ||
                responseData.detail ||
                'Signup failed'
            );
        }

            return responseData.user.id;
        } catch (error) {
            console.error('Signup service error:', error);
            throw error;
        }
    },
    logout: async () => {
        try {
            // Remove tokens from AsyncStorage
            await AsyncStorage.removeItem('access_token');
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
        try{
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.message || 'Forgot password failed');
            }

            return responseData;
        }catch (error){
            console.error('Forgot password error:', error);
        }
    },
    verifyCode: async (params: { email: string, otp: string }) => {
        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
            const responseData = await response.json();
            if (!response.ok) {

                throw new Error(responseData.message || 'Verification failed');
            }
            console.log('responseData', responseData);
            return responseData;
        } catch (error) {
            console.error('Verification error:', error);
            throw error;
        }
    },
    verifyEmail: async (params: { email: string, otp: string }) => {
        try {
            const response = await fetch(`${API_URL}/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
            const responseData = await response.json();
            if (!response.ok) {

                throw new Error(responseData.message || 'Verification failed');
            }
            console.log('responseData', responseData);
            return responseData;
        } catch (error) {
            console.error('Verification error:', error);
            throw error;
        }
    },
    

    resetPassword: async (resetPasswordData: { email: string, session_token: string, new_password: string }) => {
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resetPasswordData),
            });
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || 'Password reset failed');
            }   

            return responseData;
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    },
    getCurrentToken: async () => {
        try {
            return await AsyncStorage.getItem('access_token');
        } catch (error) {
            console.error('Get token error:', error);
            return null;
        }
    },

    requestPasswordReset: async (email: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.detail || 'Password reset request failed');
            }

            return responseData;
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    },

    resendVerificationCode: async (params: { email: string }) => {
        try {
            const response = await fetch(`${API_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to resend verification code');
            }
            return responseData;
        } catch (error) {
            console.error('Resend verification code error:', error);
            throw error;
        }
    },
       resendEmailVerification: async (params: { email: string }) => {
        try {
            const response = await fetch(`${API_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to resend verification code');
            }
            return responseData;
        } catch (error) {
            console.error('Resend verification code error:', error);
            throw error;
        }
    },

    deleteAccount: async () => {
        try {
            // Clear all authentication data from AsyncStorage
            await AsyncStorage.removeItem('my_token');
            await AsyncStorage.removeItem('user_id');
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('refresh_token');
            
            // Call the store logout to clear state
            useStore.getState().logout();
        } catch (error) {
            // Even if there's an error, still try to logout
            useStore.getState().logout();
            throw error;
        }
    }
};

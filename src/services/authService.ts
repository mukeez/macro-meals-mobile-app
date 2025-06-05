import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.macromealsapp.com/api/v1';

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


export const authService = {
    login: async (credentials) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
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

            return await response.json();
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
                    nickname: data.nickname || ''
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Signup failed');
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
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
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
            console.log('params', params);
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
            const responseData = await response.json();
            if (!response.ok) {
                console.log('responseData', responseData);
                throw new Error(responseData.message || 'Verification failed');
            }
            console.log('responseData', responseData);
            return responseData;
        } catch (error) {
            console.error('Verification error:', error);
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
    }
};
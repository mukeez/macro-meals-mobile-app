// src/services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.macromealsapp.com/api/v1';

interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

interface LoginData {
    email: string;
    password: string;
}

interface SignupData {
    email: string;
    password: string;
}

export const authService = {
    login: async (data: LoginData): Promise<LoginResponse> => {
        console.log(API_URL)
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            console.log("here", data)

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const responseData = await response.json();

            // Store token in AsyncStorage
            await AsyncStorage.setItem('auth_token', responseData.token);

            return responseData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    signup: async (data: SignupData): Promise<LoginResponse> => {
        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Signup failed');
            }

            const responseData = await response.json();

            // Store token in AsyncStorage
            await AsyncStorage.setItem('auth_token', responseData.token);

            return responseData;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    },

    logout: async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem('auth_token');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    getToken: async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem('auth_token');
        } catch (error) {
            console.error('Get token error:', error);
            return null;
        }
    },
};
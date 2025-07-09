import AsyncStorage from '@react-native-async-storage/async-storage';

let currentToken: string | null = null;

export const authTokenService = {
    getToken: async () => {
        try {
            return await AsyncStorage.getItem('my_token');
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },
    setToken: (token: string | null) => {
        if (token) {
            AsyncStorage.setItem('my_token', token);
            currentToken = token;
        } else {
            AsyncStorage.removeItem('my_token');
            currentToken = null;
        }
    },
    clearToken: async () => {
        await AsyncStorage.removeItem('my_token');
        currentToken = null;
    },
    initialize: async () => {
        try {
            const token = await AsyncStorage.getItem('my_token');
            currentToken = token;
            return token;
        } catch (error) {
            console.error('Error initializing auth token:', error);
            return null;
        }
    }
}; 
import AsyncStorage from '@react-native-async-storage/async-storage';

let currentToken: string | null = null;

export const authTokenService = {
    getToken: () => {
        return null;
    },
    setToken: (token: string | null) => {
        if (token) {
            AsyncStorage.setItem('my_token', token);
        } else {
            AsyncStorage.removeItem('my_token');
        }
    },
    clearToken: async () => {
        await AsyncStorage.removeItem('my_token');
    },
    initialize: async () => {
        try {
            const token = await AsyncStorage.getItem('my_token');
            return token;
        } catch (error) {
            console.error('Error initializing auth token:', error);
            return null;
        }
    }
}; 
import AsyncStorage from '@react-native-async-storage/async-storage';

let currentToken: string | null = null;
let currentRefreshToken: string | null = null;

export const authTokenService = {
    getToken: async () => {
        try {
            return await AsyncStorage.getItem('my_token');
        } catch (error) {
            console.error('Error getting token:', error);
        return null;
        }
    },
    
    getRefreshToken: async () => {
        try {
            return await AsyncStorage.getItem('refresh_token');
        } catch (error) {
            console.error('Error getting refresh token:', error);
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
    
    setRefreshToken: (refreshToken: string | null) => {
        if (refreshToken) {
            AsyncStorage.setItem('refresh_token', refreshToken);
            currentRefreshToken = refreshToken;
        } else {
            AsyncStorage.removeItem('refresh_token');
            currentRefreshToken = null;
        }
    },
    
    setTokens: (accessToken: string | null, refreshToken: string | null) => {
        authTokenService.setToken(accessToken);
        authTokenService.setRefreshToken(refreshToken);
    },
    
    clearToken: async () => {
        await AsyncStorage.removeItem('my_token');
        currentToken = null;
    },
    
    clearRefreshToken: async () => {
        await AsyncStorage.removeItem('refresh_token');
        currentRefreshToken = null;
    },
    
    clearTokens: async () => {
        await Promise.all([
            authTokenService.clearToken(),
            authTokenService.clearRefreshToken()
        ]);
    },
    
    initialize: async () => {
        try {
            const [token, refreshToken] = await Promise.all([
                AsyncStorage.getItem('my_token'),
                AsyncStorage.getItem('refresh_token')
            ]);
            currentToken = token;
            currentRefreshToken = refreshToken;
            return token;
        } catch (error) {
            console.error('Error initializing auth tokens:', error);
            return null;
        }
    }
}; 
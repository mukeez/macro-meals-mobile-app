import AsyncStorage from '@react-native-async-storage/async-storage';

let currentToken: string | null = null;

export const authTokenService = {
    getToken: () => currentToken,
    
    setToken: (token: string | null) => {
        currentToken = token;
        if (token) {
            AsyncStorage.setItem('token', token);
        } else {
            AsyncStorage.removeItem('token');
        }
    },
    
    initialize: async () => {
        const token = await AsyncStorage.getItem('token');
        currentToken = token;
        return token;
    }
}; 
export const mockSocialAuth = {
    googleSignIn: async () => {
        console.log('Mock Google sign-in');
        return {
            token: 'mock-token',
            user: { id: 'mock-id', email: 'mock@example.com' }
        };
    },

    appleSignIn: async () => {
        console.log('Mock Apple sign-in');
        return {
            token: 'mock-token',
            user: { id: 'mock-id', email: 'mock@example.com' }
        };
    },

    facebookSignIn: async () => {
        console.log('Mock Facebook sign-in');
        return {
            token: 'mock-token',
            user: { id: 'mock-id', email: 'mock@example.com' }
        };
    }
};
// src/services/socialAuthService.ts
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { authService } from './authService';

import appleAuth, {
    AppleAuthRequestOperation,
    AppleAuthRequestScope,
} from '@invertase/react-native-apple-authentication';

import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

// Initialize Google Sign-In in your App.tsx or earlier
export const initGoogleSignIn = () => {
    GoogleSignin.configure({
        webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Get this from Google Cloud Console
        offlineAccess: false,
    });
};




export const socialAuthService = {
    // Google Sign In
    signInWithGoogle: async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            // Send the ID token to your backend to verify and create a session
            const response = await fetch('https://api.macromate.com/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken: userInfo.idToken }),
            });

            if (!response.ok) {
                throw new Error('Google authentication failed on server');
            }

            const authData = await response.json();
            return authData;
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('Google sign in cancelled');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Google sign in already in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Google Play services not available');
            } else {
                console.error('Google sign in error:', error);
            }
            throw error;
        }
    },
    signInWithApple: async () => {
        // Check if Apple Sign In is available on this device
        if (!appleAuth.isSupported) {
            throw new Error('Apple Sign In is not supported on this device');
        }

        try {
            // Request credentials
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: AppleAuthRequestOperation.LOGIN,
                requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
            });

            // Ensure Apple returned a user identityToken
            if (!appleAuthRequestResponse.identityToken) {
                throw new Error('Apple Sign In failed - no identity token returned');
            }

            // Send token to your backend
            const response = await fetch('https://api.macromate.com/auth/apple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identityToken: appleAuthRequestResponse.identityToken,
                    user: appleAuthRequestResponse.user,
                    fullName: appleAuthRequestResponse.fullName,
                    email: appleAuthRequestResponse.email,
                }),
            });

            if (!response.ok) {
                throw new Error('Apple authentication failed on server');
            }

            const authData = await response.json();
            return authData;
        } catch (error) {
            console.error('Apple sign in error:', error);
            throw error;
        }
    },
    signInWithFacebook: async () => {
        try {
            // Request login with permissions
            const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

            if (result.isCancelled) {
                throw new Error('Facebook login was cancelled');
            }

            // Get access token
            const data = await AccessToken.getCurrentAccessToken();

            if (!data) {
                throw new Error('Failed to get Facebook access token');
            }

            // Send token to your backend
            const response = await fetch('https://api.macromate.com/auth/facebook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accessToken: data.accessToken.toString() }),
            });

            if (!response.ok) {
                throw new Error('Facebook authentication failed on server');
            }

            const authData = await response.json();
            return authData;
        } catch (error) {
            console.error('Facebook sign in error:', error);
            throw error;
        }
    },
};
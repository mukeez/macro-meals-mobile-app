// src/services/socialAuthService.ts
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { authService } from './authService';
import axiosInstance from './axios';

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
    signInWithGoogle: async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            const response = await axiosInstance.post('/auth/google', { 
                idToken: userInfo.idToken 
            });

            return response.data;
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
        if (!appleAuth.isSupported) {
            throw new Error('Apple Sign In is not supported on this device');
        }

        try {
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: AppleAuthRequestOperation.LOGIN,
                requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
            });

            if (!appleAuthRequestResponse.identityToken) {
                throw new Error('Apple Sign In failed - no identity token returned');
            }

            const response = await axiosInstance.post('/auth/apple', {
                identityToken: appleAuthRequestResponse.identityToken,
                user: appleAuthRequestResponse.user,
                fullName: appleAuthRequestResponse.fullName,
                email: appleAuthRequestResponse.email,
            });

            return response.data;
        } catch (error) {
            console.error('Apple sign in error:', error);
            throw error;
        }
    },
    
    signInWithFacebook: async () => {
        try {
            const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

            if (result.isCancelled) {
                throw new Error('Facebook login was cancelled');
            }

            // Get access token
            const data = await AccessToken.getCurrentAccessToken();

            if (!data) {
                throw new Error('Failed to get Facebook access token');
            }

            const response = await axiosInstance.post('/auth/facebook', { 
                accessToken: data.accessToken.toString() 
            });

            return response.data;
        } catch (error) {
            console.error('Facebook sign in error:', error);
            throw error;
        }
    },
};
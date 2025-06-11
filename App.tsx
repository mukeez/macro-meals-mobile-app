/** @jsxImportSource react */
import React, {useEffect, useState} from 'react';
import { View, ActivityIndicator } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import useStore from "./src/store/useStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {RootStack} from "./RootStack";
import { MIXPANEL_TOKEN } from '@env';
import { MixpanelProvider } from "@macro-meals/mixpanel";
import {pushNotifications} from '@macro-meals/push-notifications';
import messaging from '@react-native-firebase/messaging';
import { OnboardingContext } from './src/contexts/OnboardingContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const { setAuthenticated, isAuthenticated } = useStore();
    
    const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
    const [initialAuthScreen, setInitialAuthScreen] = useState('LoginScreen');

    useEffect(() => {
        async function initializeApp() {
            const firebaseConfig = {
                appId: '1:733994435613:android:370718471c48417e6372f4',
                projectId: 'macro-meals-mobile',
                storageBucket: 'macro-meals-mobile.firebasestorage.app',
                apiKey: 'AIzaSyC4ai-iWprvfuWB52UeFb62TirjBytkI8k',
                messagingSenderId: '733994435613',
                databaseURL: 'https://macro-meals-mobile.firebaseio.com',
                authDomain: 'macro-meals-mobile.firebaseapp.com'
            }

            async function initializeFirebase() {
                try {
                    // If firebase has not been initialized
                    if (!firebase.apps.length) {
                        await firebase.initializeApp(firebaseConfig);
                    }

                    // Request notification permissions
                    const permission = await pushNotifications.requestPermissions();

                    if (permission) {
                        // Get FCM token only after permissions are granted
                        const token = await messaging().getToken();
                        await pushNotifications.intializeMessaging();
                        return token;
                    } else {
                        return null;
                    }
                } catch (error) {
                    console.error('[FIREBASE] ❌ Error:', error);
                    return null;
                }
            }

            initializeFirebase();
            
            try {
                // Load fonts
                await Font.loadAsync({
                    'UncutSans': require('./assets/fonts/Uncut-Sans-Regular.otf'),
                    'UncutSans-Bold': require('./assets/fonts/Uncut-Sans-Bold.otf'),
                    'UncutSans-Medium': require('./assets/fonts/Uncut-Sans-Medium.otf'),
                    'UncutSans-Semibold': require('./assets/fonts/Uncut-Sans-Semibold.otf'),
                });

                // Check both onboarding and auth status in parallel
                const [onboardingCompleted, token, userId] = await Promise.all([
                    AsyncStorage.getItem('isOnboardingCompleted'),
                    AsyncStorage.getItem('my_token'),
                    AsyncStorage.getItem('user_id')
                ]);

                // Set onboarding status
                setIsOnboardingCompleted(onboardingCompleted === 'true');

                // Only set authenticated if we have both token and userId
                if (token && userId) {
                    console.log('Found stored credentials, setting authenticated');
                    setAuthenticated(true, token, userId);
                } else {
                    console.log('No stored credentials, setting unauthenticated');
                    setAuthenticated(false, '', '');
                }
            } catch (error) {
                console.error('Error initializing app:', error);
                // Ensure we're unauthenticated on error
                setAuthenticated(false, '', '');
            } finally {
                setIsLoading(false);
                // Hide splash screen after initialization
                await SplashScreen.hideAsync();
            }
        }

        initializeApp();
    }, []);

    console.log('Current auth state:', isAuthenticated);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <MixpanelProvider config={{
            token: MIXPANEL_TOKEN,
        }}>
            <OnboardingContext.Provider value={{ setIsOnboardingCompleted, setInitialAuthScreen }} >
                <NavigationContainer>
                    <RootStack 
                        isOnboardingCompleted={isOnboardingCompleted} 
                        initialAuthScreen={initialAuthScreen}
                        isAuthenticated={isAuthenticated}
                    />
                </NavigationContainer>
            </OnboardingContext.Provider>
        </MixpanelProvider>
    );
}


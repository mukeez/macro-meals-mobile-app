import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import useStore from "./src/store/useStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {RootStack} from "./RootStack";
import { OnboardingContext } from './src/contexts/OnboardingContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
setTimeout (()=> {
    SplashScreen.hideAsync();
}, 3000);



export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const { setAuthenticated, isAuthenticated } = useStore();
    const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
    const [initialAuthScreen, setInitialAuthScreen] = useState('LoginScreen');

    useEffect(() => {
        const initializeApp = async () => {
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
                    setAuthenticated(false, null, null);
                }
            } catch (error) {
                console.error('Error initializing app:', error);
                // Ensure we're unauthenticated on error
                setAuthenticated(false, null, null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeApp();
    }, []);

    console.log('Current auth state:', isAuthenticated);

    if (isLoading) {
        return null;
    }

    return (
        <OnboardingContext.Provider value={{ setIsOnboardingCompleted, setInitialAuthScreen }} >
            <NavigationContainer>
                <RootStack 
                    isOnboardingCompleted={isOnboardingCompleted} 
                    initialAuthScreen={initialAuthScreen}
                    isAuthenticated={isAuthenticated}
                />
            </NavigationContainer>
        </OnboardingContext.Provider>
    );
}
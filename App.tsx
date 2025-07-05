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
// import {pushNotifications} from '@macro-meals/push-notifications';
// import messaging from '@react-native-firebase/messaging';
import { OnboardingContext } from './src/contexts/OnboardingContext';
import { HasMacrosContext } from 'src/contexts/HasMacrosContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const { setAuthenticated, isAuthenticated } = useStore();
    
    const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
    const [initialAuthScreen, setInitialAuthScreen] = useState('LoginScreen');
    const [hasMacros, setHasMacros] = useState(false);
    const [readyForDashboard, setReadyForDashboard] = useState(false);

    useEffect(() => {
        async function initializeApp() {
            console.log('Starting app initialization...');
            try {
                // Clear auth state but preserve onboarding flag
                await Promise.all([
                    AsyncStorage.removeItem('my_token'),
                    AsyncStorage.removeItem('user_id')
                ]);

                // Check onboarding status first
                const onboardingCompleted = await AsyncStorage.getItem('isOnboardingCompleted');
                setIsOnboardingCompleted(onboardingCompleted === 'true');

                // Start with unauthenticated state
                console.log('Setting initial unauthenticated state...');
                setAuthenticated(false, '', '');
                setHasMacros(false);
                setReadyForDashboard(false);

                // Load fonts
                await Font.loadAsync({
                    'UncutSans': require('./assets/fonts/Uncut-Sans-Regular.otf'),
                    'UncutSans-Bold': require('./assets/fonts/Uncut-Sans-Bold.otf'),
                    'UncutSans-Medium': require('./assets/fonts/Uncut-Sans-Medium.otf'),
                    'UncutSans-Semibold': require('./assets/fonts/Uncut-Sans-Semibold.otf'),
                });

                // Check auth status
                const [token, userId] = await Promise.all([
                    AsyncStorage.getItem('my_token'),
                    AsyncStorage.getItem('user_id'),
                ]);

                console.log('Retrieved stored values:', {
                    onboardingCompleted,
                    hasToken: !!token,
                    hasUserId: !!userId
                });
                
                // Only proceed with auth check if we have both token and userId
                if (token && userId) {
                    console.log('Found stored credentials, validating token...');
                    try {
                        // Fetch user profile to validate token
                        const profileResponse = await fetch('https://api.macromealsapp.com/api/v1/user/me', {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        });
                        
                        if (profileResponse.ok) {
                            const profile = await profileResponse.json();
                            console.log('Token valid, setting authenticated state with profile:', profile);
                            // Set states in correct order
                            setHasMacros(profile.has_macros);
                            setReadyForDashboard(profile.has_macros);
                            setAuthenticated(true, token, userId);
                        } else {
                            console.log('Token validation failed, clearing credentials');
                            await Promise.all([
                                AsyncStorage.removeItem('my_token'),
                                AsyncStorage.removeItem('user_id')
                            ]);
                        }
                    } catch (error) {
                        console.error('Error validating token:', error);
                        // Clear stored credentials on error
                        await Promise.all([
                            AsyncStorage.removeItem('my_token'),
                            AsyncStorage.removeItem('user_id')
                        ]);
                    }
                } else {
                    console.log('No stored credentials found, staying unauthenticated');
                }
            } catch (error) {
                console.error('Error initializing app:', error);
            } finally {
                setIsLoading(false);
                // Add delay before hiding splash screen
                await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds delay
                await SplashScreen.hideAsync();
            }
        }

        initializeApp();
    }, []);

    // Add state logging
    useEffect(() => {
        console.log('Current app state:', {
            isAuthenticated,
            hasMacros,
            readyForDashboard,
            isOnboardingCompleted
        });
    }, [isAuthenticated, hasMacros, readyForDashboard, isOnboardingCompleted]);

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
                <HasMacrosContext.Provider value={{ 
                    hasMacros, 
                    setHasMacros,
                    readyForDashboard,
                    setReadyForDashboard 
                }}>
                <NavigationContainer>
                    <RootStack 
                        isOnboardingCompleted={isOnboardingCompleted} 
                        initialAuthScreen={initialAuthScreen}
                        isAuthenticated={isAuthenticated}
                        hasMacros={hasMacros}
                        readyForDashboard={readyForDashboard}
                    />
                </NavigationContainer>
                </HasMacrosContext.Provider>
            </OnboardingContext.Provider>
        </MixpanelProvider>
    );
}


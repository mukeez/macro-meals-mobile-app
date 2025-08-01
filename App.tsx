/** @jsxImportSource react */
import React, {useEffect, useState} from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
// import firebase from '@react-native-firebase/app';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import useStore from "./src/store/useStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {RootStack} from "./RootStack";
import { MixpanelProvider, useMixpanel } from "@macro-meals/mixpanel";
import {pushNotifications} from '@macro-meals/push-notifications';
import { firebase } from '@react-native-firebase/messaging';
import {macroMealsCrashlytics} from '@macro-meals/crashlytics';
import { OnboardingContext } from './src/contexts/OnboardingContext';
import { HasMacrosContext } from 'src/contexts/HasMacrosContext';
import Constants from 'expo-constants';
import { userService } from './src/services/userService';
import { authService } from './src/services/authService';
import { RemoteConfigProvider, useRemoteConfigContext } from '@macro-meals/remote-config-service';
import { IsProContext } from 'src/contexts/IsProContext';
import Config from 'react-native-config';
import { validateSession, SessionValidationResult } from './src/services/sessionService';
import { debugService } from './src/services/debugService';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Component to handle Mixpanel identification for authenticated users
function MixpanelIdentifier() {
    const { isAuthenticated, userId } = useStore();
    const mixpanel = useMixpanel();

    useEffect(() => {
        if (isAuthenticated && userId && mixpanel) {
            // Identify the user in Mixpanel
            mixpanel.identify(userId);
            
            // Set basic user properties
            mixpanel.setUserProperties({
                user_id: userId,
                is_authenticated: true
            });
            
        }
    }, [isAuthenticated, userId, mixpanel]);

    return null;
}

// Component to handle Remote Config updates
function RemoteConfigHandler() {
    const { lastUpdate, error, isInitialized } = useRemoteConfigContext();

    useEffect(() => {
        if (lastUpdate && lastUpdate.updatedKeys.length > 0) {
            console.log('[REMOTE CONFIG] 🔄 Config update received in handler:', {
                updatedKeys: lastUpdate.updatedKeys,
                totalUpdatedKeys: lastUpdate.updatedKeys.length,
                timestamp: new Date().toISOString()
            });
            
            // Handle specific config updates here
            lastUpdate.updatedKeys.forEach((key, index) => {
                
                // Add your custom logic for specific keys here
                // For example:
                // if (key === 'feature_flags') {
                //     console.log('[REMOTE CONFIG] 🎛️ Feature flags updated, refreshing UI...');
                //     // Handle feature flags update
                // }
                // if (key === 'dev_mode') {
                //     console.log('[REMOTE CONFIG] 🛠️ Dev mode setting updated');
                //     // Handle dev mode update
                // }
            });
        }
    }, [lastUpdate]);

    useEffect(() => {
        if (error) {
            console.error('[REMOTE CONFIG] ❌ Error in handler:', {
                error,
                timestamp: new Date().toISOString()
            });
        }
    }, [error]);

    useEffect(() => {
        if (isInitialized) {
            console.log('[REMOTE CONFIG] ✅ Service initialized successfully in handler', {
                timestamp: new Date().toISOString()
            });
        }
    }, [isInitialized]);

    return null;
}

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSessionValidated, setIsSessionValidated] = useState(false);
    const { setAuthenticated, isAuthenticated } = useStore();
    
    const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
    const [initialAuthScreen, setInitialAuthScreen] = useState('LoginScreen');
    const [hasMacros, setHasMacros] = useState(false);
    const [isPro, setIsPro] = useState(false);
    const [readyForDashboard, setReadyForDashboard] = useState(false);
    console.log('MIXPANEL_TOKEN', Config.MIXPANEL_TOKEN);
    console.log('🔍 Current environment:', Config.ENVIRONMENT);
    console.log('🎨 App icon should be:', Config.ENVIRONMENT === 'development' ? 'dev' : Config.ENVIRONMENT === 'staging' ? 'stg' : 'prod');

    useEffect(() => {
        async function initializeApp() {
            console.log('Starting app initialization...');
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
                        
                        // Enable crashlytics and add initial metadata
                        await firebase.crashlytics().setCrashlyticsCollectionEnabled(true);
                        await firebase.crashlytics().setAttribute('environment', __DEV__ ? 'development' : 'production');
                        
                        // Log app start
                        firebase.crashlytics().log('App initialized');
                        macroMealsCrashlytics.log('App initialized');
                        
                        // Test crashlytics is working (remove in production)
                        if (__DEV__) {
                            firebase.crashlytics().recordError(new Error('Test error - Debug build'));
                        }
                    }

                    // Set app attributes after initialization
                    macroMealsCrashlytics.setAppAttributes({
                        appVersion: Constants.expoConfig?.version || '1.0.0',
                        buildNumber: Platform.select({
                            ios: Constants.expoConfig?.ios?.buildNumber,
                            android: Constants.expoConfig?.android?.versionCode?.toString()
                        }) || '1',
                        environment: __DEV__ ? 'development' : 'production',
                        deviceModel: Constants.deviceName || 'Unknown',
                    });

                    // Request notification permissions
                    const permission = await pushNotifications.requestPermissions();

                    if (permission) {
                        // Get FCM token only after permissions are granted
                        const token = await pushNotifications.getFCMToken();
                        console.log('THIS IS \n\n\n\n\nFCM TOKEN:', token);
                        await pushNotifications.intializeMessaging();
                        
                        // Check for initial notification (app opened from notification)
                        await pushNotifications.getInitialNotification();
                        // console.log('FCM TOKEN:', token);
                        

                        
                        return token;
                    } else {
                        return null;
                    }
                } catch (error) {
                    console.error('[FIREBASE] ❌ Error:', error);
                    // Log the error to crashlytics
                    firebase.crashlytics().recordError(new Error(error as string));
                    return null;
                }
            }
            await initializeFirebase();
            
            try {
                // Check onboarding status first
                const onboardingCompleted = await AsyncStorage.getItem('isOnboardingCompleted');
                setIsOnboardingCompleted(onboardingCompleted === 'true');

                // Don't set authentication state yet - wait for session validation
                console.log('Starting session validation without clearing tokens...');
                setHasMacros(false);
                setIsPro(false);
                setReadyForDashboard(false);

                // Load fonts
                await Font.loadAsync({
                    'UncutSans': require('./assets/fonts/Uncut-Sans-Regular.otf'),
                    'UncutSans-Bold': require('./assets/fonts/Uncut-Sans-Bold.otf'),
                    'UncutSans-Medium': require('./assets/fonts/Uncut-Sans-Medium.otf'),
                    'UncutSans-Semibold': require('./assets/fonts/Uncut-Sans-Semibold.otf'),
                });

                // Debug: Log all stored values
                await debugService.logAllStoredValues();
                await debugService.checkAuthValues();

                // Enhanced session validation
                console.log('🔍 App.tsx - Starting enhanced session validation...');
                console.log('🔍 App.tsx - Current state before validation:', {
                    isAuthenticated,
                    hasMacros,
                    isPro,
                    readyForDashboard,
                    isOnboardingCompleted
                });
                const sessionValidation: SessionValidationResult = await validateSession();
                
                console.log('🔍 App.tsx - Session validation result:', {
                    isValid: sessionValidation.isValid,
                    isComplete: sessionValidation.isComplete,
                    hasUser: !!sessionValidation.user,
                    error: sessionValidation.error
                });

                if (sessionValidation.isValid && sessionValidation.user) {
                    const profile = sessionValidation.user;
                    console.log('🔍 App.tsx - Valid session found, setting authenticated state:', {
                        has_macros: profile.has_macros,
                        is_pro: profile.is_pro,
                        email: profile.email,
                        id: profile.id,
                        sessionComplete: sessionValidation.isComplete
                    });

                    // Set states in correct order
                    setHasMacros(profile.has_macros);
                    setIsPro(!!profile.is_pro); // Convert to boolean to handle undefined/null
                    setReadyForDashboard(profile.has_macros);
                    setAuthenticated(true, profile.id, profile.id);
                    
                    console.log('🔍 App.tsx - Session restored successfully:', {
                        hasMacros: profile.has_macros,
                        isPro: profile.is_pro,
                        readyForDashboard: profile.has_macros,
                        isAuthenticated: true,
                        sessionComplete: sessionValidation.isComplete
                    });
                } else {
                    console.log('🔍 App.tsx - No valid session found:', {
                        error: sessionValidation.error,
                        isValid: sessionValidation.isValid,
                        isComplete: sessionValidation.isComplete
                    });
                    
                    // Set unauthenticated state only if session validation fails
                    setAuthenticated(false, '', '');
                    
                    // Clear any invalid stored credentials
                    if (sessionValidation.error) {
                        await Promise.all([
                            AsyncStorage.removeItem('my_token'),
                            AsyncStorage.removeItem('refresh_token'),
                            AsyncStorage.removeItem('user_id')
                        ]);
                    }
                }
                
                // Mark session validation as complete
                setIsSessionValidated(true);
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
        console.log('🔍 App.tsx - Current app state:', {
            isAuthenticated,
            hasMacros,
            isPro,
            readyForDashboard,
            isOnboardingCompleted
        });
    }, [isAuthenticated, hasMacros, isPro, readyForDashboard, isOnboardingCompleted]);

    // Add specific logging for isPro changes
    useEffect(() => {
        console.log('🔍 App.tsx - isPro state changed:', isPro);
    }, [isPro]);

    // Log state right before RootStack render
    console.log('🔍 App.tsx - Passing to RootStack:', {
        isAuthenticated,
        hasMacros,
        isPro,
        readyForDashboard,
        isOnboardingCompleted,
        isSessionValidated
    });

    // Periodic FCM token refresh
    // useEffect(() => {
    //     if (isAuthenticated) {
    //         const refreshInterval = setInterval(async () => {
    //             try {
    //                 await authService.refreshAndUpdateFCMToken();
    //             } catch (error) {
    //                 console.log('Error during periodic FCM token refresh:', error);
    //             }
    //         }, 24 * 60 * 60 * 1000); // Refresh every 24 hours

    //         return () => clearInterval(refreshInterval);
    //     }
    // }, [isAuthenticated]);

    if (isLoading || !isSessionValidated) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <MixpanelProvider config={{
                            token: Config.MIXPANEL_TOKEN as string,
        }}>
            <RemoteConfigProvider
                defaults={{
                    // Add your default remote config values here
                    feature_flags: '{}',
                    app_settings: '{}',
                    maintenance_mode: 'false',
                    welcome_message: 'Welcome to Macro Meals!',
                    max_meals_per_day: '10',
                    subscription_enabled: 'true',
                    dev_mode: __DEV__ ? 'true' : 'false',
                }}
                settings={{
                    minimumFetchIntervalMillis: 30000, // 30 seconds minimum fetch interval
                }}
                enableRealTimeUpdates={true}
                onConfigUpdate={(event, error) => {
                    if (error) {
                        console.error('[REMOTE CONFIG] Update error:', error);
                    } else {
                        console.log('[REMOTE CONFIG] Config updated successfully:', event.updatedKeys);
                    }
                }}
            >
                <OnboardingContext.Provider value={{ setIsOnboardingCompleted, setInitialAuthScreen }} >
                    <HasMacrosContext.Provider value={{ 
                        hasMacros, 
                        setHasMacros,
                        readyForDashboard,
                        setReadyForDashboard 
                    }}>
                        <IsProContext.Provider value={{ isPro, setIsPro }}>
                            <NavigationContainer>
                                <MixpanelIdentifier />
                                <RemoteConfigHandler />
                                <RootStack 
                                    isOnboardingCompleted={isOnboardingCompleted} 
                                    initialAuthScreen={initialAuthScreen}
                                    isAuthenticated={isAuthenticated}
                                />
                            </NavigationContainer>
                        </IsProContext.Provider>
                    </HasMacrosContext.Provider>
                </OnboardingContext.Provider>
            </RemoteConfigProvider>
        </MixpanelProvider>
    );
}


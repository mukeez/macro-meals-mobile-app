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
import { MIXPANEL_TOKEN } from '@env';
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
    const { setAuthenticated, isAuthenticated } = useStore();
    
    const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
    const [initialAuthScreen, setInitialAuthScreen] = useState('LoginScreen');
    const [hasMacros, setHasMacros] = useState(false);
    const [readyForDashboard, setReadyForDashboard] = useState(false);
    console.log('MIXPANEL_TOKEN', MIXPANEL_TOKEN);

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
                        await pushNotifications.intializeMessaging();
                        
                        // Check for initial notification (app opened from notification)
                        await pushNotifications.getInitialNotification();
                        console.log('FCM TOKEN:', token);
                        
                        // Store the FCM token for later use
                        if (token) {
                            await AsyncStorage.setItem('fcm_token', token);
                            console.log('FCM token stored during app initialization:', token);
                            
                            // Try to update FCM token on backend if user is authenticated
                            try {
                                const storedToken = await AsyncStorage.getItem('my_token');
                                if (storedToken) {
                                    await userService.updateFCMToken(token);
                                    console.log('FCM token sent to backend successfully');
                                }
                            } catch (error) {
                                console.log('Could not update FCM token on backend (user may not be logged in):', error);
                            }
                        }
                        
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
                        const profile = await userService.getProfile();
                        console.log('Token valid, setting authenticated state with profile:', profile);
                        // Set states in correct order
                        setHasMacros(profile.has_macros);
                        setReadyForDashboard(profile.has_macros);
                        setAuthenticated(true, token, userId);
                    } catch (error) {
                        console.error('Error validating token:', error);
                        // Clear stored credentials on error
                        await Promise.all([
                            AsyncStorage.removeItem('my_token'),
                            AsyncStorage.removeItem('refresh_token'),
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

    // Periodic FCM token refresh
    useEffect(() => {
        if (isAuthenticated) {
            const refreshInterval = setInterval(async () => {
                try {
                    await authService.refreshAndUpdateFCMToken();
                } catch (error) {
                    console.log('Error during periodic FCM token refresh:', error);
                }
            }, 24 * 60 * 60 * 1000); // Refresh every 24 hours

            return () => clearInterval(refreshInterval);
        }
    }, [isAuthenticated]);

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
            <RemoteConfigProvider
                defaults={{
                    // Add your default remote config values here
                    feature_flags: '{}',
                    app_settings: '{}',
                    maintenance_mode: 'false',
                    welcome_message: 'Welcome to Macro Meals!',
                    max_meals_per_day: '10',
                    subscription_enabled: 'true',
                    dev_mode: 'false',
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
                        <NavigationContainer>
                            <MixpanelIdentifier />
                            <RemoteConfigHandler />
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
            </RemoteConfigProvider>
        </MixpanelProvider>
    );
}


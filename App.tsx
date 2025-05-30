import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';

import useStore from "./src/store/useStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {RootStack} from "./RootStack";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
setTimeout (()=> {
    SplashScreen.hideAsync();
}, 3000);

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const { setAuthenticated } = useStore();
    const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

    useEffect(() => {
      
        const checkAuthStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('access_token');
                const userId = await AsyncStorage.getItem('user_id');

                if (token && userId) {
                    // Restore authentication state
                    setAuthenticated(true, token, userId);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
            } finally {
                setIsLoading(false);
                // Hide splash screen after auth check
                
            }
        };

        checkAuthStatus();
    }, []);

    return (
        <NavigationContainer>
            <RootStack />
        </NavigationContainer>
    );
}
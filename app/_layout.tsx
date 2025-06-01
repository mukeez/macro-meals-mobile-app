import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Slot, useRouter, useSegments } from 'expo-router';
import useStore from '../src/store/useStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { OnboardingContext } from '../src/contexts/OnboardingContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const segments = useSegments();
    const router = useRouter();
    const isAuthenticated = useStore((state) => state.isAuthenticated);
    const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
    const [initialAuthScreen, setInitialAuthScreen] = useState('login');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Check if onboarding is completed
                const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
                if (onboardingCompleted === 'true') {
                    setIsOnboardingCompleted(true);
                }

                // Check if user is logged in
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    useStore.getState().setAuthenticated(true, token, '');
                }
            } catch (e) {
                console.warn('Error loading initial state:', e);
            } finally {
                setIsReady(true);
                await SplashScreen.hideAsync();
            }
        }

        prepare();
    }, []);

    useEffect(() => {
        if (!isReady) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inAppGroup = segments[0] === '(app)';

        if (!isAuthenticated && !inAuthGroup) {
            // Redirect to the auth group
            router.replace(`/(auth)/${initialAuthScreen}`);
        } else if (isAuthenticated && !isOnboardingCompleted && !inAuthGroup) {
            // Redirect to onboarding
            router.replace('/(auth)/onboarding');
        } else if (isAuthenticated && isOnboardingCompleted && inAuthGroup) {
            // Redirect to the app group
            router.replace('/(app)');
        }
    }, [isAuthenticated, segments, isOnboardingCompleted, isReady]);

    if (!isReady) {
        return null;
    }

    return (
        <SafeAreaProvider>
            <OnboardingContext.Provider value={{ setIsOnboardingCompleted, setInitialAuthScreen }}>
                <Slot />
            </OnboardingContext.Provider>
        </SafeAreaProvider>
    );
} 
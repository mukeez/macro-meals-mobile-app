import React from 'react';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import useStore from '../src/store/useStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { Slot, useRouter, useSegments } from 'expo-router';
import { OnboardingContext } from '../src/contexts/OnboardingContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const segments = useSegments();
    const router = useRouter();
    const isAuthenticated = useStore((state) => state.isAuthenticated);
    const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
    const [initialAuthScreen, setInitialAuthScreen] = useState('login');

    useEffect(() => {
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
    }, [isAuthenticated, segments, isOnboardingCompleted]);

    return (
        <OnboardingContext.Provider value={{ setIsOnboardingCompleted, setInitialAuthScreen }}>
            <Slot />
        </OnboardingContext.Provider>
    );
} 
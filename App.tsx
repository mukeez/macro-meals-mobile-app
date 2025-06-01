import React from 'react';
import { ExpoRoot } from 'expo-router';
import { OnboardingContext } from './src/contexts/OnboardingContext';
import { useState } from 'react';

export default function App() {
    const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
    const [initialAuthScreen, setInitialAuthScreen] = useState('login');

    return (
        <OnboardingContext.Provider value={{ setIsOnboardingCompleted, setInitialAuthScreen }}>
            <ExpoRoot context={require.context('./app')} />
        </OnboardingContext.Provider>
    );
}
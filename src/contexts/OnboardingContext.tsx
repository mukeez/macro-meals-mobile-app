import React from 'react';

export const OnboardingContext = React.createContext<{
    setIsOnboardingCompleted: (value: boolean) => void;
    setInitialAuthScreen: (screen: string) => void;
}>({
    setIsOnboardingCompleted: () => {},
    setInitialAuthScreen: () => {},
})
import React from 'react';

export const IsProContext = React.createContext<{
    isPro: boolean;
    setIsPro: (isPro: boolean) => void;
}>({
    isPro: false,
    setIsPro: () => {},
});
import React from 'react';

export const HasMacrosContext = React.createContext<{
    hasMacros: boolean;
    setHasMacros: (hasMacros: boolean) => void;
    readyForDashboard: boolean;
    setReadyForDashboard: (ready: boolean) => void;
}>({
    hasMacros: false,
    setHasMacros: () => {},
    readyForDashboard: false,
    setReadyForDashboard: () => {},
});
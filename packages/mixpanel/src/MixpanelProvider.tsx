import { Mixpanel } from 'mixpanel-react-native';
import React, { createContext, useEffect, useState } from 'react';
import { MixpanelConfig, MixpanelInstance } from './types';

console.log('[DEBUG] MixpanelProvider loaded');

export const MixpanelContext = createContext<MixpanelInstance | null>(null);

export const MixpanelProvider: React.FC<{
    config: MixpanelConfig;
    children: React.ReactNode;

}> = ({ config, children }) => {
    const [mixpanel, setMixpanel] = useState<MixpanelInstance | null>(null);

    useEffect(()=> {
        const instance = new Mixpanel(config.token, true);
        instance.init(true); 
        setMixpanel(instance);
        return ()=> {
            // Cleanup when necessary
            instance.reset();
        }
    }, [config.token]);

    console.log('[DEBUG] MixpanelProvider rendered, mixpanel:', mixpanel);

    if (!mixpanel) {
        // Optionally render a loading indicator here
        return null;
    }

    return (
        <MixpanelContext.Provider value={mixpanel}>
            { children }
        </MixpanelContext.Provider>
    )
};
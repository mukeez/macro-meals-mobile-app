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
        console.log('[DEBUG] MixpanelProvider useEffect - Token:', config.token);
        
        if (!config.token || config.token === 'undefined' || config.token === 'your_actual_mixpanel_token_here') {
            console.warn('[MIXPANEL] ⚠️  Invalid or missing token:', config.token);
            return;
        }

        console.log('[DEBUG] Initializing Mixpanel with token:', config.token.substring(0, 8) + '...');
        
        try {
            const instance = new Mixpanel(config.token, true);
            instance.init(true).then(() => {
                console.log('[MIXPANEL] ✅ Successfully initialized');
                setMixpanel(instance);
            }).catch((error) => {
                console.error('[MIXPANEL] ❌ Initialization failed:', error);
            });
        } catch (error) {
            console.error('[MIXPANEL] ❌ Failed to create instance:', error);
        }

        return ()=> {
            // Cleanup when necessary
            if (mixpanel) {
                mixpanel.reset();
            }
        }
    }, [config.token]);

    console.log('[DEBUG] MixpanelProvider rendered, mixpanel:', !!mixpanel);

    return (
        <MixpanelContext.Provider value={mixpanel}>
            { children }
        </MixpanelContext.Provider>
    )
};
/** @jsxImportSource react */
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';

import useStore from "./src/store/useStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {RootStack} from "./RootStack";
import { MIXPANEL_TOKEN } from '@env';
import { MixpanelProvider } from "@macro-meals/mixpanel";
import { checkNotificationPermission, getFCMToken } from '@macro-meals/push-notifications';

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const { setAuthenticated } = useStore();

    console.log(`MIXPANEL_TOKEN: ${MIXPANEL_TOKEN}`);

    useEffect(() => {
        const permission = checkNotificationPermission();
        console.log('[DEBUG] App.tsx - permission:', permission);
        const token = getFCMToken();
        console.log('[DEBUG] App.tsx - permission:', permission);
        console.log('[DEBUG] App.tsx - token:', token);
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
            }
        };

        checkAuthStatus();
    }, []);

    return (
        <MixpanelProvider config={{
            token: MIXPANEL_TOKEN,
        }}>
            <NavigationContainer>
                <RootStack />
            </NavigationContainer>
        </MixpanelProvider>
    );
}
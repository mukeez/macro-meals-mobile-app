/** @jsxImportSource react */
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import firebase from '@react-native-firebase/app';

import useStore from "./src/store/useStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {RootStack} from "./RootStack";
import { MIXPANEL_TOKEN } from '@env';
import { MixpanelProvider } from "@macro-meals/mixpanel";
import { pushNotifications } from '@macro-meals/push-notifications';

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const { setAuthenticated } = useStore();

    console.log(`MIXPANEL_TOKEN: ${MIXPANEL_TOKEN}`);

    useEffect(() => {
        async function initializeApp(){
            // Initialize Firebase if it hasn't been initialized
        const firebaseConfig = {
            appId: '1:733994435613:android:370718471c48417e6372f4',
            projectId: 'macro-meals-mobile',
            storageBucket: 'macro-meals-mobile.firebasestorage.app',
            apiKey: 'AIzaSyC4ai-iWprvfuWB52UeFb62TirjBytkI8k',
            messagingSenderId: '733994435613'
        }
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        const permission = await pushNotifications.requestPermissions();
        console.log('[DEBUG] App.tsx - permission:', permission);
        if (permission){
            const token = await pushNotifications.getFCMToken();
            console.log('[DEBUG] App.tsx - permission:', permission);
            console.log('[DEBUG] App.tsx - token:', token);
        }
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
        }
        initializeApp();
        
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
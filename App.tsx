/** @jsxImportSource react */
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import firebase from '@react-native-firebase/app';

import useStore from "./src/store/useStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {RootStack} from "./RootStack";
import { MIXPANEL_TOKEN } from '@env';
import { MixpanelProvider } from "@macro-meals/mixpanel";
import {pushNotifications} from '@macro-meals/push-notifications';
import messaging from '@react-native-firebase/messaging';

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const { setAuthenticated } = useStore();

    console.log(`MIXPANEL_TOKEN: ${MIXPANEL_TOKEN}`);
    

    useEffect(() => {
        async function initializeApp(){
        const firebaseConfig = {
            appId: '1:733994435613:android:370718471c48417e6372f4',
            projectId: 'macro-meals-mobile',
            storageBucket: 'macro-meals-mobile.firebasestorage.app',
            apiKey: 'AIzaSyC4ai-iWprvfuWB52UeFb62TirjBytkI8k',
            messagingSenderId: '733994435613',
            databaseURL: 'https://macro-meals-mobile.firebaseio.com',
            authDomain: 'macro-meals-mobile.firebaseapp.com'
        }

        async function initializeFirebase() {
            try {
                // If firebase has not been initialized
                if (!firebase.apps.length) {
                    await firebase.initializeApp(firebaseConfig);
                    console.log('[FIREBASE] ✅ Firebase initialized successfully');
                }

                // Request notification permissions
                const permission = await pushNotifications.requestPermissions();
                console.log('[FIREBASE] 🔔 Notification permission:', permission);

                if (permission) {
                    // Get FCM token only after permissions are granted
                    const token = await messaging().getToken();
                    console.log('[FIREBASE] 🔑 FCM Token:', token);
                    await pushNotifications.intializeMessaging();
                    return token;
                } else {
                    console.log('[FIREBASE] ⚠️ Notification permission denied');
                    return null;
                }
            } catch (error) {
                console.error('[FIREBASE] ❌ Error:', error);
                return null;
            }
        }

        initializeFirebase();

        
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
        
    }, [pushNotifications]);

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
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';

import useStore from "./src/store/useStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {RootStack} from "./RootStack";

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const { setAuthenticated } = useStore();

    useEffect(() => {
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
        <NavigationContainer>
            <RootStack />
        </NavigationContainer>
    );
}
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

export const checkNotificationPermission = async (): Promise<boolean> => {
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
    }
    
    return enabled;
};

export const getFCMToken = async (): Promise<string> => {
    const token = await messaging().getToken();
    return token;
}

export * from './types';
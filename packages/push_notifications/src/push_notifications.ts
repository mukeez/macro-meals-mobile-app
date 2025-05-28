import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

class PushNotifications {
  async requestPermissions() {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      return enabled;
    } else {
      // For Android, we'll use the notification permission that's already configured in app.json
      return true;
    }
  }

  async getFCMToken() {
    try {
      const fcmToken = await messaging().getToken();
      return fcmToken;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  async onMessage(callback: (message: any) => void) {
    return messaging().onMessage(async remoteMessage => {
      callback(remoteMessage);
    });
  }

  async onNotificationOpenedApp(callback: (message: any) => void) {
    return messaging().onNotificationOpenedApp(remoteMessage => {
      callback(remoteMessage);
    });
  }

  async getInitialNotification() {
    try {
      const remoteMessage = await messaging().getInitialNotification();
      return remoteMessage;
    } catch (error) {
      console.error('Failed to get initial notification:', error);
      return null;
    }
  }
}

export const pushNotifications = new PushNotifications(); 
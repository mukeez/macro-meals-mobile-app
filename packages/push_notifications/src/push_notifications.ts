import { getMessaging, getToken, onMessage, onNotificationOpenedApp, getInitialNotification, AuthorizationStatus } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

class PushNotifications {

  async intializeMessaging(){
    // Set up foreground message handler
    messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
        },
      })
      // Handle foreground message here
    });

    // Set up background message handler
    messaging().setBackgroundMessageHandler(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
        },
      })
      // Handle background message here
    });
    
    messaging().onNotificationOpenedApp(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
        },
      })
    })
  }

  async requestPermissions() {
    if (Platform.OS === 'ios') {
      const authStatus = await getMessaging().requestPermission();
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      return enabled;
    } else {
      // For Android, we'll use the notification permission that's already configured in app.json
      return true;
    }
  }

  async getFCMToken() {
    try {
      // For iOS, ensure we have proper initialization
      if (Platform.OS === 'ios') {
        // Check if we have authorization
        const authStatus = await messaging().hasPermission();
        if (authStatus !== AuthorizationStatus.AUTHORIZED && 
            authStatus !== AuthorizationStatus.PROVISIONAL) {
          console.log('No push notification permission, requesting...');
          const newAuthStatus = await messaging().requestPermission();
          if (newAuthStatus !== AuthorizationStatus.AUTHORIZED && 
              newAuthStatus !== AuthorizationStatus.PROVISIONAL) {
            console.log('Push notification permission denied');
            return null;
          }
        }
        // Force device registration for remote messages (fixes APNS token issue)
        try {
          await messaging().registerDeviceForRemoteMessages();
          console.log('Device registered for remote messages');
        } catch (registrationError) {
          console.log('Device already registered or registration failed:', registrationError);
        }
        // Add a small delay to ensure APNS token is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      const fcmToken = await messaging().getToken();
      return fcmToken;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      // If it's an APNS token error, try forcing device registration
      if (error instanceof Error && error.message && error.message.includes('APNS token')) {
        console.log('APNS token error detected, trying to force device registration...');
        try {
          if (Platform.OS === 'ios') {
            await messaging().registerDeviceForRemoteMessages();
            // Retry getting token after registration
            const retryToken = await messaging().getToken();
            return retryToken;
          }
        } catch (retryError) {
          console.log('Retry failed:', retryError);
        }
        return null;
      }
      return null;
    }
  }

  async onMessage(callback: (message: FirebaseMessagingTypes.RemoteMessage) => void) {
    const messaging = getMessaging();

    return onMessage(messaging, async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      callback(remoteMessage);
    });
  }

  async onNotificationOpenedApp(callback: (message: FirebaseMessagingTypes.RemoteMessage) => void) {
    const messaging = getMessaging();
    return onNotificationOpenedApp(messaging, (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      callback(remoteMessage);
    });
  }

  async getInitialNotification() {
    try {
      const messaging = getMessaging();
      const remoteMessage = await getInitialNotification(messaging);
      return remoteMessage;
    } catch (error) {
      console.error('Failed to get initial notification:', error);
      return null;
    }
  }
}

export const pushNotifications = new PushNotifications(); 
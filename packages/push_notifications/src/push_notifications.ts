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
      console.log('[FIREBASE] 📬 Foreground message received:', remoteMessage);
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
      console.log('[FIREBASE] 📬 Background message received:', remoteMessage);
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
      console.log('[FIREBASE] 📬 Notification opened app:', remoteMessage);
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
      const messaging = getMessaging();
      const fcmToken = await getToken(messaging);
      return fcmToken;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
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
import React, { useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { useRemoteConfigContext } from '@macro-meals/remote-config-service';
import { getCurrentAppVersion, getThresholds, shouldForceUpdate, shouldSoftUpdate } from '../utils/versionCheck';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UpdateReminderModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SNOOZE_KEY = 'update_reminder_snooze';
const SNOOZE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const UpdateReminderModal: React.FC<UpdateReminderModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { getValue, isInitialized } = useRemoteConfigContext();

  useEffect(() => {
    if (isVisible && isInitialized) {
      checkUpdateStatus();
    }
  }, [isVisible, isInitialized]);

  const checkUpdateStatus = async () => {
    try {
      const currentVersion = getCurrentAppVersion();
      const remoteConfigValues = {
        ios_min_supported_build: getValue('ios_min_supported_build').asString(),
        ios_latest_build: getValue('ios_latest_build').asString(),
        android_min_supported_version_code: getValue('android_min_supported_version_code').asString(),
        android_latest_version_code: getValue('android_latest_version_code').asString(),
        update_url_ios: getValue('update_url_ios').asString(),
        update_url_android: getValue('update_url_android').asString(),
        update_title: getValue('update_title').asString(),
        update_description: getValue('update_description').asString(),
        soft_update: getValue('soft_update').asString(),
        force_update: getValue('force_update').asString(),
      };

      const { min, latest, url } = getThresholds(remoteConfigValues);
      
      console.log('🔍 Update Check:', {
        currentVersion: currentVersion,
        minSupported: min,
        latestAvailable: latest,
        platform: Platform.OS,
        updateUrl: url,
        softUpdate: remoteConfigValues.soft_update,
        forceUpdate: remoteConfigValues.force_update
      });

      // Check if force update is explicitly enabled
      if (remoteConfigValues.force_update === 'true' && shouldForceUpdate(currentVersion, min)) {
        // Force update - blocking alert
        console.log('🔍 Showing FORCE UPDATE alert (no Cancel button)');
        showForceUpdateAlert(
          url, 
          remoteConfigValues.update_description,
          remoteConfigValues.update_title
        );
      } else if (remoteConfigValues.soft_update === 'true' && shouldSoftUpdate(currentVersion, latest) && !(await isSnoozedRecently())) {
        // Soft update - non-blocking alert
        console.log('🔍 Showing SOFT UPDATE alert (with Cancel button)');
        showSoftUpdateAlert(
          url, 
          remoteConfigValues.update_description,
          remoteConfigValues.update_title
        );
      } else {
        // No update needed or recently snoozed
        console.log('🔍 No update needed or recently snoozed');
        onClose();
      }
    } catch (error) {
      console.error('Failed to check update status:', error);
      onClose();
    }
  };

  const isSnoozedRecently = async (): Promise<boolean> => {
    try {
      const snoozeTimestamp = await AsyncStorage.getItem(SNOOZE_KEY);
      if (!snoozeTimestamp) return false;
      
      const snoozeTime = parseInt(snoozeTimestamp, 10);
      const now = Date.now();
      return (now - snoozeTime) < SNOOZE_DURATION;
    } catch (error) {
      console.error('Failed to check snooze status:', error);
      return false;
    }
  };

  const showForceUpdateAlert = (url: string, description: string, title?: string) => {
    console.log('🔍 FORCE UPDATE Alert - Showing blocking alert with only Update button');
    Alert.alert(
      title || 'Update Required',
      description || 'A new version is required to continue using the app.',
      [
        {
          text: 'Update Now',
          onPress: () => {
            if (url) {
              Linking.openURL(url);
            }
            // Keep showing the alert until they update
            setTimeout(() => {
              showForceUpdateAlert(url, description, title);
            }, 1000);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const showSoftUpdateAlert = async (url: string, description: string, title?: string) => {
    console.log('🔍 SOFT UPDATE Alert - Showing non-blocking alert with Update, Later, and Cancel buttons');
    Alert.alert(
      title || 'Update Available',
      description || 'A new version is available with improvements.',
      [
        {
          text: 'Update Now',
          onPress: () => {
            if (url) {
              Linking.openURL(url);
            }
            onClose();
          },
        },
        {
          text: 'Later',
          onPress: async () => {
            try {
              // Set snooze timestamp
              await AsyncStorage.setItem(SNOOZE_KEY, Date.now().toString());
              onClose();
            } catch (error) {
              console.error('Failed to set snooze timestamp:', error);
              onClose();
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            onClose();
          },
        },
      ]
    );
  };

  // This component doesn't render anything, it just shows alerts
  return null;
};

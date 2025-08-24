import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getCurrentAppVersion(): string {
  return Constants.expoConfig?.version || '1.0.0';
}

export function getThresholds(rc: any) {
  return Platform.select({
    ios: {
      min: rc.ios_min_supported_build || '1.0.0',
      latest: rc.ios_latest_build || '1.0.0',
      url: rc.update_url_ios,
    },
    android: {
      min: rc.android_min_supported_version_code || '1.0.0',
      latest: rc.android_latest_version_code || '1.0.0',
      url: rc.update_url_android,
    },
  })!;
}

export function shouldForceUpdate(currentVersion: string, minVersion: string): boolean {
  return compareVersions(currentVersion, minVersion) < 0;
}

export function shouldSoftUpdate(currentVersion: string, latestVersion: string): boolean {
  return compareVersions(currentVersion, latestVersion) < 0;
}

// Semantic version comparison (e.g., "1.0.0" vs "1.1.0")
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    if (part1 !== part2) {
      return part1 - part2;
    }
  }
  return 0;
}

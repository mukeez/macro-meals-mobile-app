import 'react-native-get-random-values';
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type InitOptions = {
  dsn: string;
  enableNativeInDev?: boolean;
  environment?: string;
};

export type UserContext = {
  id?: string;
  email?: string;
  username?: string;
  name?: string;
};

class SentryService {
  private initialized = false;

  init(options: InitOptions) {
    if (this.initialized) return;

    const isDev = __DEV__ === true;
    const enableNative = isDev ? !!options.enableNativeInDev : true;

    Sentry.init({
      dsn: options.dsn,
      enableNative,
      debug: isDev,
      environment: options.environment ?? (isDev ? 'development' : 'production'),
      sendDefaultPii: true,
    });

    // Set app metadata
    Sentry.setTag('app.version', Constants.expoConfig?.version ?? 'unknown');
    Sentry.setTag('app.build', (Platform.select({
      ios: Constants.expoConfig?.ios?.buildNumber,
      android: Constants.expoConfig?.android?.versionCode?.toString(),
    }) as string) ?? 'unknown');
    Sentry.setTag('platform', Platform.OS);

    this.initialized = true;
  }

  setUser(user: UserContext) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    });
  }

  clearUser() {
    Sentry.setUser(null);
  }

  captureError(error: unknown) {
    Sentry.captureException(error);
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    Sentry.captureMessage(message, level);
  }

  withScope<T>(fn: (scope: Sentry.Scope) => T) {
    return Sentry.withScope(fn);
  }
}

export const sentryService = new SentryService();
export { Sentry, SentryService };

// Main Service

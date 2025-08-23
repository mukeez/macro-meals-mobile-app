# @macro-meals/sentry_service

Thin wrapper around @sentry/react-native for consistent init and user context across iOS and Android.

## Usage

```ts
import { sentryService } from '@macro-meals/sentry_service';

sentryService.init({
  dsn: '<YOUR_DSN>',
  environment: __DEV__ ? 'development' : 'production',
  // enableNativeInDev: true,
});

sentryService.setUser({ id: user.id, email: user.email, name: user.name });
```

- Automatically tags app version and build using expo-constants.
- Helpers: captureError, captureMessage, clearUser, withScope.

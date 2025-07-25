# Repository Structure

This document explains what files and directories are included/excluded from the repository.

## What's Included in the Repository

### Source Code
- `src/` - All React Native source code
- `packages/` - Internal packages (mixpanel, crashlytics, etc.)
- `App.tsx` - Main app entry point
- `RootStack.tsx` - Navigation configuration

### Configuration Files
- `package.json` - Dependencies and scripts
- `app.json` - Expo configuration
- `eas.json` - EAS build configuration
- `babel.config.js` - Babel configuration
- `metro.config.js` - Metro bundler configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

### Environment Files
- `.env.development` - Development environment variables
- `.env.staging` - Staging environment variables  
- `.env.production` - Production environment variables
- `.env` - Default environment variables

### iOS Configuration
- `ios/Podfile` - CocoaPods dependencies
- `ios/Podfile.lock` - Locked CocoaPods versions
- `ios/macromeals.xcodeproj/` - Xcode project files
- `ios/macromeals.xcworkspace/` - Xcode workspace
- `ios/macromeals/` - iOS app source files
- `ios/macromeals dev-Info.plist` - Development target configuration
- `ios/macromeals stg-Info.plist` - Staging target configuration

### Android Configuration
- `android/app/build.gradle` - Android app build configuration
- `android/app/proguard-rules.pro` - ProGuard rules
- `android/app/src/` - Android app source files
- `android/build.gradle` - Project-level build configuration
- `android/settings.gradle` - Gradle settings
- `android/gradle.properties` - Gradle properties

## What's Excluded from the Repository

### Build Artifacts
- `android/app/build/` - Android build outputs
- `android/build/` - Android project build outputs
- `android/.gradle/` - Gradle cache
- `android/.kotlin/` - Kotlin cache
- `ios/build/` - iOS build outputs
- `ios/Pods/` - CocoaPods dependencies (installed locally)

### Signing Files
- `android/app/signing.properties` - Android signing configuration
- `android/app/*.keystore` - Android keystore files
- `ios/*.p12` - iOS certificates
- `ios/*.mobileprovision` - iOS provisioning profiles

### Generated Files
- `node_modules/` - NPM dependencies
- `.expo/` - Expo cache
- `dist/` - Build distribution files
- `*.apk` - Android APK files
- `*.aab` - Android App Bundle files
- `*.ipa` - iOS app files

### IDE and OS Files
- `.vscode/` - VS Code settings
- `.idea/` - IntelliJ IDEA settings
- `.DS_Store` - macOS system files
- `*.log` - Log files

## Environment Setup

### Development
```bash
yarn ios:dev      # iOS development build
yarn android:dev  # Android development build
```

### Staging
```bash
yarn ios:stg      # iOS staging build
yarn android:stg  # Android staging build
```

### Production
```bash
yarn ios:prod     # iOS production build
yarn android:prod # Android production build
```

## Build Variants

### iOS
- `macromeals-dev` - Development target
- `macromeals-stg` - Staging target
- `macromeals` - Production target

### Android
- `devDebug` - Development debug build
- `stgDebug` - Staging debug build
- `prodRelease` - Production release build

## Environment Variables

Each environment uses its own `.env` file:
- `.env.development` - Development API endpoints and tokens
- `.env.staging` - Staging API endpoints and tokens
- `.env.production` - Production API endpoints and tokens

The environment detection logic automatically selects the correct configuration based on the build variant. 
# RevenueCat Setup Guide

## Overview
This guide will help you set up RevenueCat for subscription management in your Macro Meals app.

## Prerequisites
- RevenueCat account (sign up at https://www.revenuecat.com/)
- App Store Connect account
- Google Play Console account (for Android)

## Step 1: RevenueCat Dashboard Setup

### 1.1 Create a RevenueCat Project
1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Create a new project called "Macro Meals"
3. Select both iOS and Android platforms

### 1.2 Get API Keys
1. In your RevenueCat project, go to **Project Settings** → **API Keys**
2. Copy the API keys for each environment:
   - **iOS Development**: `ios_dev_api_key`
   - **iOS Staging**: `ios_staging_api_key`
   - **iOS Production**: `ios_prod_api_key`
   - **Android Development**: `android_dev_api_key`
   - **Android Staging**: `android_staging_api_key`
   - **Android Production**: `android_prod_api_key`

### 1.3 Update API Keys in Code
Replace the placeholder API keys in `src/services/revenueCatService.ts`:

```typescript
const REVENUECAT_API_KEYS = {
  ios: {
    development: 'your_actual_ios_dev_api_key',
    staging: 'your_actual_ios_staging_api_key', 
    production: 'your_actual_ios_prod_api_key'
  },
  android: {
    development: 'your_actual_android_dev_api_key',
    staging: 'your_actual_android_staging_api_key',
    production: 'your_actual_android_prod_api_key'
  }
};
```

## Step 2: App Store Connect Setup

### 2.1 Create Subscription Products
1. Go to **App Store Connect** → **Your App** → **Features** → **In-App Purchases**
2. Create two subscription products:
   - **Product ID**: `monthly_subscription`
   - **Product ID**: `yearly_subscription`

### 2.2 Configure Subscription Details
For each product:
- **Reference Name**: "Macro Meals Monthly" / "Macro Meals Yearly"
- **Product ID**: `monthly_subscription` / `yearly_subscription`
- **Subscription Group**: Create a new group called "Macro Meals Premium"
- **Subscription Duration**: Monthly / Yearly
- **Price**: Set your desired prices

### 2.3 Add Free Trial
1. In each subscription product, go to **Subscription Duration**
2. Add a **Free Trial** period (7 days)
3. Set **Trial Duration**: 7 days

## Step 3: Google Play Console Setup (Android)

### 3.1 Create Subscription Products
1. Go to **Google Play Console** → **Your App** → **Monetize** → **Products** → **Subscriptions**
2. Create two subscription products with the same IDs:
   - **Product ID**: `monthly_subscription`
   - **Product ID**: `yearly_subscription`

### 3.2 Configure Subscription Details
- Set prices and trial periods to match iOS
- Enable **Free Trial** for 7 days

## Step 4: RevenueCat Product Configuration

### 4.1 Create Products in RevenueCat
1. Go to **RevenueCat Dashboard** → **Products**
2. Add your subscription products:
   - `monthly_subscription`
   - `yearly_subscription`

### 4.2 Create Entitlements
1. Go to **Entitlements**
2. Create an entitlement called **"pro"**
3. Add both subscription products to this entitlement

### 4.3 Create Offerings
1. Go to **Offerings**
2. Create a **Current** offering
3. Add both subscription packages to this offering

## Step 5: Testing

### 5.1 Test on iOS Simulator
```bash
yarn ios:dev
```

### 5.2 Test on Android Emulator
```bash
yarn android:dev
```

### 5.3 Test Purchase Flow
1. Navigate to the PaymentScreen
2. Select a plan
3. Tap "Start 7-Day Free Trial"
4. Complete the purchase flow

## Step 6: Production Deployment

### 6.1 Submit to App Store
1. Build your app with production configuration
2. Submit to App Store Connect
3. Ensure subscription products are approved

### 6.2 Submit to Google Play
1. Build your app with production configuration
2. Submit to Google Play Console
3. Ensure subscription products are approved

## Troubleshooting

### Common Issues

1. **"No subscription offerings available"**
   - Check that RevenueCat API keys are correct
   - Verify products are configured in RevenueCat dashboard
   - Ensure offerings are set up correctly

2. **Purchase fails**
   - Check that products exist in App Store Connect/Google Play Console
   - Verify product IDs match exactly
   - Ensure app is signed with correct provisioning profile

3. **Free trial not working**
   - Verify trial period is configured in App Store Connect/Google Play Console
   - Check that trial is enabled in RevenueCat

### Debug Logs
RevenueCat provides detailed logs. Check the console for:
- `✅ RevenueCat initialized successfully`
- `✅ Purchase successful`
- `❌ Purchase failed` (with error details)

## Support
- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [RevenueCat Support](https://www.revenuecat.com/support/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer) 
import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import Config from 'react-native-config';
import { Platform } from 'react-native';

// RevenueCat API Keys (you'll get these from RevenueCat dashboard)
const REVENUECAT_API_KEYS = {
  ios: {
    development: 'your_ios_dev_api_key',
    staging: 'your_ios_staging_api_key', 
    production: 'your_ios_prod_api_key'
  },
  android: {
    development: 'your_android_dev_api_key',
    staging: 'your_android_staging_api_key',
    production: 'your_android_prod_api_key'
  }
};

// Product IDs (you'll configure these in App Store Connect and Google Play Console)
const PRODUCT_IDS = {
  MONTHLY: 'monthly_subscription',
  YEARLY: 'yearly_subscription'
};

class RevenueCatService {
  private isInitialized = false;

  async initialize(userId?: string) {
    if (this.isInitialized) return;

    try {
      // Get the appropriate API key based on environment
      const environment = Config.ENVIRONMENT || 'development';
      const platform = Platform.OS;
      const apiKey = REVENUECAT_API_KEYS[platform][environment];

      if (!apiKey) {
        throw new Error(`No RevenueCat API key found for ${platform} ${environment}`);
      }

      // Configure RevenueCat
      await Purchases.configure({
        apiKey,
        appUserID: userId,
        observerMode: false, // Set to true if you want to handle purchases manually
      });

      this.isInitialized = true;
      console.log('✅ RevenueCat initialized successfully');
    } catch (error) {
      console.error('❌ RevenueCat initialization failed:', error);
      throw error;
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('❌ Failed to get offerings:', error);
      return null;
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      console.log('✅ Purchase successful:', customerInfo);
      return customerInfo;
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      console.log('✅ Purchases restored:', customerInfo);
      return customerInfo;
    } catch (error) {
      console.error('❌ Restore purchases failed:', error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to get customer info:', error);
      throw error;
    }
  }

  async checkSubscriptionStatus(): Promise<{
    isPro: boolean;
    hasActiveSubscription: boolean;
    subscriptionType?: string;
    expirationDate?: Date;
  }> {
    try {
      const customerInfo = await this.getCustomerInfo();
      
      const isPro = customerInfo.entitlements.active['pro'] !== undefined;
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      
      let subscriptionType: string | undefined;
      let expirationDate: Date | undefined;

      if (isPro) {
        const proEntitlement = customerInfo.entitlements.active['pro'];
        subscriptionType = proEntitlement.productIdentifier;
        expirationDate = proEntitlement.expirationDate ? new Date(proEntitlement.expirationDate) : undefined;
      }

      return {
        isPro,
        hasActiveSubscription,
        subscriptionType,
        expirationDate
      };
    } catch (error) {
      console.error('❌ Failed to check subscription status:', error);
      return {
        isPro: false,
        hasActiveSubscription: false
      };
    }
  }

  async setUserID(userId: string) {
    try {
      await Purchases.logIn(userId);
      console.log('✅ User ID set successfully:', userId);
    } catch (error) {
      console.error('❌ Failed to set user ID:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await Purchases.logOut();
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Failed to logout:', error);
      throw error;
    }
  }
}

export const revenueCatService = new RevenueCatService();
export default revenueCatService; 
import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';
import Config from 'react-native-config';

// RevenueCat API Keys (you'll get these from RevenueCat dashboard)
const REVENUECAT_API_KEYS = {
  ios: {
    development: Config.REVENUECAT_IOS_API_KEY,
    staging: Config.REVENUECAT_IOS_API_KEY, 
    production: Config.REVENUECAT_IOS_API_KEY
  },
  android: {
    development: Config.REVENUECAT_ANDROID_API_KEY || 'your_android_dev_api_key',
    staging: Config.REVENUECAT_ANDROID_API_KEY || 'your_android_staging_api_key',
    production: Config.REVENUECAT_ANDROID_API_KEY || 'your_android_prod_api_key'
  }
};

// Product IDs (you'll configure these in App Store Connect and Google Play Console)
const PRODUCT_IDS = {
  MONTHLY: 'com.macromeals.app.subscription.premium.monthly',
  YEARLY: 'com.macromeals.app.subscription.premium.annual'
};

// Entitlement ID from environment
const ENTITLEMENT_ID = Config.REVENUECAT_ENTITLEMENT_ID || 'entld5ce0325c7';

class RevenueCatService {
  private isInitialized = false;

  async initialize(userId?: string) {
    if (this.isInitialized) return;

    try {
      // Get the appropriate API key based on environment
      const environment = Config.ENVIRONMENT || 'development';
      const platform = Platform.OS as 'ios' | 'android';
      const apiKey = REVENUECAT_API_KEYS[platform]?.[environment as keyof typeof REVENUECAT_API_KEYS[typeof platform]];
      console.log(`\n\n\n\n\n\n🔍 RevenueCat: API key: ${apiKey}\n\n\n\n\n\n`);

      console.log('🔍 RevenueCat: Initializing with config:', {
        environment,
        platform,
        apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT_FOUND',
        userId
      });

      if (!apiKey) {
        throw new Error(`No RevenueCat API key found for ${platform} ${environment}`);
      }

      // Configure RevenueCat
      await Purchases.configure({
        apiKey,
        appUserID: userId,
      });

      this.isInitialized = true;
      console.log('✅ RevenueCat initialized successfully');
      
      // Test product availability
      await this.testProductAvailability();
    } catch (error) {
      console.error('❌ RevenueCat initialization failed:', error);
      throw error;
    }
  }

  async testProductAvailability() {
    try {
      console.log('🔍 RevenueCat: Testing product availability...');
      console.log('🔍 RevenueCat: Expected product IDs:', PRODUCT_IDS);
      
      // Try to get all available products
      const products = await Purchases.getProducts(Object.values(PRODUCT_IDS));
      console.log('🔍 RevenueCat: Available products from Store:', products);
      
      if (products.length === 0) {
        console.error('❌ RevenueCat: No products found in App Store Connect!');
        console.error('❌ RevenueCat: Make sure these products exist in App Store Connect:');
        Object.entries(PRODUCT_IDS).forEach(([key, id]) => {
          console.error(`   - ${key}: ${id}`);
        });
      } else {
        console.log('✅ RevenueCat: Found products in App Store Connect:', products.map(p => p.identifier));
      }
    } catch (error) {
      console.error('❌ RevenueCat: Error testing product availability:', error);
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      console.log('🔍 RevenueCat: Fetching offerings...');
      const offerings = await Purchases.getOfferings();
      console.log('🔍 RevenueCat: All offerings:', offerings);
      console.log('🔍 RevenueCat: Current offering:', offerings.current);
      
      if (offerings.current) {
        console.log('🔍 RevenueCat: Available packages:', offerings.current.availablePackages);
      } else {
        console.log('🔍 RevenueCat: No current offering found');
      }
      
      return offerings.current;
    } catch (error) {
      console.error('❌ Failed to get offerings:', error);
      return null;
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
    try {
      console.log('🔍 RevenueCat: Starting purchase for package:', packageToPurchase.identifier);
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      // Check if the entitlement was granted
      const hasEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      
      console.log('✅ Purchase successful:', {
        hasEntitlement,
        entitlementId: ENTITLEMENT_ID,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        customerInfo
      });
      
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
      
      // Use the entitlement ID from environment
      const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      
      let subscriptionType: string | undefined;
      let expirationDate: Date | undefined;

      if (isPro) {
        const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
        subscriptionType = proEntitlement.productIdentifier;
        expirationDate = proEntitlement.expirationDate ? new Date(proEntitlement.expirationDate) : undefined;
      }

      console.log('🔍 RevenueCat: Subscription status check:', {
        entitlementId: ENTITLEMENT_ID,
        isPro,
        hasActiveSubscription,
        activeEntitlements: Object.keys(customerInfo.entitlements.active)
      });

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
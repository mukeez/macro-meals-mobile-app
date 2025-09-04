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
  MONTHLY: Platform.OS === 'ios' ? Config.IOS_PRODUCT_MONTHLY_ID : Config.ANDROID_PRODUCT_MONTHLY_ID,  //'com.macromeals.app.subscription.premium.monthly' : 'com.macromeals.app.premium.monthly',
  YEARLY: Platform.OS === 'ios' ? Config.IOS_PRODUCT_YEARLY_ID : Config.ANDROID_PRODUCT_YEARLY_ID //'com.macromeals.app.subscription.premium.annual' : 'com.macromeals.app.premium.annual'
};

// Entitlement ID from environment
const ENTITLEMENT_ID = Config.REVENUECAT_ENTITLEMENT_ID || 'entld5ce0325c7';
console.log('🔍 RevenueCat: ENTITLEMENT_ID configured as:', ENTITLEMENT_ID);
console.log('🔍 RevenueCat: Config.REVENUECAT_ENTITLEMENT_ID from env:', Config.REVENUECAT_ENTITLEMENT_ID);

class RevenueCatService {
  private isInitialized = false;

  async initialize(userId?: string) {
    if (this.isInitialized) return;

    try {
      // Get the appropriate API key based on environment
      const environment = Config.ENVIRONMENT || 'development';
      const platform = Platform.OS as 'ios' | 'android';
      const apiKey = REVENUECAT_API_KEYS[platform]?.[environment as keyof typeof REVENUECAT_API_KEYS[typeof platform]];
      // console.log(`\n\n\n\n\n\n🔍 RevenueCat: API key: ${apiKey}\n\n\n\n\n\n`);

      // console.log('🔍 RevenueCat: Initializing with config:', {
      //   environment,
      //   platform,
      //   apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT_FOUND',
      //   userId
      // });

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
      // const products = await Purchases.getProducts(Object.values(PRODUCT_IDS));
      // console.log('🔍 RevenueCat: Available products from Store:', products);
      
      // if (products.length === 0) {
      //   console.error('❌ RevenueCat: No products found in App Store Connect!');
      //   console.error('❌ RevenueCat: Make sure these products exist in App Store Connect:');
      //   Object.entries(PRODUCT_IDS).forEach(([key, id]) => {
      //     console.error(`   - ${key}: ${id}`);
      //   });
      // } else {
      //   console.log('✅ RevenueCat: Found products in App Store Connect:', products.map(p => p.identifier));
      // }
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
      const hasEntitlement = customerInfo.entitlements.active['MacroMeals Premium'] !== undefined;
      
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

      
      // Check for any active entitlements (more robust than checking specific ID)
      const isPro = Object.keys(customerInfo.entitlements.active).length > 0;
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      
      let subscriptionType: string | undefined;
      let expirationDate: Date | undefined;

      console.log('🔍 CUSTOMER INFO FROM APP>TSX:', JSON.stringify(customerInfo, null, 2));

      if (isPro) {
        // Find the active entitlement (it might be using a different identifier than ENTITLEMENT_ID)
        const activeEntitlements = Object.values(customerInfo.entitlements.active);
        const proEntitlement = activeEntitlements[0]; // Get the first active entitlement
        
        if (proEntitlement) {
          subscriptionType = proEntitlement.productIdentifier;
          expirationDate = proEntitlement.expirationDate ? new Date(proEntitlement.expirationDate) : undefined;
        }
      }

      console.log('🔍 RevenueCat: Subscription status check:', {
        configuredEntitlementId: ENTITLEMENT_ID,
        isPro,
        hasActiveSubscription,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        allEntitlements: Object.keys(customerInfo.entitlements.all),
        activeSubscriptions: customerInfo.activeSubscriptions,
        originalAppUserId: customerInfo.originalAppUserId,
        allPurchaseDates: customerInfo.allPurchaseDates,
        allExpirationDates: customerInfo.allExpirationDates,
        subscriptionsByProductIdentifier: Object.keys(customerInfo.subscriptionsByProductIdentifier),
        fullActiveEntitlements: customerInfo.entitlements.active,
        fullAllEntitlements: customerInfo.entitlements.all
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

  async setAttributes(attributes: { [key: string]: string }) {
    try {
      await Purchases.setAttributes(attributes);
      console.log('✅ Attributes set successfully:', attributes);
    } catch (error) {
      console.error('❌ Failed to set attributes:', error);
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

  async checkTrialStatus() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      console.log('🔍 RevenueCat - Full customer info:', JSON.stringify(customerInfo, null, 2));
      
      const myEntitlement = customerInfo.entitlements.active['MacroMeals Premium']; // Use the correct entitlement ID
      console.log('🔍 RevenueCat - MacroMeals Premium entitlement:', myEntitlement);
      console.log('🔍 RevenueCat - All active entitlements:', Object.keys(customerInfo.entitlements.active));
      console.log('🔍 RevenueCat - All entitlements (including expired):', Object.keys(customerInfo.entitlements.all));
  
      if (myEntitlement && myEntitlement.periodType === 'TRIAL') {
        console.log('User is currently on a free trial.');
        return true;
      } else {
        console.log('User is not currently on a free trial.');
        return false;
      }
    } catch (e) {
      console.error('Error fetching customer info:', e);
      return false;
    }
  }

  async syncPurchases(): Promise<CustomerInfo> {
    try {
      await Purchases.syncPurchases();
      console.log('✅ Purchases synced successfully');
      
      // Get customer info after syncing
      const customerInfo = await this.getCustomerInfo();
      console.log('✅ Customer info after sync:', {
        originalAppUserId: customerInfo.originalAppUserId,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        allEntitlements: Object.keys(customerInfo.entitlements.all)
      });
      
      return customerInfo;
    } catch (error) {
      console.error('❌ Error syncing purchases:', error);
      throw error;
    }
  }
  

  async checkForExistingSubscription(email: string): Promise<{
    hasSubscription: boolean;
    customerInfo: any;
    entitlements: any;
  }> {
    try {
      console.log('🔍 RevenueCat: Checking for existing subscription by email:', email);
      
      // Get current customer info before setting email
      const customerInfoBefore = await this.getCustomerInfo();
      console.log('🔍 RevenueCat: Customer info BEFORE setting email:', {
        originalAppUserId: customerInfoBefore.originalAppUserId,
        activeEntitlements: Object.keys(customerInfoBefore.entitlements.active),
        allEntitlements: Object.keys(customerInfoBefore.entitlements.all)
      });
      
      // Set email as an attribute to help RevenueCat find the customer
      await Purchases.setAttributes({
        $email: email
      });
      
      console.log('🔍 RevenueCat: Email attribute set, waiting for RevenueCat to process...');
      
      // Wait a moment for RevenueCat to process the attribute
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get customer info after setting email
      const customerInfo = await this.getCustomerInfo();
      
      console.log('🔍 RevenueCat: Customer info after setting email:', {
        originalAppUserId: customerInfo.originalAppUserId,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        allEntitlements: Object.keys(customerInfo.entitlements.all),
        activeSubscriptions: customerInfo.activeSubscriptions,
        allPurchaseDates: customerInfo.allPurchaseDates,
        allExpirationDates: customerInfo.allExpirationDates,
        subscriptionsByProductIdentifier: customerInfo.subscriptionsByProductIdentifier,
        firstSeen: customerInfo.firstSeen,
        originalPurchaseDate: customerInfo.originalPurchaseDate,
        allPurchasedProductIdentifiers: customerInfo.allPurchasedProductIdentifiers
      });
      
      // Check if there are any active entitlements
      const hasActiveEntitlements = Object.keys(customerInfo.entitlements.active).length > 0;
      const hasAnyEntitlements = Object.keys(customerInfo.entitlements.all).length > 0;
      
      console.log('🔍 RevenueCat: Subscription check results:', {
        hasActiveEntitlements,
        hasAnyEntitlements,
        activeEntitlements: customerInfo.entitlements.active,
        allEntitlements: customerInfo.entitlements.all,
        hasAnyPurchaseHistory: Object.keys(customerInfo.allPurchaseDates).length > 0,
        hasAnyExpirationHistory: Object.keys(customerInfo.allExpirationDates).length > 0,
        hasAnyProductIdentifiers: customerInfo.allPurchasedProductIdentifiers.length > 0
      });
      
      // If no subscription found with current method, try alternative approach
      if (!hasActiveEntitlements) {
        console.log('🔍 RevenueCat: No subscription found with email attribute method, trying alternative approach...');
        
        // Try to sync purchases again to see if it helps
        try {
          await Purchases.syncPurchases();
          console.log('🔍 RevenueCat: Synced purchases after setting email attribute');
          
          // Get customer info again after sync
          const customerInfoAfterSync = await this.getCustomerInfo();
          console.log('🔍 RevenueCat: Customer info after sync:', {
            originalAppUserId: customerInfoAfterSync.originalAppUserId,
            activeEntitlements: Object.keys(customerInfoAfterSync.entitlements.active),
            allEntitlements: Object.keys(customerInfoAfterSync.entitlements.all),
            hasAnyPurchaseHistory: Object.keys(customerInfoAfterSync.allPurchaseDates).length > 0
          });
          
          // Check if sync helped
          const hasActiveEntitlementsAfterSync = Object.keys(customerInfoAfterSync.entitlements.active).length > 0;
          if (hasActiveEntitlementsAfterSync) {
            console.log('✅ RevenueCat: Found subscription after sync!');
            return {
              hasSubscription: true,
              customerInfo: customerInfoAfterSync,
              entitlements: customerInfoAfterSync.entitlements.active
            };
          }
          
          // If still no subscription found, try one more approach - check if there are any entitlements at all
          const hasAnyEntitlementsAfterSync = Object.keys(customerInfoAfterSync.entitlements.all).length > 0;
          if (hasAnyEntitlementsAfterSync) {
            console.log('🔍 RevenueCat: Found entitlements in "all" but not "active" - subscription may be expired');
            console.log('🔍 RevenueCat: All entitlements:', customerInfoAfterSync.entitlements.all);
            
            // Check if any of the entitlements are for the correct product
            const entitlementKeys = Object.keys(customerInfoAfterSync.entitlements.all);
            for (const key of entitlementKeys) {
              const entitlement = customerInfoAfterSync.entitlements.all[key];
              console.log(`🔍 RevenueCat: Entitlement "${key}":`, {
                isActive: entitlement.isActive,
                expirationDate: entitlement.expirationDate,
                productIdentifier: entitlement.productIdentifier,
                periodType: entitlement.periodType
              });
            }
          } else {
            // If no entitlements found at all, try restorePurchases as a last resort
            console.log('🔍 RevenueCat: No entitlements found, trying restorePurchases as last resort...');
            try {
              const restoredCustomerInfo = await Purchases.restorePurchases();
              console.log('🔍 RevenueCat: Restore purchases result:', {
                originalAppUserId: restoredCustomerInfo.originalAppUserId,
                activeEntitlements: Object.keys(restoredCustomerInfo.entitlements.active),
                allEntitlements: Object.keys(restoredCustomerInfo.entitlements.all)
              });
              
              const hasActiveEntitlementsAfterRestore = Object.keys(restoredCustomerInfo.entitlements.active).length > 0;
              if (hasActiveEntitlementsAfterRestore) {
                console.log('✅ RevenueCat: Found subscription after restore purchases!');
                return {
                  hasSubscription: true,
                  customerInfo: restoredCustomerInfo,
                  entitlements: restoredCustomerInfo.entitlements.active
                };
              }
            } catch (restoreError) {
              console.error('❌ RevenueCat: Error during restore purchases:', restoreError);
            }
          }
        } catch (syncError) {
          console.error('❌ RevenueCat: Error during sync after setting email:', syncError);
        }
      }
      
      return {
        hasSubscription: hasActiveEntitlements,
        customerInfo,
        entitlements: customerInfo.entitlements.active
      };
    } catch (error) {
      console.error('❌ Failed to check for existing subscription:', error);
      return {
        hasSubscription: false,
        customerInfo: null,
        entitlements: {}
      };
    }
  }

  async linkExistingSubscription(userId: string, email: string): Promise<{
    success: boolean;
    customerInfo?: any;
    entitlements?: any;
    error?: string;
  }> {
    try {
      console.log('🔍 RevenueCat: Linking existing subscription to new user ID:', userId);
      
      // Step 1: Set email as attribute
      await Purchases.setAttributes({
        $email: email
      });
      
      // Step 2: Set the new user ID
      await Purchases.logIn(userId);
      
      // Step 3: Sync purchases to link the subscription
      await Purchases.syncPurchases();
      
      // Step 4: Get updated customer info
      const customerInfo = await this.getCustomerInfo();
      
      console.log('🔍 RevenueCat: Customer info after linking:', {
        originalAppUserId: customerInfo.originalAppUserId,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        allEntitlements: Object.keys(customerInfo.entitlements.all)
      });
      
      // Check if linking was successful
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      
      if (hasActiveSubscription) {
        console.log('✅ RevenueCat: Successfully linked existing subscription to new user ID');
        return {
          success: true,
          customerInfo,
          entitlements: customerInfo.entitlements
        };
      } else {
        console.log('⚠️ RevenueCat: Linking completed but no active entitlements found');
        return {
          success: false,
          customerInfo,
          entitlements: customerInfo.entitlements,
          error: 'No active entitlements found after linking'
        };
      }
    } catch (error) {
      console.error('❌ RevenueCat: Error linking existing subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const revenueCatService = new RevenueCatService();
export default revenueCatService; 
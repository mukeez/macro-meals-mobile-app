import { Platform } from 'react-native';
import revenueCatService from './revenueCatService';


/**
 * Platform-specific payment service
 * - iOS: Uses RevenueCat
 * - Android: Uses RevenueCat (updated to support in-app purchases)
 */
export const platformPaymentService = {
  /**
   * Initialize payment service for the current platform
   */
  initialize: async () => {
    if (Platform.OS === 'ios') {
      console.log('🍎 iOS: Initializing RevenueCat payment service');
      return await revenueCatService.initialize();
    } else {
      console.log('🤖 Android: Initializing RevenueCat payment service');
      return await revenueCatService.initialize();
    }
  },

  /**
   * Get available subscription offerings
   */
  getOfferings: async () => {
    if (Platform.OS === 'ios') {
      console.log('🍎 iOS: Getting RevenueCat offerings');
      return await revenueCatService.getOfferings();
    } else {
      console.log('🤖 Android: Getting RevenueCat offerings');
      return await revenueCatService.getOfferings();
    }
  },

  /**
   * Purchase subscription
   */
  purchaseSubscription: async (planType: 'monthly' | 'yearly') => {
    console.log(`🔍 ${Platform.OS === 'ios' ? '🍎 iOS' : '🤖 Android'}: Purchasing via RevenueCat`);
    
    const offerings = await revenueCatService.getOfferings();
    const packageId = planType === 'monthly' ? '$rc_monthly' : '$rc_annual';
    
    console.log('🔍 Looking for package:', {
      planType,
      packageId,
      availablePackages: offerings?.availablePackages?.map((p: any) => p.identifier),
      offeringsKeys: offerings ? Object.keys(offerings) : []
    });
    
    // Try to find package in availablePackages first
    let pkg = offerings?.availablePackages?.find(
      (p: any) => p.identifier === packageId
    );
    
    // If not found in availablePackages, try to find in the specific plan key
    if (!pkg && offerings && (offerings as any)[planType]) {
      pkg = (offerings as any)[planType];
      console.log('🔍 Found package in plan-specific key:', pkg);
    }
    
    if (!pkg) {
      console.error('❌ Package not found. Available packages:', offerings?.availablePackages);
      throw new Error(`No package found for ${planType} plan. Available: ${offerings?.availablePackages?.map((p: any) => p.identifier).join(', ')}`);
    }
    
    console.log('✅ Package found:', pkg.identifier);
    return await revenueCatService.purchasePackage(pkg);
  },

  /**
   * Get customer info
   */
  getCustomerInfo: async () => {
    if (Platform.OS === 'ios') {
      console.log('🍎 iOS: Getting RevenueCat customer info');
      return await revenueCatService.getCustomerInfo();
    } else {
      console.log('🤖 Android: Getting RevenueCat customer info');
      return await revenueCatService.getCustomerInfo();
    }
  },

  /**
   * Set user ID for the payment service
   */
  setUserID: async (userId: string) => {
    if (Platform.OS === 'ios') {
      console.log('🍎 iOS: Setting RevenueCat user ID');
      return await revenueCatService.setUserID(userId);
    } else {
      console.log('🤖 Android: Setting RevenueCat user ID');
      return await revenueCatService.setUserID(userId);
    }
  },

  /**
   * Restore purchases
   */
  restorePurchases: async () => {
    if (Platform.OS === 'ios') {
      console.log('🍎 iOS: Restoring RevenueCat purchases');
      return await revenueCatService.restorePurchases();
    } else {
      console.log('🤖 Android: Restoring RevenueCat purchases');
      return await revenueCatService.restorePurchases();
    }
  }
};

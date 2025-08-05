import revenueCatService from './revenueCatService';
import Config from 'react-native-config';

/**
 * Check if user has an active subscription (including trial)
 * This is the source of truth for premium access
 */
export const checkSubscriptionStatus = async (): Promise<{
  isPro: boolean;
  hasActiveSubscription: boolean;
  isOnTrial: boolean;
  subscriptionType?: string;
  expirationDate?: Date;
}> => {
  try {
    // Development bypass: always pro in non-production environments
    const currentEnv = Config.ENVIRONMENT;
    if (currentEnv !== 'production') {
      console.log('🛠️ DEV MODE: Setting isPro to true (non-production environment)');
      return {
        isPro: true,
        hasActiveSubscription: true,
        isOnTrial: false,
        subscriptionType: 'dev-bypass',
        expirationDate: undefined
      };
    }
    
    // Get customer info from RevenueCat
    const customerInfo = await revenueCatService.getCustomerInfo();
    
    // Check for active entitlements
    const entitlementId = 'MacroMeals Premium';
    const activeEntitlement = customerInfo.entitlements.active[entitlementId];
    
    // User is pro if they have any active entitlement
    const isPro = activeEntitlement !== undefined;
    const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
    
    // Check if user is on trial
    let isOnTrial = false;
    let subscriptionType: string | undefined;
    let expirationDate: Date | undefined;
    
    if (activeEntitlement) {
      const productId = activeEntitlement.productIdentifier;
      const subscription = customerInfo.subscriptionsByProductIdentifier[productId];
      
      isOnTrial = subscription?.periodType === 'TRIAL';
      subscriptionType = productId;
      expirationDate = activeEntitlement.expirationDate ? new Date(activeEntitlement.expirationDate) : undefined;
    }
    
    console.log('🔍 Subscription Status Check:', {
      environment: currentEnv,
      entitlementId,
      isPro,
      hasActiveSubscription,
      isOnTrial,
      subscriptionType,
      expirationDate,
      activeEntitlements: Object.keys(customerInfo.entitlements.active)
    });
    
    return {
      isPro,
      hasActiveSubscription,
      isOnTrial,
      subscriptionType,
      expirationDate
    };
  } catch (error) {
    console.error('❌ Failed to check subscription status:', error);
    // In case of error, default to not pro for safety
    return {
      isPro: false,
      hasActiveSubscription: false,
      isOnTrial: false
    };
  }
};

/**
 * Sync RevenueCat subscription status with app state
 * Call this when app starts and after purchases
 */
export const syncSubscriptionStatus = async (setIsPro: (isPro: boolean) => void) => {
  const status = await checkSubscriptionStatus();
  setIsPro(status.isPro);
  return status;
};
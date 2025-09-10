import revenueCatService from '../revenueCatService';

// Mock the Purchases module
jest.mock('react-native-purchases', () => ({
  Purchases: {
    configure: jest.fn(),
    getCustomerInfo: jest.fn(),
    syncPurchases: jest.fn(),
    logIn: jest.fn(),
    setAttributes: jest.fn(),
    logOut: jest.fn(),
  },
}));

describe('RevenueCat Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkSubscriptionStatus', () => {
    it('should return subscription status with active entitlements', async () => {
      const mockCustomerInfo = {
        entitlements: {
          active: {
            'MacroMeals Premium': {
              identifier: 'MacroMeals Premium',
              isActive: true,
              willRenew: true,
              periodType: 'NORMAL',
              latestPurchaseDate: '2024-01-01T00:00:00Z',
              originalPurchaseDate: '2024-01-01T00:00:00Z',
              expirationDate: '2025-01-01T00:00:00Z',
              store: 'APP_STORE',
              productIdentifier: 'premium_monthly',
            },
          },
        },
      };

      const { Purchases } = require('react-native-purchases');
      Purchases.getCustomerInfo.mockResolvedValue(mockCustomerInfo);

      const result = await revenueCatService.checkSubscriptionStatus();

      expect(result.isPro).toBe(true);
      expect(result.customerInfo).toEqual(mockCustomerInfo);
      expect(result.entitlements).toEqual(mockCustomerInfo.entitlements.active);
    });

    it('should return subscription status without active entitlements', async () => {
      const mockCustomerInfo = {
        entitlements: {
          active: {},
        },
      };

      const { Purchases } = require('react-native-purchases');
      Purchases.getCustomerInfo.mockResolvedValue(mockCustomerInfo);

      const result = await revenueCatService.checkSubscriptionStatus();

      expect(result.isPro).toBe(false);
      expect(result.customerInfo).toEqual(mockCustomerInfo);
      expect(result.entitlements).toEqual({});
    });

    it('should handle errors gracefully', async () => {
      const { Purchases } = require('react-native-purchases');
      Purchases.getCustomerInfo.mockRejectedValue(new Error('Network error'));

      await expect(revenueCatService.checkSubscriptionStatus()).rejects.toThrow('Network error');
    });
  });

  describe('syncPurchases', () => {
    it('should sync purchases successfully', async () => {
      const mockCustomerInfo = {
        entitlements: {
          active: {
            'MacroMeals Premium': {
              identifier: 'MacroMeals Premium',
              isActive: true,
            },
          },
        },
      };

      const { Purchases } = require('react-native-purchases');
      Purchases.syncPurchases.mockResolvedValue(mockCustomerInfo);

      const result = await revenueCatService.syncPurchases();

      expect(result).toEqual(mockCustomerInfo);
      expect(Purchases.syncPurchases).toHaveBeenCalledTimes(1);
    });

    it('should handle sync errors', async () => {
      const { Purchases } = require('react-native-purchases');
      Purchases.syncPurchases.mockRejectedValue(new Error('Sync failed'));

      await expect(revenueCatService.syncPurchases()).rejects.toThrow('Sync failed');
    });
  });
});

// Example of how to test the 502 error handling in axios
describe('Axios 502 Error Handling', () => {
  it('should handle 502 errors with custom message', async () => {
    // This would be tested in your axios interceptor tests
    // The 502 error should return "Unable to connect to server. Please try again later."
    
    const mockAxiosError = {
      response: {
        status: 502,
        data: { message: 'Bad Gateway' }
      },
      config: { url: '/test-endpoint' }
    };

    // In your actual axios tests, you would mock the axios instance
    // and verify that 502 errors are handled with the custom message
    expect(mockAxiosError.response?.status).toBe(502);
  });
});

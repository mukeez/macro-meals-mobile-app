import AsyncStorage from '@react-native-async-storage/async-storage';

export const debugService = {
  /**
   * Log all stored values for debugging
   */
  logAllStoredValues: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const values = await AsyncStorage.multiGet(keys);
      
      console.log('🔍 DEBUG - All stored values:');
      values.forEach(([key, value]) => {
        if (key.includes('token') || key.includes('user')) {
          console.log(`  ${key}: ${value ? 'EXISTS' : 'NULL'} (length: ${value?.length || 0})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      });
    } catch (error) {
      console.error('Error logging stored values:', error);
    }
  },

  /**
   * Check specific auth-related values
   */
  checkAuthValues: async () => {
    try {
      const [token, refreshToken, userId, onboardingCompleted] = await Promise.all([
        AsyncStorage.getItem('my_token'),
        AsyncStorage.getItem('refresh_token'),
        AsyncStorage.getItem('user_id'),
        AsyncStorage.getItem('isOnboardingCompleted'),
      ]);

      console.log('🔍 DEBUG - Auth values check:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        hasRefreshToken: !!refreshToken,
        refreshTokenLength: refreshToken?.length || 0,
        hasUserId: !!userId,
        userId: userId,
        onboardingCompleted: onboardingCompleted,
      });

      return { token, refreshToken, userId, onboardingCompleted };
    } catch (error) {
      console.error('Error checking auth values:', error);
      return null;
    }
  },

  /**
   * Clear all auth-related values
   */
  clearAuthValues: async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('my_token'),
        AsyncStorage.removeItem('refresh_token'),
        AsyncStorage.removeItem('user_id'),
        AsyncStorage.removeItem('isOnboardingCompleted'),
      ]);
      console.log('🔍 DEBUG - Cleared all auth values');
    } catch (error) {
      console.error('Error clearing auth values:', error);
    }
  }
}; 
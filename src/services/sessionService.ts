import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from './userService';

export interface SessionValidationResult {
  isValid: boolean;
  isComplete: boolean;
  user?: any;
  error?: string;
}

export interface SessionState {
  sessionValid: boolean;
  sessionComplete: boolean;
  lastValidationTime?: number;
}

/**
 * Validates the current user session
 * Returns detailed validation result including user profile
 */
export const validateSession = async (): Promise<SessionValidationResult> => {
  try {
    // Check if tokens exist
    const [token, userId] = await Promise.all([
      AsyncStorage.getItem('my_token'),
      AsyncStorage.getItem('user_id'),
    ]);

    console.log('🔍 SessionService - Checking stored credentials:', {
      hasToken: !!token,
      hasUserId: !!userId,
      tokenLength: token?.length,
      userId
    });

    if (!token || !userId) {
      return {
        isValid: false,
        isComplete: false,
        error: 'No stored credentials found',
      };
    }

    // Check if refresh token exists (axios interceptor will handle refresh)
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    console.log('🔍 SessionService - Token check:', {
      hasAccessToken: !!token,
      hasRefreshToken: !!refreshToken,
      tokenLength: token?.length,
      refreshTokenLength: refreshToken?.length
    });

    // Validate token by fetching user profile
    console.log('🔍 SessionService - Fetching user profile...');
    const profile = await userService.getProfile();
    
    console.log('🔍 SessionService - Profile fetched:', {
      hasProfile: !!profile,
      hasMacros: profile?.has_macros,
      isPro: profile?.is_pro,
      email: profile?.email,
      id: profile?.id
    });
    
    // Check if profile has required data
    const hasRequiredData = profile && 
      typeof profile.has_macros === 'boolean' && 
      typeof profile.is_pro === 'boolean';

    if (!hasRequiredData) {
      return {
        isValid: false,
        isComplete: false,
        error: 'Profile missing required data',
        user: profile,
      };
    }

    // Session is valid and complete if user has macros set up
    const isComplete = profile.has_macros === true;

    console.log('🔍 SessionService - Session validation result:', {
      isValid: true,
      isComplete,
      hasMacros: profile.has_macros,
      isPro: profile.is_pro
    });

    return {
      isValid: true,
      isComplete,
      user: profile,
    };

  } catch (error) {
    console.error('🔍 SessionService - Session validation failed:', error);
    return {
      isValid: false,
      isComplete: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Gets the current session state
 */
export const getSessionState = async (): Promise<SessionState> => {
  try {
    const validationResult = await validateSession();
    const lastValidationTime = Date.now();

    return {
      sessionValid: validationResult.isValid,
      sessionComplete: validationResult.isComplete,
      lastValidationTime,
    };
  } catch (error) {
    console.error('Error getting session state:', error);
    return {
      sessionValid: false,
      sessionComplete: false,
    };
  }
};

/**
 * Clears all session data
 */
export const clearSession = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem('my_token'),
      AsyncStorage.removeItem('refresh_token'),
      AsyncStorage.removeItem('user_id'),
    ]);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}; 
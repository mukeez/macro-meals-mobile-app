import { create } from 'zustand';
import { Meal, UserPreferences } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Default user preferences with all values set to 0.
 */
const DEFAULT_USER_PREFERENCES: UserPreferences = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    location: '',
    age: 0,
    weight: 0,
    height: 0,
    sex: undefined,
    activityLevel: undefined,
    goal: undefined,
};

/**
 * Interface for the application state store.
 */
interface AppState {
    // Authentication state
    isAuthenticated: boolean;
    token: string | null;
    userId: string | null;

    // Authentication methods
    setAuthenticated: (authenticated: boolean, token: string, userId: string) => void;
    logout: () => void;

    // User preferences state
    preferences: UserPreferences;
    updatePreferences: (newPreferences: Partial<UserPreferences>) => void;
    resetPreferences: () => void;

    // Meal suggestions state
    suggestedMeals: Meal[];
    isLoadingSuggestions: boolean;
    suggestionsError: string | null;
    setSuggestedMeals: (meals: Meal[]) => void;
    setIsLoadingSuggestions: (isLoading: boolean) => void;
    setSuggestionsError: (error: string | null) => void;
}

/**
 * Zustand store hook for global application state.
 */
const useStore = create<AppState>((set) => ({
    // Authentication state
    isAuthenticated: false,
    token: null,
    userId: null,

    setAuthenticated: async (authenticated, token, userId) => {
        console.log('Setting authenticated during onboarding:', { authenticated, userId });

        // Validate user ID
        if (!userId) {
            console.error('No user ID provided');
            return;
        }

        set({
            isAuthenticated: authenticated,
            token: '',
            userId
        });

        // Store user ID for onboarding
        try {
            await AsyncStorage.setItem('user_id', userId);
            console.log('Successfully stored user ID for onboarding');
        } catch (error) {
            console.error('Error storing user ID:', error);
        }
    },
    logout: async () => {
        set({
            isAuthenticated: false,
            token: null,
            userId: null,
            preferences: DEFAULT_USER_PREFERENCES,
            suggestedMeals: []
        });

        // Clear stored authentication data
        try {
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('user_id');
            console.log('Removed access token and user ID');
        } catch (error) {
            console.error('Error removing authentication data:', error);
        }
    },

    // User preferences
    preferences: DEFAULT_USER_PREFERENCES,

    updatePreferences: (newPreferences) =>
        set((state) => ({
            preferences: {
                ...state.preferences,
                ...newPreferences,
            },
        })),

    resetPreferences: () =>
        set(() => ({
            preferences: DEFAULT_USER_PREFERENCES,
        })),

    // Meal suggestions
    suggestedMeals: [],
    isLoadingSuggestions: false,
    suggestionsError: null,

    setSuggestedMeals: (meals) =>
        set(() => ({
            suggestedMeals: meals,
        })),

    setIsLoadingSuggestions: (isLoading) =>
        set(() => ({
            isLoadingSuggestions: isLoading,
        })),

    setSuggestionsError: (error) =>
        set(() => ({
            suggestionsError: error,
        })),
}));

export default useStore;
// store/useStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meal, UserPreferences } from '../types';
import { authService } from '../services/authService';

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
    gender: undefined,
    activityLevel: undefined,
    goal: undefined,
    unitSystem: 'Metric',
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
    checkAuth: () => Promise<boolean>;
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
const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Authentication state
            isAuthenticated: false,
            token: null,
            userId: null,

            setAuthenticated: (authenticated, token, userId) => {
                console.log('Setting authenticated:', { authenticated, userId });
                set({
                    isAuthenticated: authenticated,
                    token,
                    userId
                });
            },

            checkAuth: async () => {
                try {
                    const token = await AsyncStorage.getItem('token');
                    const userId = await AsyncStorage.getItem('userId');

                    if (token && userId) {
                        // Optionally validate token here
                        set({
                            isAuthenticated: true,
                            token,
                            userId
                        });
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('Error checking auth:', error);
                    return false;
                }
            },

            logout: async () => {
                try {
                    await authService.logout();
                } catch (error) {
                    console.error('Error during logout:', error);
                } finally {
                    set({
                        isAuthenticated: false,
                        token: null,
                        userId: null,
                        preferences: DEFAULT_USER_PREFERENCES,
                        suggestedMeals: []
                    });

                    // Clear stored authentication data
                    await AsyncStorage.removeItem('token');
                    await AsyncStorage.removeItem('userId');
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
        }),
        {
            name: 'macromate-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                token: state.token,
                userId: state.userId,
                preferences: state.preferences,
            }),
        }
    )
);

export default useStore;
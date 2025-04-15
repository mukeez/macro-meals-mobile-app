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
interface LoggedMeal {
    id: string;
    user_id: string;
    name: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
    meal_time: string;
    created_at: string;
}

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

    // Logged meals state and actions
    loggedMeals: Meal[];
    addLoggedMeal: (meal: Meal) => void;
    setLoggedMeals: (meals: Meal[]) => void;
    refreshMeals: () => Promise<void>;
    shouldRefreshMeals: boolean;
    setShouldRefreshMeals: (shouldRefresh: boolean) => void;
}

/**
 * Convert API LoggedMeal format to app Meal format with null checking
 */
const convertToMeal = (loggedMeal: LoggedMeal): Meal | null => {
    if (!loggedMeal) return null;

    return {
        id: loggedMeal.id || String(Math.random()),
        name: loggedMeal.name || 'Unnamed Meal',
        restaurant: {
            name: 'Home',  // Default value if not provided by API
            location: '',
        },
        macros: {
            calories: loggedMeal.calories || 0,
            protein: loggedMeal.protein || 0,
            carbs: loggedMeal.carbs || 0,
            fat: loggedMeal.fat || 0,
        },
        description: '',  // Default value if not provided by API
        date: loggedMeal.meal_time || new Date().toISOString(),
        mealType: 'lunch',  // Default value if not provided by API
    };
};

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
                console.log('Setting authenticated:', {
                    authenticated,
                    userId
                });
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

            // Initialize loggedMeals as an empty array
            loggedMeals: [],

            addLoggedMeal: (meal) => {
                if (!meal) return;
                set((state) => ({
                    loggedMeals: [...(state.loggedMeals || []), meal]
                }));
            },

            setLoggedMeals: (meals) => set({ loggedMeals: meals || [] }),

            shouldRefreshMeals: false,

            setShouldRefreshMeals: (shouldRefresh) => set({ shouldRefreshMeals: shouldRefresh }),

            refreshMeals: async () => {
                try {
                    // Import here to avoid circular dependencies
                    const mealServiceModule = await import('../services/mealService');
                    const { mealService } = mealServiceModule;

                    if (!mealService || !mealService.getTodaysMeals) {
                        console.error('Meal service not available');
                        return;
                    }

                    const todaysMeals = await mealService.getTodaysMeals();

                    if (!todaysMeals) {
                        console.error('No meals returned from API');
                        set({ loggedMeals: [], shouldRefreshMeals: false });
                        return;
                    }

                    // Convert API format to app format with null checking
                    const meals = todaysMeals
                        .filter(meal => meal) // Remove null items
                        .map(convertToMeal)
                        .filter(meal => meal); // Remove nulls after conversion

                    set({
                        loggedMeals: meals || [],
                        shouldRefreshMeals: false
                    });
                } catch (error) {
                    console.error('Failed to refresh meals:', error);
                    // Set empty array on error to avoid undefined
                    set({ loggedMeals: [], shouldRefreshMeals: false });
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
                        suggestedMeals: [],
                        suggestionsError: null,
                        loggedMeals: [], // Clear logged meals on logout
                        shouldRefreshMeals: false
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
                suggestedMeals: state.suggestedMeals,
                suggestionsError: state.suggestionsError,
                loggedMeals: state.loggedMeals
            }),
        }
    )
);

export default useStore;
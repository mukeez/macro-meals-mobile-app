import { create } from 'zustand';
import { Meal, UserPreferences } from '../types';

/**
 * Default user preferences.
 */
const DEFAULT_USER_PREFERENCES: UserPreferences = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 70,
    location: '',
};

/**
 * Interface for the application state store.
 */
interface AppState {
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
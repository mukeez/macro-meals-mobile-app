import { SuggestMealsRequest, SuggestMealsResponse, UserPreferences, Meal } from '../types';
import useStore from "../store/useStore";

/**
 * API configuration.
 */
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.macromealsapp.com/api/v1';
const API_ENDPOINTS = {
    SUGGEST_MEALS: `${API_BASE_URL}/meals/suggest-meals`,
    LOG_MEAL: `${API_BASE_URL}/meals/add`,
    TODAY_MEALS: `${API_BASE_URL}/meals/today`,
    DAILY_PROGRESS: `${API_BASE_URL}/meals/progress/today`,
};

/**
 * Interface for meal data to be logged
 */
interface LogMealRequest {
    name: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
    meal_type?: string;
}

/**
 * Interface for logged meal response
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

/**
 * Interface for daily progress response
 */
interface DailyProgressResponse {
    logged_macros: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    target_macros: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    progress_percentage: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

/**
 * Service for meal-related API operations.
 */
export const mealService = {
    /**
     * Fetches meal suggestions based on user macroAndLocation.
     *
     * @param macroAndLocation - User macro targets and location
     * @returns Promise with suggested meals
     */
    suggestMeals: async (macroAndLocation: any): Promise<Meal[]> => {
        const token = useStore.getState().token;
        try {
            const response = await fetch(API_ENDPOINTS.SUGGEST_MEALS, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(macroAndLocation),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch meal suggestions: ${errorText}`);
            }

            const data: SuggestMealsResponse = await response.json();
            return data.meals;
        } catch (error) {
            console.error('Error suggesting meals:', error);
            throw error;
        }
    },

    /**
     * Log a meal to the backend
     * @param mealData - The meal data to log
     * @returns The logged meal data with ID
     * @throws Error if the request fails
     */
    logMeal: async (mealData: LogMealRequest): Promise<LoggedMeal> => {
        const token = useStore.getState().token;

        if (!token) {
            throw new Error('Authentication required');
        }

        try {
            const response = await fetch(API_ENDPOINTS.LOG_MEAL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mealData),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to log meal';
                try {
                    const errorData = await response.json();
                    if (errorData.detail) {
                        errorMessage = errorData.detail;
                    }
                } catch (e) {
                    // If parsing fails, use the default error message
                }
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('Error logging meal:', error);
            throw error;
        }
    },

    /**
     * Get today's logged meals
     * @returns Array of logged meals for today
     * @throws Error if the request fails
     */
    getTodaysMeals: async (): Promise<LoggedMeal[]> => {
        const token = useStore.getState().token;

        if (!token) {
            throw new Error('Authentication required');
        }

        try {
            const response = await fetch(API_ENDPOINTS.TODAY_MEALS, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                let errorMessage = 'Failed to fetch today\'s meals';
                try {
                    const errorData = await response.json();
                    if (errorData.detail) {
                        errorMessage = errorData.detail;
                    }
                } catch (e) {
                    // If parsing fails, use the default error message
                }
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching today\'s meals:', error);
            throw error;
        }
    },

    /**
     * Get daily macro progress
     * @returns Daily progress with consumed and target macros
     * @throws Error if the request fails
     */
    getDailyProgress: async (): Promise<DailyProgressResponse> => {
        const token = useStore.getState().token;

        if (!token) {
            throw new Error('Authentication required');
        }

        try {
            const response = await fetch(API_ENDPOINTS.DAILY_PROGRESS, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                let errorMessage = 'Failed to fetch daily progress';
                try {
                    const errorData = await response.json();
                    if (errorData.detail) {
                        errorMessage = errorData.detail;
                    }
                } catch (e) {
                    // If parsing fails, use the default error message
                }
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching daily progress:', error);
            throw error;
        }
    }
};
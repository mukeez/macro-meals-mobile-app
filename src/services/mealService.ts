import { SuggestMealsRequest, SuggestMealsResponse, UserPreferences, Meal, LoggedMeal } from '../types';
import { authTokenService } from './authTokenService';
import { userService } from './userService';

/**
 * API configuration.
 */
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.macromealsapp.com/api/v1';
const API_ENDPOINTS = {
    SUGGEST_MEALS: `${API_BASE_URL}/meals/suggest-meals`,
    LOG_MEAL: `${API_BASE_URL}/meals/add`,
    TODAY_MEALS: `${API_BASE_URL}/meals/today`,
    DAILY_PROGRESS: `${API_BASE_URL}/meals/progress/today`,
    DELETE_MEAL: `${API_BASE_URL}/meals/delete`,
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
 * Interface for AI meal suggestions request
 */
interface AiMealSuggestionsRequest {
    calories: number;
    carbs: number;
    fat: number;
    latitude: number;
    location: string;
    longitude: number;
    protein: number;
}

/**
 * Service for meal-related API operations.
 */
export const mealService = {
    /**
     * Fetches AI meal suggestions based on user preferences and macro targets
     * @param requestBody - The request body with macro targets and location
     * @returns Promise with suggested meals
     * @throws Error if the request fails or times out
     */
    suggestAiMeals: async (requestBody: AiMealSuggestionsRequest): Promise<Meal[]> => {
        const token = authTokenService.getToken();
        
        if (!token) {
            throw new Error('Authentication required');
        }

        // Create an AbortController for the timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, 60000); // 1 minute timeout

        try {
            const response = await fetch(API_ENDPOINTS.SUGGEST_MEALS, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.meals || [];
        } catch (err: any) {
            if (err.name === 'AbortError') {
                throw new Error('Request timed out after 1 minute. Please try again.');
            } else {
                throw new Error(err.message || 'Error fetching AI meal suggestions');
            }
        } finally {
            clearTimeout(timeoutId);
        }
    },

    /**
     * Fetches AI meal suggestions with automatic preference fetching
     * @returns Promise with suggested meals
     * @throws Error if the request fails
     */
    getAiMealSuggestions: async (): Promise<{ meals: Meal[], preferences: any }> => {
        try {
            // First fetch preferences from userService
            const preferences = await userService.getPreferences();
            
            // Create request body with preferences data
            const requestBody: AiMealSuggestionsRequest = {
                calories: preferences.calorie_target,
                carbs: preferences.carbs_target,
                fat: preferences.fat_target,
                protein: preferences.protein_target,
                latitude: 0,
                location: '',
                longitude: 0,
            };

            // Fetch AI meal suggestions
            const meals = await mealService.suggestAiMeals(requestBody);
            
            return { meals, preferences };
        } catch (error) {
            console.error('Error getting AI meal suggestions:', error);
            throw error;
        }
    },

    /**
     * Fetches meal suggestions based on user macroAndLocation.
     *
     * @param macroAndLocation - User macro targets and location
     * @returns Promise with suggested meals
     */
    suggestMeals: async (macroAndLocation: any): Promise<Meal[]> => {
        const token = authTokenService.getToken();
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
        const token = authTokenService.getToken();

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

            const loggedMeal = await response.json();
            return {
                id: loggedMeal.id,
                name: loggedMeal.name,
                timestamp: loggedMeal.meal_time,
                protein: loggedMeal.protein,
                carbs: loggedMeal.carbs,
                fat: loggedMeal.fat,
                calories: loggedMeal.calories,
                mealType: loggedMeal.meal_type,
            };
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
    getLoggedMeals: async (): Promise<LoggedMeal[]> => {
        const token = authTokenService.getToken();

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
                }
                throw new Error(errorMessage);
            }

            const meals = await response.json();
            return meals.map((meal: any) => ({
                id: meal.id,
                name: meal.name,
                timestamp: meal.meal_time,
                protein: meal.protein,
                carbs: meal.carbs,
                fat: meal.fat,
                calories: meal.calories,
                mealType: meal.meal_type,
            }));
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
        const token = authTokenService.getToken();

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
                }
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching daily progress:', error);
            throw error;
        }
    },

    /**
     * Delete a logged meal
     * @param mealId - The ID of the meal to delete
     * @throws Error if the request fails
     */
    deleteMeal: async (mealId: string): Promise<void> => {
        const token = authTokenService.getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        try {
            const response = await fetch(`${API_ENDPOINTS.DELETE_MEAL}/${mealId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                let errorMessage = 'Failed to delete meal';
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
        } catch (error) {
            console.error('Error deleting meal:', error);
            throw error;
        }
    },
};
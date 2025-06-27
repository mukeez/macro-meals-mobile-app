import { SuggestMealsRequest, SuggestMealsResponse, UserPreferences, Meal, LoggedMeal } from '../types';
import { authTokenService } from './authTokenService';

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
     MEAL_PROGRESS: `${API_BASE_URL}/meals/progress`
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

export async function getMealProgress(startDate: string, endDate: string) {
    const url = `${API_ENDPOINTS.MEAL_PROGRESS}?start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch meal progress");
    }
    return response.json();
}
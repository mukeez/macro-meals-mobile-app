import { SuggestMealsRequest, SuggestMealsResponse, UserPreferences, Meal, LoggedMeal } from '../types';
import { authTokenService } from './authTokenService';
import { userService } from './userService';
import useStore from 'src/store/useStore';

/**
 * API configuration.
 */
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.macromealsapp.com/api/v1';
const API_ENDPOINTS = {
    SUGGEST_MEALS: `${API_BASE_URL}/meals/suggest-meals`,
    LOG_MEAL: `${API_BASE_URL}/meals/add`,
    TODAY_MEALS: `${API_BASE_URL}/meals/today`,
    DAILY_PROGRESS: `${API_BASE_URL}/meals/progress/today`,
    DELETE_MEAL: `${API_BASE_URL}/meals/`,
    MEAL_PROGRESS: `${API_BASE_URL}/meals/progress`,
    MEALS: `${API_BASE_URL}/meals/logs`,
    EDIT_MEAL: `${API_BASE_URL}/meals/{id}`,
    SEARCH_MEAL: `${API_BASE_URL}/meals/search?query={query}`,
    SEARCH_MEALS_API: `${API_BASE_URL}/products/search-meals-format?query={query}`
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
    meal_time?: string;
    description?: string;
    serving_size?: string;
    serving_unit?: string;
    number_of_servings?: string;
    photo?: {
        uri: string;
        type?: string;
        name?: string;
    };
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

interface MealProgressResponse {
    daily_macros: [
        {
                date: string,
            calories: number,
            protein: number;
            carbs: number;
            fat: number;
        }
    ];
    average_macros: {
        calories: number,
        protein: number,
        carbs: number,
        fat: number
    };
    target_macros: {
        calories: number,
        protein: number,
        carbs: number,
        fat: number
    };
    comparison_percentage: {
        calories: number,
        protein: number,
        carbs: number,
        fat: number
    };
    start_date: string;
    end_date: string;
    days_with_logs: number;
    total_days: number;
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
        const token = useStore.getState().token;
        
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

            console.log('requestBody', JSON.stringify(requestBody, null, 2));

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
            throw new Error('No authentication token found');
        }

        try {
            const formData = new FormData();
            
            // Handle photo separately to avoid stringification
            const { photo, ...mealDataWithoutPhoto } = mealData;

            // Add all meal data to FormData
            Object.entries(mealDataWithoutPhoto).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            // Add photo to FormData if it exists
            if (photo?.uri) {
                // Get the file extension from the URI
                const uriParts = photo.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];

                formData.append('photo', {
                    uri: photo.uri,
                    type: `image/${fileType}`,
                    name: `photo.${fileType}`
                } as any);
            }

            const response = await fetch(API_ENDPOINTS.LOG_MEAL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to log meal:', errorText);
                throw new Error(`Failed to log meal: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error logging meal:', error);
            throw error;
        }
    },

    updateMeal: async (mealData: LogMealRequest, mealId: string): Promise<LoggedMeal> => {
        const token = useStore.getState().token;
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const formData = new FormData();
            
            // Handle photo separately to avoid stringification
            const { photo, ...mealDataWithoutPhoto } = mealData;

            // Add all meal data to FormData
            Object.entries(mealDataWithoutPhoto).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            // Add photo to FormData if it exists - using same format as logMeal
            if (photo && photo.uri) {
                formData.append('photo', {
                    uri: photo.uri,
                    type: 'image/jpeg',
                    name: 'meal_photo.jpg'
                } as any);
            }

            const updateUrl = API_ENDPOINTS.EDIT_MEAL.replace('{id}', mealId);
            const response = await fetch(updateUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Don't set Content-Type header, let the browser set it with the boundary
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update meal: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating meal:', error);
            throw error;
        }
    },

    /**
     * Get today's logged meals
     * @returns Array of logged meals for today
     * @throws Error if the request fails
     */
    getLoggedMeals: async (): Promise<LoggedMeal[]> => {
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
     * Search for meals by name
     * @param query - The query to search for
     * @returns Promise with suggested meals
     * @throws Error if the request fails
     */
    searchMeal: async (query: string): Promise<Meal[]> => {
        const token = useStore.getState().token;
        const url = API_ENDPOINTS.SEARCH_MEAL.replace('{query}', query);
        console.log('🔍 Search URL:', url);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();    
            throw new Error(`Failed to search meals: ${errorText}`);
        }

        const data = await response.json();
        console.log('🔍 Parsed response data:', data);
        return data;
    },

    /**
     * Search for meals by name
     * @param query - The query to search for
     * @returns Promise with suggested meals
     * @throws Error if the request fails
     */

    searchMealsApi: async (query: string): Promise<any> => {
        const token = useStore.getState().token;
        const url = API_ENDPOINTS.SEARCH_MEALS_API.replace('{query}', query);
        console.log('🔍 Global search service - URL:', url);
        console.log('🔍 Global search service - Token available:', !!token);
        console.log('🔍 Global search service - Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        console.log('🔍 Global search service - Response status:', response.status);
        console.log('🔍 Global search service - Response ok:', response.ok);
        console.log('🔍 Global search service - Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.log('🔍 Global search service - Error response:', errorText);
            throw new Error(`Failed to search meals: ${errorText}`);
        }

        const data = await response.json();
        console.log('🔍 Global search service - Parsed data:', data);
        return data;
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
        const token = useStore.getState().token;

        if (!token) {
            throw new Error('Authentication required');
        }
        console.log('Deleting meal:', mealId);

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
    const token = useStore.getState().token;
    const url = `${API_ENDPOINTS.MEAL_PROGRESS}?start_date=${startDate}&end_date=${endDate}`;
    console.log('getMealProgress URL:', url);
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('getMealProgress error:', response.status, errorText);
        throw new Error(`Failed to fetch meal progress: ${response.status}`);
    }
    
    const json: MealProgressResponse = await response.json();
    console.log('Get Meal Progress Response:', json);
    return json;
}


export async function getMeals(startDate: string, endDate: string) {
    const token = useStore.getState().token;
    const url = `${API_ENDPOINTS.MEALS}?start_date=${startDate}&end_date=${endDate}`;
    console.log('getMeals URL:', url);
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('getMeals error:', response.status, errorText);
        throw new Error(`Failed to fetch meals: ${response.status}`);
    }
    
    const meals = await response.json();
    console.log('Get Meals Response:', meals);
    return meals;
}
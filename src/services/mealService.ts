import { SuggestMealsRequest, SuggestMealsResponse, UserPreferences, Meal } from '../types';
import useAuthStore from "../store/authStore";
import useStore from "../store/useStore";

/**
 * API configuration.
 */
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.macromealsapp.com/api/v1';
const API_ENDPOINTS = {
    SUGGEST_MEALS: `${API_BASE_URL}/meals/suggest-meals`,
};

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

            console.log(response)

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
    
};
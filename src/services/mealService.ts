import { SuggestMealsRequest, SuggestMealsResponse, UserPreferences, Meal } from '../types';

/**
 * API configuration.
 */
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.macromealsapp.com/api/v1';
const API_ENDPOINTS = {
    SUGGEST_MEALS: `${API_BASE_URL}/suggest-meals`,
};

/**
 * Service for meal-related API operations.
 */
export const mealService = {
    /**
     * Fetches meal suggestions based on user preferences.
     *
     * @param preferences - User macro targets and location
     * @returns Promise with suggested meals
     */
    suggestMeals: async (preferences: UserPreferences): Promise<Meal[]> => {
        try {
            const response = await fetch(API_ENDPOINTS.SUGGEST_MEALS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preferences),
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
     * Mock function to get meal suggestions for offline development.
     *
     * @param preferences - User macro targets and location
     * @returns Promise with mock suggested meals
     */
    getMockMealSuggestions: async (preferences: UserPreferences): Promise<Meal[]> => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Generate mock meals based on the user's preferences
        return [
            {
                id: '1',
                name: 'Grilled Chicken Salad',
                restaurant: 'Healthy Eats',
                macros: {
                    calories: Math.round(preferences.calories * 0.3),
                    protein: Math.round(preferences.protein * 0.4),
                    carbs: Math.round(preferences.carbs * 0.2),
                    fat: Math.round(preferences.fat * 0.25),
                },
                description: 'Fresh greens with grilled chicken breast',
                price: 12.99,
                distance: 1.2,
            },
            {
                id: '2',
                name: 'Protein Smoothie Bowl',
                restaurant: 'Smoothie Bar',
                macros: {
                    calories: Math.round(preferences.calories * 0.2),
                    protein: Math.round(preferences.protein * 0.3),
                    carbs: Math.round(preferences.carbs * 0.25),
                    fat: Math.round(preferences.fat * 0.1),
                },
                description: 'Protein-packed smoothie bowl with fruits and nuts',
                price: 9.99,
                distance: 0.7,
            },
            {
                id: '3',
                name: 'Steak and Veggies',
                restaurant: 'Protein House',
                macros: {
                    calories: Math.round(preferences.calories * 0.4),
                    protein: Math.round(preferences.protein * 0.5),
                    carbs: Math.round(preferences.carbs * 0.1),
                    fat: Math.round(preferences.fat * 0.4),
                },
                description: 'Lean steak with steamed vegetables',
                price: 18.99,
                distance: 2.3,
            },
        ];
    },
};
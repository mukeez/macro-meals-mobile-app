// types/index.ts

/**
 * Represents user's macro targets.
 */
export interface MacroTargets {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

/**
 * User preferences including macro targets and additional details.
 */
export interface UserPreferences extends MacroTargets {
    location: string;
    latitude?: number;
    longitude?: number;
    age?: number;
    weight?: number;
    height?: number;
    gender?: 'Male' | 'Female';
    activityLevel?: 'Sedentary' | 'Moderate' | 'Active';
    goal?: 'Lose' | 'Maintain' | 'Gain';
    unitSystem?: 'Metric' | 'Imperial';
}

/**
 * Represents a meal suggestion from a restaurant.
 */
export interface Meal {
    id: string;
    name: string;
    restaurant: Restaurant;
    macros: MacroTargets;
    imageUrl?: string;
    description?: string;
    price?: number;
    distance?: number; // Distance in kilometers or miles
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    date?: string; // ISO date string for logged meals
}

/**
 * Request payload for meal suggestions.
 */
export interface SuggestMealsRequest extends UserPreferences {}

/**
 * Response from the meal suggestion API.
 */
export interface SuggestMealsResponse {
    meals: Meal[];
}

export interface Restaurant {
    name: string;
    location: string;
}
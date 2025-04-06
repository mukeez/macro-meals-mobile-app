/**
 * Main types used throughout the application.
 */

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
 * User preferences including macro targets and location.
 */
export interface UserPreferences extends MacroTargets {
    location: string;
}

/**
 * Represents a meal suggestion from a restaurant.
 */
export interface Meal {
    id: string;
    name: string;
    restaurant: string;
    macros: MacroTargets;
    imageUrl?: string;
    description?: string;
    price?: number;
    distance?: number; // Distance in kilometers or miles
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
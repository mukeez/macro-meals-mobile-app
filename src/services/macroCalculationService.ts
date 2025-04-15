// src/services/macroCalculationService.ts

import { UserPreferences } from '../types';

const API_BASE_URL = 'https://api.macromealsapp.com/api/v1';

/**
 * Service for handling macro calculations via the backend API.
 */
export const macroCalculationService = {
    /**
     * Calculate macros using the backend API.
     *
     * @param userData - User metrics and preferences
     * @returns Promise with calculated macronutrient values
     */
    calculateMacros: async (userData: {
        age: number;
        weight: number;
        height: number;
        sex: string;
        activityLevel: string;
        goal: string;
        unitSystem: 'Metric' | 'Imperial';
    }): Promise<any> => {
        try {
            const requestData = {
                age: userData.age,
                weight: userData.weight,
                height: userData.height,
                sex: userData.sex === "Male" ? "male" : "female",
                activity_level: userData.activityLevel.toLowerCase(),
                goal: userData.goal.toLowerCase(),
                unit_system: userData.unitSystem.toLowerCase(),
            };

            // Make the API request
            const response = await fetch(`${API_BASE_URL}/macros/calculate-macros`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to calculate macros';
                try {
                    const errorData = await response.json();
                    if (errorData.detail) {
                        errorMessage = errorData.detail;
                    }
                } catch (e) {
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            return {
                calories: data.calories,
                protein: data.protein,
                carbs: data.carbs,
                fat: data.fat,
                age: userData.age,
                weight: userData.weight,
                height: userData.height,
                sex: userData.sex,
                activityLevel: userData.activityLevel,
                goal: userData.goal,
                location: '',
            };
        } catch (error) {
            console.error('Error calculating macros:', error);
            throw error;
        }
    }
};
// src/services/macroCalculationService.ts

import { UserPreferences } from '../types';
import axiosInstance from './axios';

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
            const response = await axiosInstance.post('/macros/calculate-macros', requestData);

            const data = response.data;

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
import axiosInstance from './axios';

// Example service using the axios instance
export const axiosService = {
  // Example: Fetch user profile
  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Example: Update user preferences
  updateUserPreferences: async (preferences: any) => {
    try {
      const response = await axiosInstance.post('/user/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  },

  // Example: Fetch meal suggestions
  getMealSuggestions: async (params: any) => {
    try {
      const response = await axiosInstance.post('/meals/suggest', params);
      return response.data;
    } catch (error) {
      console.error('Error fetching meal suggestions:', error);
      throw error;
    }
  },

  // Example: Log a meal
  logMeal: async (mealData: any) => {
    try {
      const response = await axiosInstance.post('/meals/log', mealData);
      return response.data;
    } catch (error) {
      console.error('Error logging meal:', error);
      throw error;
    }
  },

  // Example: Get today's meals
  getTodaysMeals: async () => {
    try {
      const response = await axiosInstance.get('/meals/today');
      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s meals:', error);
      throw error;
    }
  },

  // Example: Delete a meal
  deleteMeal: async (mealId: string) => {
    try {
      const response = await axiosInstance.delete(`/meals/${mealId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting meal:', error);
      throw error;
    }
  },
};

export default axiosService; 
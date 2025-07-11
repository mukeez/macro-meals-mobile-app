import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteMeal {
  id: string;
  name: string;
  macros: {
    calories: number;
    carbs: number;
    fat: number;
    protein: number;
  };
  image: any;
  restaurant: {
    name: string;
    location: string;
  };
  addedAt: string;
  serving_size: number;
  no_of_servings: number;
  meal_type: string;
  meal_time: string;
}

const FAVORITES_STORAGE_KEY = '@macro_meals_favorites';

export class FavoritesService {
  /**
   * Get all favorite meals from local storage
   */
  static async getFavorites(): Promise<FavoriteMeal[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  /**
   * Save favorites to local storage
   */
  static async saveFavorites(favorites: FavoriteMeal[]): Promise<void> {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
      throw error;
    }
  }

  /**
   * Add a meal to favorites
   */
  static async addToFavorites(meal: Omit<FavoriteMeal, 'id' | 'addedAt'>): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const newFavorite: FavoriteMeal = {
        ...meal,
        id: `${meal.name}-${meal.restaurant.name}-${Date.now()}`,
        addedAt: new Date().toISOString(),
      };
      const updatedFavorites = [...favorites, newFavorite];
      await this.saveFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove a meal from favorites
   */
  static async removeFromFavorites(mealName: string, restaurantName: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(
        fav => !(fav.name === mealName && fav.restaurant.name === restaurantName)
      );
      await this.saveFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  /**
   * Check if a meal is in favorites
   */
  static async isFavorite(mealName: string, restaurantName: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.name === mealName && fav.restaurant.name === restaurantName);
    } catch (error) {
      console.error('Error checking if favorite:', error);
      return false;
    }
  }

  /**
   * Toggle favorite status of a meal
   */
  static async toggleFavorite(meal: Omit<FavoriteMeal, 'id' | 'addedAt'>): Promise<boolean> {
    try {
      const isCurrentlyFavorite = await this.isFavorite(meal.name, meal.restaurant.name);
      
      if (isCurrentlyFavorite) {
        await this.removeFromFavorites(meal.name, meal.restaurant.name);
        return false;
      } else {
        await this.addToFavorites(meal);
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Clear all favorites
   */
  static async clearFavorites(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing favorites:', error);
      throw error;
    }
  }
}

export default FavoritesService; 
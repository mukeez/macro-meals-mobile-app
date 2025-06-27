import useStore from "../store/useStore";
import { authTokenService } from "./authTokenService";

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.macromealsapp.com/api/v1';

/**
 * Default user preferences
 */
const defaultPreferences = {
    calorie_target: 0,
    carbs_target: 0,
    fat_target: 0,
    protein_target: 0,
    dietary_restrictions: [],
    disliked_ingredients: [],
    favorite_cuisines: []
};

export const userService = {
  /**
   * Fetches user profile information
   * @returns User profile data
   * @throws Error if the request fails
   */
  getProfile: async (): Promise<any> => {
    const token = useStore.getState().token;
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  },

  /**
   * Fetches user preferences from the backend
   * @returns User preferences or default preferences if not found
   */
  getPreferences: async (): Promise<any> => {
    const token = authTokenService.getToken();
    
    //! Once there is no token, we will need to log the user out
    //! This implementation will be replaced with axios which will
    //! intercept the request and check if the token is valid
    //! If the token is not valid, we will log the user out
    //! If the token is valid, we will continue with the request
    if (!token) {
      return defaultPreferences;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/preferences`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return defaultPreferences;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch preferences: ${response.status}`);
      }
      
      const preferences = await response.json();
      return preferences;
    } catch (err) {
      console.error('Error fetching preferences:', err);
      return defaultPreferences;
    }
  },

  /**
   * Updates user preferences
   * @param prefs - The preferences to update
   * @returns Updated user data
   * @throws Error if the request fails
   */
  updatePreferences: async (prefs: Record<string, any>): Promise<any> => {
    const token = useStore.getState().token;
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_BASE_URL}/user/preferences`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(prefs)
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  },

  updateProfile: async (fields: Record<string, any>): Promise<any> => {
    const token = useStore.getState().token;
    if (!token) throw new Error("Authentication required");

    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(fields)
    });
    const responseText = await response.text();
    if (!response.ok) {
      console.error('[PATCH ERROR] /user/me', response.status, responseText);
      throw new Error(responseText);
    }
    return JSON.parse(responseText);
  },

  /**
   * Fetches user data with detailed profile information
   * @returns User data with profile information
   * @throws Error if the request fails
   */
  fetchUserData: async (): Promise<any> => {
    const token = useStore.getState().token;
    if (!token) throw new Error("Authentication required");
    
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const userData = await response.json();
    return userData;
  }
};
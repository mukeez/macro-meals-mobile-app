import useStore from "../store/useStore";
import { authTokenService } from "./authTokenService";
import axiosInstance from "./axios";

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
    try {
      const response = await axiosInstance.get('/user/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Fetches user preferences from the backend
   * @returns User preferences or default preferences if not found
   */
  getPreferences: async (): Promise<any> => {
    const token = useStore.getState().token;
    console.log('TOKEN', token)
    
    //! Once there is no token, we will need to log the user out
    //! This implementation will be replaced with axios which will
    //! intercept the request and check if the token is valid
    //! If the token is not valid, we will log the user out
    //! If the token is valid, we will continue with the request
    if (!token) {
      console.log('NO TOKEN FOUND')
      return defaultPreferences;
    }

    try {
      const response = await axiosInstance.get('/user/preferences');
      const preferences = response.data;
      console.log('\n\nPREFERENCES\n\n', preferences)
      return preferences;
    } catch (err: any) {
      console.error('Error fetching preferences:', err);
      if (err.response?.status === 404) {
        console.log('404 NO PREFERENCES FOUND')
        return defaultPreferences;
      }
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
    try {
      const response = await axiosInstance.patch('/user/preferences', prefs);
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  },

  updateProfile: async (fields: Record<string, any>): Promise<any> => {
    console.log('updateProfile called with fields:', fields);

    // Always use FormData to match Postman behavior
    console.log('Using FormData (matching Postman)');
    const formData = new FormData();
    
    // Map frontend field names to backend field names
    const fieldMappings: Record<string, string> = {
      'gender': 'sex',
      'birthday': 'dob'
    };
    
    Object.keys(fields).forEach(key => {
      const value = fields[key];
      // Use mapped field name if it exists, otherwise use original key
      const backendFieldName = fieldMappings[key] || key;
      
      console.log(`Processing field ${key} -> ${backendFieldName}:`, value);
      
      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && value.uri) {
          // File object
          console.log(`Appending file for ${backendFieldName}:`, { uri: value.uri, type: value.type, name: value.name });
          formData.append(backendFieldName, {
            uri: value.uri,
            type: value.type || 'image/jpeg',
            name: value.name || 'file'
          } as any);
        } else {
          // Regular field - convert to string for FormData
          let fieldValue = String(value);
          
          // Ensure gender values are lowercase
          if (key === 'gender' && typeof value === 'string') {
            fieldValue = value.toLowerCase();
            console.log(`Converting gender to lowercase: ${value} -> ${fieldValue}`);
          }
          
          console.log(`Appending regular field ${backendFieldName}:`, fieldValue);
          formData.append(backendFieldName, fieldValue);
        }
      }
    });

    console.log('=== FULL REQUEST DEBUG ===');
    console.log('Method: PATCH');
    console.log('Using FormData body (multipart/form-data)');
    console.log('FormData fields being sent:', Object.keys(fields));
    console.log('Original field values:', fields);
    console.log('=== SENDING REQUEST ===');

    try {
      const response = await axiosInstance.patch('/user/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      console.log('=== RESPONSE RECEIVED ===');
      console.log('- Parsed Response last_name:', response.data.last_name);
      console.log('- Response updated_at:', response.data.updated_at);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  updateUserProfile: async (data: any): Promise<any> => {
    try {
      const response = await axiosInstance.patch('/user/me', data);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Fetches user data with detailed profile information
   * @returns User data with profile information
   * @throws Error if the request fails
   */
  fetchUserData: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get('/user/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },

  /**
   * Updates the FCM token on the backend
   * @param fcmToken - The FCM token to update
   * @returns Response from the backend
   * @throws Error if the request fails
   */
  updateFCMToken: async (fcmToken: string): Promise<any> => {
    console.log('Sending FCM token to backend:', fcmToken);
    try {
      const response = await axiosInstance.patch('/user/me', {
        fcm_token: fcmToken
      });
      console.log('FCM token updated on backend successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating FCM token on backend:', error);
      throw error;
    }
  },
uploadProfileImage: async (imageUri: string, authToken: string) => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'avatar.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;

  formData.append('profile_image', {
    uri: imageUri,
    name: filename,
    type: type,
  } as any);

  const response = await fetch(`${API_BASE_URL}/user/me`,
    {
    
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    body: formData,
  });
  console.log('Status:', response.status);

  const responseText = await response.text();
  if (!response.ok) {
    console.error('Upload failed:', response.status, responseText);
    throw new Error(responseText || 'Upload failed');
  }
  const responseData = JSON.parse(responseText);
  console.log('Parsed JSON response:', responseData);
  return responseData;
},
}

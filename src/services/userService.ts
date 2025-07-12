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
      const response = await fetch(`${API_BASE_URL}/user/preferences`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        console.log('404 NO PREFERENCES FOUND')
        return defaultPreferences;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch preferences: ${response.status}`);
      }
      
      const preferences = await response.json();
      console.log('\n\nPREFERENCES\n\n', preferences)
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
    console.log('updateProfile called with fields:', fields);
    if (!token) throw new Error("Authentication required");

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

    let headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
      // IMPORTANT: Don't set Content-Type manually for FormData - React Native needs to set the boundary
    };

    const fullUrl = `${API_BASE_URL}/user/me`;
    console.log('=== FULL REQUEST DEBUG ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Full URL:', fullUrl);
    console.log('Method: PATCH');
    console.log('Headers:', headers);
    console.log('Using FormData body (multipart/form-data)');
    console.log('FormData fields being sent:', Object.keys(fields));
    console.log('Original field values:', fields);
    console.log('=== SENDING REQUEST ===');

    const response = await fetch(fullUrl, {
      method: "PATCH",
      headers,
      body: formData
    });

    console.log('=== RESPONSE RECEIVED ===');
    
    console.log('Response received:');
    console.log('- Status:', response.status);
    console.log('- Status Text:', response.statusText);
    console.log('- Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('- Response Body:', responseText);
    
    if (!response.ok) {
      console.error('[PATCH ERROR] /user/me', response.status, responseText);
      throw new Error(responseText);
    }
    
    try {
      const parsedResponse = JSON.parse(responseText);
      console.log('- Parsed Response last_name:', parsedResponse.last_name);
      console.log('- Response updated_at:', parsedResponse.updated_at);
      return parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error('Invalid JSON response');
    }
  },
updateUserProfile: async (data: any): Promise<any> => {
  const token = useStore.getState().token;
  if (!token) throw new Error("Authentication required");
  const response = await fetch(`${API_BASE_URL}/user/me`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
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

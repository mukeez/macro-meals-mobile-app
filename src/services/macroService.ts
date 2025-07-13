import axiosInstance from "./axios";

export type MacroResponse = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export interface MacroSetupRequest {
  activity_level: string;
  age: number;
  dietary_preference: string;
  dob: string;
  goal_type: string;
  height: number;
  progress_rate: string | number;
  sex: string;
  target_weight: number;
  height_unit_preference: string;
  weight_unit_preference: string;
  weight: number;
}

export async function fetchMacros(): Promise<MacroResponse> {
  try {
    const response = await axiosInstance.get('/macros/adjust-macros');
    return response.data;
  } catch (error) {
    console.error('Error fetching macros:', error);
    throw error;
  }
}

export async function updateMacros(updated: MacroResponse): Promise<void> {
  try {
    await axiosInstance.post('/macros/adjust-macros', updated);
  } catch (error) {
    console.error('Error updating macros:', error);
    throw error;
  }
}

export async function setupMacros(requestData: MacroSetupRequest): Promise<MacroResponse> {
  try {
    const response = await axiosInstance.post('/macros/macros-setup', requestData);
    return response.data;
  } catch (error) {
    console.error('Error setting up macros:', error);
    throw error;
  }
}
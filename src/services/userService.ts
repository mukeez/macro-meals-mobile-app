import useStore from "../store/useStore";

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.macromealsapp.com/api/v1';

export const userService = {
  getPreferences: async (): Promise<any> => {
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

  updatePreferences: async (prefs: Record<string, boolean>): Promise<any> => {
    const token = useStore.getState().token;
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(prefs)
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  }
};
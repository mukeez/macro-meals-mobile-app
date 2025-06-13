import useStore from "../store/useStore";

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.macromealsapp.com/api/v1';

export const notificationService = {
  async getNotifications() {
    const token = useStore.getState().token;
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  },

  async markAsRead(id: string) {
    const token = useStore.getState().token;
    if (!token) throw new Error("Authentication required");
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  }
};
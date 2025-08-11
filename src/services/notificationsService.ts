
import axiosInstance from "./axios";

export const notificationService = {
   async getNotifications(page: number = 0, pageSize: number = 20) {
    try {
      // Append pagination params to the URL
      const response = await axiosInstance.get(
        `/notifications/?page=${page}&page_size=${pageSize}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

async markAsRead(id: string) {
  try {
    const response = await axiosInstance.patch(
      `/notifications/${id}/read`,
      { status: "read" }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}
};
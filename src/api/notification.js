import api from './axiosConfig';

// Get all notifications
export const fetchNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

// Mark a specific notification as read
export const markNotificationAsRead = async (id) => {
  const response = await api.post(`/notifications/${id}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await api.post('/notifications/mark-all-read');
  return response.data;
};

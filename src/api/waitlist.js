import api from './axiosConfig';

// Join waitlist for a seat
export const joinWaitlist = async (waitlistData) => {
  const response = await api.post('/waitlist', waitlistData);
  return response.data;
};

// Get user's waitlist items
export const getUserWaitlistItems = async () => {
  const response = await api.get('/waitlist');
  return response.data;
};

// Cancel waitlist request
export const cancelWaitlistRequest = async (id) => {
  const response = await api.delete(`/waitlist/${id}`);
  return response.data;
};

// Get notification status
export const getNotificationStatus = async (id) => {
  const response = await api.get(`/waitlist/${id}/notification`);
  return response.data;
};

// Get queue position for a specific waitlist item
export const getQueuePosition = async (id) => {
  const response = await api.get(`/waitlist/${id}/position`);
  return response.data;
};
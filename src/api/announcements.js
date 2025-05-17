import api from './axiosConfig';

// Helper function to handle API calls with 401 handling
const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    // Let the interceptor in axiosConfig handle 401 errors
    // Just re-throw the error for the caller to handle
    throw error;
  }
};

// Get all announcements (admin only)
export const getAllAnnouncements = async () => {
  return safeApiCall(() => api.get('/admin/announcements'));
};

// Get active announcements (public)
export const getActiveAnnouncements = async () => {
  return safeApiCall(() => api.get('/announcements/active'));
};

// Get announcement by ID
export const getAnnouncementById = async (id) => {
  return safeApiCall(() => api.get(`/admin/announcements/${id}`));
};

// Create a new announcement
export const createAnnouncement = async (announcementData) => {
  return safeApiCall(() => api.post('/admin/announcements', announcementData));
};

// Update an announcement
export const updateAnnouncement = async (id, announcementData) => {
  return safeApiCall(() => api.put(`/admin/announcements/${id}`, announcementData));
};

// Delete an announcement
export const deleteAnnouncement = async (id) => {
  return safeApiCall(() => api.delete(`/admin/announcements/${id}`));
};
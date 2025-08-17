import api from './axiosConfig';

export const librarianService = {
  // Get all librarians (Admin only)
  getAllLibrarians: async () => {
    const response = await api.get('/admin/librarians');
    return response.data;
  },

  // Get librarians by location (Admin/Librarian)
  getLibrariansByLocation: async (location) => {
    const response = await api.get(`/admin/librarians/location/${location}`);
    return response.data;
  },

  // Get active librarians for today (Public - for users/students)
  getActiveLibrariansToday: async (location) => {
    const response = await api.get(`/public/librarians/active/${location}`);
    return response.data;
  },

  // Get librarians for specific day
  getLibrariansForDay: async (dayOfWeek, location) => {
    const response = await api.get(`/admin/librarians/day/${dayOfWeek}/location/${location}`);
    return response.data;
  },

  // Create new librarian (Admin only)
  createLibrarian: async (librarianData) => {
    const response = await api.post('/admin/librarians', librarianData);
    return response.data;
  },

  // Update librarian schedule (Admin/Librarian)
  updateLibrarianSchedule: async (scheduleData) => {
    const response = await api.put('/admin/librarians/schedule', scheduleData);
    return response.data;
  },

  // Toggle librarian active status (Librarian self-service)
  toggleLibrarianActiveStatus: async (librarianId) => {
    const response = await api.put(`/librarian/toggle-active/${librarianId}`);
    return response.data;
  },

  // Get weekly schedule
  getWeeklySchedule: async (location) => {
    const response = await api.get(`/admin/librarians/schedule/weekly/${location}`);
    return response.data;
  },

  // Librarian self-service endpoints
  getMyProfile: async () => {
    const response = await api.get('/librarian/profile');
    return response.data;
  },

  getMyColleagues: async () => {
    const response = await api.get('/librarian/colleagues');
    return response.data;
  },

  updateMySchedule: async (scheduleData) => {
    const response = await api.put('/librarian/schedule', scheduleData);
    return response.data;
  },

  getMyWeeklySchedule: async () => {
    const response = await api.get('/librarian/schedule/weekly');
    return response.data;
  }
};
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

// Get regular schedule
export const getLibrarySchedule = async () => {
  return safeApiCall(() => api.get('/admin/schedule'));
};

// Update regular day schedule
export const updateDaySchedule = async (id, scheduleData) => {
  return safeApiCall(() => api.put(`/admin/schedule/${id}`, scheduleData));
};

// Get all closure exceptions
export const getClosureExceptions = async () => {
  return safeApiCall(() => api.get('/admin/schedule/exceptions'));
};

// Get closure exceptions for a date range
export const getClosureExceptionsInRange = async (startDate, endDate) => {
  return safeApiCall(() => api.get('/admin/schedule/exceptions/range', {
    params: { startDate, endDate }
  }));
};

// Create a new closure exception
export const createClosureException = async (closureData) => {
  return safeApiCall(() => api.post('/admin/schedule/exceptions', closureData));
};

// Update a closure exception
export const updateClosureException = async (id, closureData) => {
  return safeApiCall(() => api.put(`/admin/schedule/exceptions/${id}`, closureData));
};

// Delete a closure exception
export const deleteClosureException = async (id) => {
  return safeApiCall(() => api.delete(`/admin/schedule/exceptions/${id}`));
};

// Create recurring closures
export const createRecurringClosures = async (recurringData) => {
  return safeApiCall(() => api.post('/admin/schedule/exceptions/recurring', recurringData));
};

// Set early closing message
export const setScheduleMessage = async (message) => {
  return safeApiCall(() => api.put('/admin/schedule/message', { message }));
};

// Get current schedule message
export const getScheduleMessage = async () => {
  return safeApiCall(() => api.get('/admin/schedule/message'));
};

// Check current library status
export const getCurrentLibraryStatus = async () => {
  return safeApiCall(() => api.get('/admin/schedule/status'));
};

// Preview closure message
export const previewClosureMessage = async (closureData) => {
  return safeApiCall(() => api.post('/admin/schedule/preview-message', closureData));
};

// Export schedule data
export const exportScheduleData = async (startDate, endDate, format = 'csv') => {
  return safeApiCall(() => api.get('/admin/export/schedule', {
    params: { startDate, endDate, format },
    responseType: 'blob'
  }));
};
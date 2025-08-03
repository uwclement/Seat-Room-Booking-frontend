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

// Get all library schedules
export const getAllSchedules = async () => {
  return safeApiCall(() => api.get('/admin/schedule'));
};

// Get all Public library schedules
export const getAllPublicSchedules = async () => {
  return safeApiCall(() => api.get('library/schedule'));
};

// Get schedules for specific location (admin only)
export const getSchedulesByLocation = async (location) => {
  return safeApiCall(() => api.get(`/admin/schedule/location/${location}`));
};

// Get schedules for specific location (admin only)
export const getPublicSchedulesByLocation = async (location) => {
  return safeApiCall(() => api.get(`/library/schedule/location/${location}`));
};

export const getLibraryStatusByLocation = async (location) => {
  return safeApiCall(() => api.get(`/library/status/${location}`));
};

// Update a schedule
export const updateSchedule = async (id, scheduleData) => {
  return safeApiCall(() => api.put(`/admin/schedule/${id}`, scheduleData));
};

// Mark a day as closed
export const setDayClosed = async (id, message) => {
  return safeApiCall(() => api.put(`/admin/schedule/${id}/close`, { message }));
};

// Set special closing time
export const setSpecialClosingTime = async (id, specialCloseTime, message) => {
  return safeApiCall(() => api.put(`/admin/schedule/${id}/special-close`, { 
    specialCloseTime, 
    message 
  }));
};

// Remove special closing time
export const removeSpecialClosingTime = async (id) => {
  return safeApiCall(() => api.delete(`/admin/schedule/${id}/special-close`));
};


//Admin and users get Status
export const getLibraryStatus = async () => {
  return safeApiCall(() => api.get('/library/status'));
 };

// Get all closure exceptions
export const getAllClosureExceptions = async () => {
  return safeApiCall(() => api.get('/admin/schedule/exceptions'));
};

// Get all public closure exceptions
export const getAllPublicClosureExceptions = async () => {
  return safeApiCall(() => api.get('/library/schedule/exceptions'));
};

// Get closure exceptions in a date range
export const getClosureExceptionsInRange = async (start, end) => {
  return safeApiCall(() => api.get('/admin/schedule/exceptions/range', {
    params: { start, end }
  }));
};

// Create a new closure exception
export const createClosureException = async (exceptionData) => {
  return safeApiCall(() => api.post('/admin/schedule/exceptions', exceptionData));
};

// Update a closure exception
export const updateClosureException = async (id, exceptionData) => {
  return safeApiCall(() => api.put(`/admin/schedule/exceptions/${id}`, exceptionData));
};

// Delete a closure exception
export const deleteClosureException = async (id) => {
  return safeApiCall(() => api.delete(`/admin/schedule/exceptions/${id}`));
};

// Create recurring closures
export const createRecurringClosures = async (recurringClosureData) => {
  return safeApiCall(() => api.post('/admin/schedule/exceptions/recurring', recurringClosureData));
};

// Set schedule message
export const setScheduleMessage = async (message) => {
  return safeApiCall(() => api.put('/admin/schedule/message', { message }));
};

// Get schedule message
export const getScheduleMessage = async () => {
  return safeApiCall(() => api.get('/admin/schedule/message'));
};

// Get public schedule message
export const getPublicScheduleMessage = async () => {
  return safeApiCall(() => api.get('/library/schedule/message'));
};
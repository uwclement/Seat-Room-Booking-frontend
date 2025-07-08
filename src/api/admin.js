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

// Seat Management API calls
export const getAllAdminSeats = async () => {
  return safeApiCall(() => api.get('/admin/seats'));
};

export const updateSeat = async (id, seatData) => {
  return safeApiCall(() => api.put(`/admin/seats/${id}`, seatData));
};

export const bulkUpdateSeats = async (seatUpdates) => {
  return safeApiCall(() => api.put('/admin/seats/bulk', seatUpdates));
};

export const toggleDesktop = async (seatId) => {
  return safeApiCall(() => api.put(`/admin/seats/${seatId}/toggle-desktop`));
};

export const disableSeatsForMaintenance = async (seatIds) => {
  return safeApiCall(() =>
    api.put('/admin/seats/disable', seatIds)
  );
};

export const enableSeats = async (seatIds) => {
  return safeApiCall(() => 
    api.put('/admin/seats/enable',  seatIds ));
};

export const getDisabledSeats = async () => {
  return safeApiCall(() => api.get('/admin/seats/disabled'));
};

// User Management API calls
export const getAllAdminUsers = async () => {
  return safeApiCall(() => api.get('/admin/users'));
};

export const getUserById = async (id) => {
  return safeApiCall(() => api.get(`/admin/users/${id}`));
};

export const updateUserStatus = async (id, status) => {
  return safeApiCall(() => api.put(`/admin/users/${id}/status`, { status }));
};

export const getUsersWithActiveBookings = async () => {
  return safeApiCall(() => api.get('/admin/users/with-active-bookings'));
};

// Booking Management API calls
export const getCurrentBookings = async () => {
  return safeApiCall(() => api.get('/admin/bookings/current'));
};

export const getBookingsByDate = async (date) => {
  return safeApiCall(() => api.get(`/admin/bookings/date/${date}`));
};

export const getBookingsInRange = async (startDate, endDate) => {
  return safeApiCall(() => api.get('/admin/bookings/range', {
    params: { startDate, endDate }
  }));
};

export const cancelBooking = async (bookingId) => {
  return safeApiCall(() => api.delete(`/admin/bookings/${bookingId}`));
};

export const getBookingsByUser = async (userId) => {
  return safeApiCall(() => api.get(`/admin/bookings/user/${userId}`));
};

export const getBookingsBySeat = async (seatId) => {
  return safeApiCall(() => api.get(`/admin/bookings/seat/${seatId}`));
};

export const bulkToggleDesktop = async (seatIds) => {
  return safeApiCall(() => api.put('/admin/seats/bulk-toggle-desktop', seatIds));
};



// Get all current bookings
export const getCurrentAdminBookings = async () => {
  return safeApiCall(() => api.get('/admin/bookings/current'));
};




// Manual check-in by admin
export const manualCheckInBooking = async (bookingId) => {
  return safeApiCall(() => api.post(`/admin/bookings/${bookingId}/checkin`));
};

// Manual cancellation by admin
export const manualCancelBooking = async (bookingId, reason = '') => {
  return safeApiCall(() => api.delete(`/admin/bookings/${bookingId}/cancel`, {
    data: { reason }
  }));
};

// Bulk cancellation by admin
export const bulkCancelBookings = async (bookingIds, reason = '') => {
  return safeApiCall(() => api.post('/admin/bookings/bulk-cancel', {
    bookingIds,
    reason
  }));
};

// Get bookings eligible for check-in
export const getBookingsEligibleForCheckIn = async () => {
  return safeApiCall(() => api.get('/admin/bookings/eligible-checkin'));
};

// Get bookings eligible for cancellation
export const getBookingsEligibleForCancellation = async () => {
  return safeApiCall(() => api.get('/admin/bookings/eligible-cancellation'));
};
import api from './axiosConfig';

// Create a new booking
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

// Get current user's active bookings
export const getUserActiveBookings = async () => {
  const response = await api.get('/bookings');
  return response.data;
};

// Get user's past bookings
export const getUserPastBookings = async () => {
  const response = await api.get('/bookings/past');
  return response.data;
};

// Get a specific booking
export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

// Check in to a booking
export const checkInBooking = async (id) => {
  const response = await api.post(`/bookings/${id}/checkin`);
  return response.data;
};

// Check out from a booking
export const checkOutBooking = async (id) => {
  const response = await api.post(`/bookings/${id}/checkout`);
  return response.data;
};

// Cancel a booking
export const cancelBooking = async (id) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};

// Request booking extension
export const extendBooking = async (extensionData) => {
  try {
    const response = await fetch('/api/bookings/extend', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(extensionData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to extend booking');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Respond to extension request
export const respondToExtension = async (id, accepted) => {
  const response = await api.post(`/bookings/extension`, {
    bookingId: id,
    accepted: accepted
  });
  return response.data;
};
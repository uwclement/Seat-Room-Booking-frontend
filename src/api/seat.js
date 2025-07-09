import api from './axiosConfig';

// Get all seats
export const getAllSeats = async () => {
  const response = await api.get('/seats');
  return response.data;
};

// get all seats in Gishushu
export const getAllSeatsInGishushu = async () => {
  const response = await api.get('/seats/Gishushu');
  return response.data;
};

// get seats in Masoro
export const getAllSeatsInMasoro = async () => {
  const response = await api.get('/seats/Masoro');
  return response.data;
};

// Get a specific seat by ID
export const getSeatById = async (id) => {
  const response = await api.get(`/seats/${id}`);
  return response.data;
};

// Find available seats with filters
export const findAvailableSeats = async (filters) => {
  const response = await api.post('/seats/available', filters);
  return response.data;
};

// Toggle a seat as favorite
export const toggleFavoriteSeat = async (seatId) => {
  const response = await api.post(`/seats/${seatId}/favorite`);
  return response.data;
};

// Get user's favorite seats
export const getFavoriteSeats = async () => {
  const response = await api.get('/seats/favorites');
  return response.data;
};


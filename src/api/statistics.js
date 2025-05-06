import api from './axiosConfig';

// Get peak usage times
export const getPeakTimes = async () => {
  const response = await api.get('/statistics/peak-times');
  return response.data;
};

// Get current day's statistics
export const getTodayStatistics = async () => {
  const response = await api.get('/statistics/today');
  return response.data;
};

// Get seat usage history
export const getSeatUsageHistory = async (seatId) => {
  const response = await api.get(`/statistics/seat/${seatId}/history`);
  return response.data;
};

// Get zone occupancy rates
export const getZoneOccupancyRates = async () => {
  const response = await api.get('/statistics/zones/occupancy');
  return response.data;
};

// Get user's booking history statistics
export const getUserBookingStats = async () => {
  const response = await api.get('/statistics/user/bookings');
  return response.data;
};
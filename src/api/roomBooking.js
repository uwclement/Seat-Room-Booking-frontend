import api from './axiosConfig';

// ========== ROOM DISCOVERY ==========

export const getAllRooms = async () => {
  const response = await api.get('/Roombookings/rooms');
  return response.data;
};

export const getRoomById = async (roomId) => {
  const response = await api.get(`/Roombookings/rooms/${roomId}`);
  return response.data;
};

export const getRoomsByCategory = async (category) => {
  const response = await api.get(`/Roombookings/rooms/category/${category}`);
  return response.data;
};

export const searchRooms = async (filters) => {
  const params = new URLSearchParams();
  
  if (filters.keyword) params.append('keyword', filters.keyword);
  if (filters.category) params.append('category', filters.category);
  if (filters.minCapacity) params.append('minCapacity', filters.minCapacity);
  if (filters.maxCapacity) params.append('maxCapacity', filters.maxCapacity);
  if (filters.building) params.append('building', filters.building);
  if (filters.floor) params.append('floor', filters.floor);
  if (filters.equipmentIds) params.append('equipmentIds', filters.equipmentIds.join(','));
  if (filters.startTime) params.append('startTime', filters.startTime);
  if (filters.endTime) params.append('endTime', filters.endTime);
  
  const response = await api.get(`/Roombookings/rooms/search?${params}`);
  return response.data;
};

// Map inviteUsersToBooking to your existing inviteParticipants function
export const inviteUsersToBooking = async (bookingId, inviteData) => {
  return await inviteParticipants(bookingId, inviteData);
};

// Map removeUserFromBooking to your existing removeParticipant function  
export const removeUserFromBooking = async (bookingId, participantId) => {
  return await removeParticipant(bookingId, participantId);
};

// Map requestToJoinBooking to your existing joinRoomBooking function
export const requestToJoinBooking = async (bookingId) => {
  return await joinRoomBooking(bookingId);
};
export const getRoomCategories = async () => {
  const response = await api.get('/Roombookings/rooms/categories');
  return response.data;
};

export const getBuildings = async () => {
  const response = await api.get('/Roombookings/rooms/buildings');
  return response.data;
};

// ========== ROOM AVAILABILITY ==========

export const getRoomAvailability = async (roomId) => {
  const response = await api.get(`/Roombookings/rooms/${roomId}/availability`);
  return response.data;
};

export const getWeeklyAvailability = async (roomId, weekStart) => {
  const params = weekStart ? `?weekStart=${weekStart}` : '';
  const response = await api.get(`/Roombookings/rooms/${roomId}/weekly-availability${params}`);
  return response.data;
};

export const getRoomsAvailableNow = async (durationHours = 1) => {
  const response = await api.get(`/Roombookings/rooms/available-now?durationHours=${durationHours}`);
  return response.data;
};

// ========== ROOM BOOKING OPERATIONS ==========

export const createRoomBooking = async (bookingData) => {
  const response = await api.post('/Roombookings', bookingData);
  return response.data;
};

export const updateRoomBooking = async (bookingId, updates) => {
  const response = await api.put(`/Roombookings/${bookingId}`, updates);
  return response.data;
};

export const cancelRoomBooking = async (bookingId) => {
  const response = await api.delete(`/Roombookings/${bookingId}`);
  return response.data;
};

export const getRoomBookingById = async (bookingId) => {
  const response = await api.get(`/Roombookings/${bookingId}`);
  return response.data;
};

// ========== USER BOOKING MANAGEMENT ==========

export const getMyRoomBookings = async () => {
  const response = await api.get('/Roombookings/my-bookings');
  return response.data;
};

export const getMyBookingHistory = async (page = 0, size = 20) => {
  const response = await api.get(`/Roombookings/my-history?page=${page}&size=${size}`);
  return response.data;
};

export const getUserBookingStats = async (weeks = 4) => {
  const response = await api.get(`/Roombookings/my-stats?weeks=${weeks}`);
  return response.data;
};

// ========== CHECK-IN OPERATIONS ==========

export const checkInToRoomBooking = async (bookingId) => {
  const response = await api.post(`/Roombookings/${bookingId}/check-in`);
  return response.data;
};

// ========== PUBLIC/JOINABLE BOOKINGS ==========

export const getJoinableBookings = async () => {
  const response = await api.get('/Roombookings/joinable');
  return response.data;
};

export const joinRoomBooking = async (bookingId) => {
  const response = await api.post('/Roombookings/join', { bookingId });
  return response.data;
};

// ========== PARTICIPANT MANAGEMENT ==========

export const inviteParticipants = async (bookingId, inviteData) => {
  const response = await api.post(`/Roombookings/${bookingId}/participants/invite`, inviteData);
  return response.data;
};

export const respondToInvitation = async (bookingId, participantId, accepted) => {
  const response = await api.post(`/Roombookings/${bookingId}/participants/${participantId}/respond`, {
    accepted
  });
  return response.data;
};

export const removeParticipant = async (bookingId, participantId) => {
  const response = await api.delete(`/Roombookings/${bookingId}/participants/${participantId}`);
  return response.data;
};

// ========== RECURRING BOOKINGS ==========

export const getRecurringSeries = async (bookingId) => {
  const response = await api.get(`/Roombookings/${bookingId}/recurring-series`);
  return response.data;
};

export const cancelRecurringSeries = async (bookingId) => {
  const response = await api.delete(`/Roombookings/${bookingId}/recurring-series`);
  return response.data;
};

// ========== QUICK ACTIONS ==========

export const quickBookRoom = async (roomId, durationHours = 1) => {
  const response = await api.get(`/Roombookings/quick-book/${roomId}?durationHours=${durationHours}`);
  return response.data;
};

export const extendBooking = async (bookingId, additionalHours) => {
  const response = await api.post(`/Roombookings/${bookingId}/extend`, {
    additionalHours
  });
  return response.data;
};

// ========== SEARCH BOOKINGS ==========

export const searchRoomBookings = async (filters) => {
  const params = new URLSearchParams();
  
  if (filters.keyword) params.append('keyword', filters.keyword);
  if (filters.roomId) params.append('roomId', filters.roomId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status) params.append('status', filters.status);
  if (filters.publicOnly) params.append('publicOnly', filters.publicOnly);
  
  const response = await api.get(`/Roombookings/search?${params}`);
  return response.data;


  
};
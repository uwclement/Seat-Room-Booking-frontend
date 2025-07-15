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

// ========== ROOM AVAILABILITY ==========

export const getWeeklyAvailability = async (roomId, weekStart) => {
  const params = weekStart ? `?weekStart=${weekStart}` : '';
  const response = await api.get(`/Roombookings/rooms/${roomId}/weekly-availability${params}`);
  return response.data;
};

// ========== ROOM BOOKING OPERATIONS ==========

// Enhanced createRoomBooking function
export const createRoomBooking = async (bookingData) => {
  // Ensure the payload includes the new identifier field
  const payload = {
    roomId: bookingData.roomId,
    title: bookingData.title,
    description: bookingData.description,
    startTime: bookingData.startTime,
    endTime: bookingData.endTime,
    maxParticipants: bookingData.maxParticipants,
    isPublic: bookingData.isPublic,
    allowJoining: bookingData.allowJoining,
    requiresCheckIn: bookingData.requiresCheckIn,
    reminderEnabled: bookingData.reminderEnabled,
    requestedEquipmentIds: bookingData.requestedEquipmentIds,
    
    // Include both invitation methods
    invitedUserEmails: bookingData.invitedUserEmails,
    invitedUserIdentifiers: bookingData.invitedUserIdentifiers, 
    
    isRecurring: bookingData.isRecurring,
    recurringDetails: bookingData.recurringDetails
  };

  const response = await api.post('/Roombookings', payload);
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

// Enhanced inviteParticipants function
export const inviteParticipants = async (bookingId, inviteData) => {
  const payload = {
    invitedEmails: inviteData.invitedEmails,
    invitedUserIds: inviteData.invitedUserIds,
    invitedUserIdentifiers: inviteData.invitedUserIdentifiers 
  };

  const response = await api.post(`/Roombookings/${bookingId}/participants/invite`, payload);
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

export const getMyPendingInvitations = async () => {
  const response = await api.get('/Roombookings/my-invitations');
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
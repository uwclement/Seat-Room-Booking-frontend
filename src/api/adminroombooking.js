import api from './axiosConfig';

// ========== ADMIN BOOKING DATA ENDPOINTS ==========

export const getAllBookingsAdmin = async () => {
  const response = await api.get('/admin/Roombookings');
  return response.data;
};

export const getBookingsByDateRangeAdmin = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await api.get(`/admin/Roombookings/date-range?${params}`);
  return response.data;
};

export const getPendingBookingsAdmin = async () => {
  const response = await api.get('/admin/Roombookings/pending');
  return response.data;
};

export const getBookingDetailsAdmin = async (bookingId) => {
  const response = await api.get(`/admin/Roombookings/${bookingId}`);
  return response.data;
};

export const getBookingsWithCapacityWarnings = async () => {
  const response = await api.get('/admin/Roombookings/capacity-warnings');
  return response.data;
};

// ========== BOOKING APPROVAL ENDPOINTS ==========

export const approveRejectBooking = async (bookingId, approved, rejectionReason = null) => {
  const response = await api.post('/admin/Roombookings/approve', {
    bookingId,
    approved,
    rejectionReason
  });
  return response.data;
};

export const bulkApproveRejectBookings = async (bookingIds, approved, rejectionReason = null) => {
  const response = await api.post('/admin/Roombookings/bulk-approve', {
    bookingIds,
    approved,
    rejectionReason
  });
  return response.data;
};

// ========== EQUIPMENT APPROVAL ENDPOINTS ==========

export const approveRejectEquipment = async (bookingId, equipmentId, approved, reason = null) => {
  const response = await api.post('/admin/Roombookings/equipment/approve', {
    bookingId,
    equipmentId,
    approved,
    reason
  });
  return response.data;
};

export const bulkApproveRejectEquipment = async (bookingIds, equipmentIds, approved, reason = null) => {
  const response = await api.post('/admin/Roombookings/equipment/bulk-approve', {
    bookingIds,
    equipmentIds,
    approved,
    reason
  });
  return response.data;
};

export const getBookingEquipmentRequests = async (bookingId) => {
  const response = await api.get(`/admin/Roombookings/${bookingId}/equipment`);
  return response.data;
};

// ========== PARTICIPANT ANALYSIS ENDPOINTS ==========

export const getBookingParticipantSummary = async (bookingId) => {
  const response = await api.get(`/admin/Roombookings/${bookingId}/participants`);
  return response.data;
};

// ========== ADMIN CANCELLATION ENDPOINTS ==========

export const cancelBookingAsAdmin = async (bookingId, cancellationReason, notifyParticipants = true) => {
  const response = await api.post('/admin/Roombookings/cancel', {
    bookingId,
    cancellationReason,
    notifyParticipants
  });
  return response.data;
};

export const bulkCancelBookingsAsAdmin = async (bookingIds, cancellationReason, notifyParticipants = true) => {
  const response = await api.post('/admin/Roombookings/bulk-cancel', {
    bookingIds,
    cancellationReason,
    notifyParticipants
  });
  return response.data;
};

// ========== ANALYTICS ENDPOINTS ==========

export const getEquipmentUsageAnalytics = async (startDate = null, endDate = null) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await api.get(`/admin/Roombookings/analytics/equipment-usage?${params}`);
  return response.data;
};

export const getCapacityUtilizationAnalytics = async (startDate = null, endDate = null) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await api.get(`/admin/Roombookings/analytics/capacity-utilization?${params}`);
  return response.data;
};

export const getApprovalStatistics = async (startDate = null, endDate = null) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await api.get(`/admin/Roombookings/analytics/approval-stats?${params}`);
  return response.data;
};

// ========== QUICK ACTIONS ENDPOINTS ==========

export const approveAllPendingBookings = async (reason = null) => {
  const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
  const response = await api.post(`/admin/Roombookings/quick-actions/approve-all-pending${params}`);
  return response.data;
};

export const approveBookingsWithinCapacity = async () => {
  const response = await api.post('/admin/Roombookings/quick-actions/approve-within-capacity');
  return response.data;
};

// ========== NOTIFICATION ENDPOINTS ==========

export const sendCustomReminder = async (bookingId, message, includeParticipants = true) => {
  const params = new URLSearchParams();
  params.append('bookingId', bookingId);
  params.append('message', message);
  params.append('includeParticipants', includeParticipants);
  
  const response = await api.post(`/admin/Roombookings/notifications/send-reminder?${params}`);
  return response.data;
};

export const broadcastToActiveBookingUsers = async (title, message) => {
  const params = new URLSearchParams();
  params.append('title', title);
  params.append('message', message);
  
  const response = await api.post(`/admin/Roombookings/notifications/broadcast?${params}`);
  return response.data;
};

// ========== UTILITY FUNCTIONS ==========

export const formatBookingStatus = (status) => {
  const statusMap = {
    'PENDING': { label: 'Pending', class: 'pending' },
    'CONFIRMED': { label: 'Confirmed', class: 'confirmed' },
    'CHECKED_IN': { label: 'Checked In', class: 'checked-in' },
    'COMPLETED': { label: 'Completed', class: 'completed' },
    'CANCELLED': { label: 'Cancelled', class: 'cancelled' },
    'NO_SHOW': { label: 'No Show', class: 'no-show' },
    'REJECTED': { label: 'Rejected', class: 'rejected' }
  };
  
  return statusMap[status] || { label: status, class: 'unknown' };
};

export const formatDuration = (durationHours) => {
  if (durationHours < 1) {
    return `${Math.round(durationHours * 60)} minutes`;
  } else if (durationHours === 1) {
    return '1 hour';
  } else {
    return `${durationHours} hours`;
  }
};

export const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    full: date.toLocaleString()
  };
};

export const calculateCapacityPercentage = (confirmedParticipants, roomCapacity) => {
  return Math.round((confirmedParticipants / roomCapacity) * 100);
};

export const getCapacityWarningLevel = (confirmedParticipants, roomCapacity) => {
  const percentage = calculateCapacityPercentage(confirmedParticipants, roomCapacity);
  
  if (percentage < 50) return 'critical';
  if (percentage < 75) return 'warning';
  if (percentage >= 100) return 'over';
  return 'good';
};
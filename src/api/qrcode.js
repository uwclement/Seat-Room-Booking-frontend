import api from './axiosConfig';

// Helper function for safe API calls
const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== QR SCANNING ==========

// Public endpoint - scan QR code
export const scanQRCode = async (type, token) => {
  return safeApiCall(() => api.get('/scan', { 
    params: { type, token } 
  }));
};

// NEW: Process stored QR scan after login
export const processStoredQRScan = async (qrContext) => {
  return safeApiCall(() => api.post('/scan/process-stored', qrContext));
};

// Process check-in after scan
export const processQRCheckIn = async (type, bookingId, participantId = null) => {
  return safeApiCall(() => api.post('/scan/checkin', null, {
    params: { type, bookingId, participantId }
  }));
};

// Validate QR code for mobile check-in
export const validateQRCode = async (qrContent, expectedBookingId = null) => {
  return safeApiCall(() => api.post('/scan/validate', {
    qrContent,
    expectedBookingId
  }));
};

// Get QR info without authentication
export const getQRInfo = async (type, token) => {
  return safeApiCall(() => api.get('/scan/info', {
    params: { type, token }
  }));
};
// ========== ADMIN QR GENERATION ==========

// Generate QR for single seat
export const generateSeatQR = async (seatId) => {
  return safeApiCall(() => api.post(`/admin/qr/generate/seat/${seatId}`));
};

// Generate QR for single room
export const generateRoomQR = async (roomId) => {
  return safeApiCall(() => api.post(`/admin/qr/generate/room/${roomId}`));
};

// Bulk generate QR codes for seats
export const bulkGenerateSeatQRs = async (request) => {
  return safeApiCall(() => api.post('/admin/qr/generate/bulk/seats', request));
};

// Bulk generate QR codes for rooms
export const bulkGenerateRoomQRs = async (request) => {
  return safeApiCall(() => api.post('/admin/qr/generate/bulk/rooms', request));
};

// Download single QR code
export const downloadQRCode = async (type, resourceId) => {
  const response = await api.get(`/admin/qr/download/${type}/${resourceId}`, {
    responseType: 'blob'
  });
  return response;
};

// Download bulk QR codes as ZIP
export const downloadBulkQRCodes = async (type, resourceIds, downloadAll = false) => {
  const response = await api.post('/admin/qr/download/bulk', {
    type,
    resourceIds,
    downloadAll
  }, {
    responseType: 'blob'
  });
  return response;
};

// Get QR statistics
export const getQRStatistics = async () => {
  return safeApiCall(() => api.get('/admin/qr/statistics'));
};

// Get QR generation history
export const getQRHistory = async (type = null, resourceId = null) => {
  return safeApiCall(() => api.get('/admin/qr/history', {
    params: { type, resourceId }
  }));
};

// Generate all missing QR codes
export const generateAllMissingQRs = async () => {
  return safeApiCall(() => api.post('/admin/qr/generate/all-missing'));
};

// ========== ROOM/SEAT QR INTEGRATION ==========

// Generate QR for seat (integrated endpoint)
export const generateQRForSeat = async (seatId) => {
  return safeApiCall(() => api.post(`/admin/seats/${seatId}/generate-qr`));
};

// Generate QR for room (integrated endpoint)
export const generateQRForRoom = async (roomId) => {
  return safeApiCall(() => api.post(`/admin/rooms/${roomId}/generate-qr`));
};

// Bulk generate QR for seats
export const bulkGenerateQRForSeats = async (request) => {
  return safeApiCall(() => api.post('/admin/seats/bulk-generate-qr', request));
};

// Bulk generate QR for rooms
export const bulkGenerateQRForRooms = async (request) => {
  return safeApiCall(() => api.post('/admin/rooms/bulk-generate-qr', request));
};
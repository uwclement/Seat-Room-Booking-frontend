import api from './axiosConfig';

// Helper function to handle API calls with 401 handling
const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Room Management API calls
export const getAllRooms = async () => {
  return safeApiCall(() => api.get('/admin/rooms'));
};

export const getRoomById = async (id) => {
  return safeApiCall(() => api.get(`/admin/rooms/${id}`));
};

export const getRoomsByCategory = async (category) => {
  return safeApiCall(() => api.get(`/admin/rooms/category/${category}`));
};

export const createRoom = async (roomData) => {
  return safeApiCall(() => api.post('/admin/rooms', roomData));
};

export const updateRoom = async (id, roomData) => {
  return safeApiCall(() => api.put(`/admin/rooms/${id}`, roomData));
};

export const deleteRoom = async (id) => {
  return safeApiCall(() => api.delete(`/admin/rooms/${id}`));
};

export const toggleRoomAvailability = async (id) => {
  return safeApiCall(() => api.post(`/admin/rooms/${id}/toggle-availability`));
};

export const setMaintenanceWindow = async (id, startTime, endTime, notes) => {
  return safeApiCall(() => api.post(`/admin/rooms/${id}/maintenance`, null, {
    params: { startTime, endTime, notes }
  }));
};

export const clearMaintenanceWindow = async (id) => {
  return safeApiCall(() => api.delete(`/admin/rooms/${id}/maintenance`));
};

export const addEquipmentToRoom = async (roomId, equipmentIds) => {
  return safeApiCall(() => api.post(`/admin/rooms/${roomId}/equipment`, equipmentIds));
};

export const removeEquipmentFromRoom = async (roomId, equipmentIds) => {
  return safeApiCall(() => api.delete(`/admin/rooms/${roomId}/equipment`, { data: equipmentIds }));
};

export const performBulkOperation = async (operationData) => {
  return safeApiCall(() => api.post('/admin/rooms/bulk-operation', operationData));
};

export const searchRooms = async (keyword) => {
  return safeApiCall(() => api.get('/admin/rooms/search', { params: { keyword } }));
};

export const filterRooms = async (filters) => {
  return safeApiCall(() => api.get('/admin/rooms/filter', { params: filters }));
};

export const getRoomsUnderMaintenance = async () => {
  return safeApiCall(() => api.get('/admin/rooms/maintenance'));
};

export const getRecentlyUpdatedRooms = async (hours = 24) => {
  return safeApiCall(() => api.get('/admin/rooms/recently-updated', { params: { hours } }));
};

// Equipment Management API calls
export const getAllEquipment = async () => {
  return safeApiCall(() => api.get('/admin/equipment'));
};

export const getAvailableEquipment = async () => {
  return safeApiCall(() => api.get('/admin/equipment/available'));
};

export const getEquipmentById = async (id) => {
  return safeApiCall(() => api.get(`/admin/equipment/${id}`));
};

export const createEquipment = async (equipmentData) => {
  return safeApiCall(() => api.post('/admin/equipment', equipmentData));
};

export const updateEquipment = async (id, equipmentData) => {
  return safeApiCall(() => api.put(`/admin/equipment/${id}`, equipmentData));
};

export const deleteEquipment = async (id) => {
  return safeApiCall(() => api.delete(`/admin/equipment/${id}`));
};

export const toggleEquipmentAvailability = async (id) => {
  return safeApiCall(() => api.post(`/admin/equipment/${id}/toggle-availability`));
};

export const searchEquipment = async (keyword) => {
  return safeApiCall(() => api.get('/admin/equipment/search', { params: { keyword } }));
};

// Room Template API calls
export const getAllTemplates = async () => {
  return safeApiCall(() => api.get('/admin/rooms/templates'));
};

export const getTemplateById = async (id) => {
  return safeApiCall(() => api.get(`/admin/rooms/templates/${id}`));
};

export const createTemplate = async (templateData) => {
  return safeApiCall(() => api.post('/admin/rooms/templates', templateData));
};

export const createRoomFromTemplate = async (templateId, roomNumber, name) => {
  return safeApiCall(() => api.post(`/admin/rooms/templates/${templateId}/create-room`, null, {
    params: { roomNumber, name }
  }));
};

export const deleteTemplate = async (id) => {
  return safeApiCall(() => api.delete(`/admin/rooms/templates/${id}`));
};

// Public Room API calls (for users)
export const getPublicRooms = async () => {
  return safeApiCall(() => api.get('/rooms'));
};

export const getPublicRoomById = async (id) => {
  return safeApiCall(() => api.get(`/rooms/${id}`));
};

export const getPublicRoomsByCategory = async (category) => {
  return safeApiCall(() => api.get(`/rooms/category/${category}`));
};

export const searchPublicRooms = async (keyword) => {
  return safeApiCall(() => api.get('/rooms/search', { params: { keyword } }));
};

export const filterPublicRooms = async (filters) => {
  return safeApiCall(() => api.get('/rooms/filter', { params: filters }));
};
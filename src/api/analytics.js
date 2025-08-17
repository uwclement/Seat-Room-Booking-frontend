import api from './axiosConfig';

const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

const BASE_URL = '/analytics';

export const analyticsAPI = {
  // Permission check
  getUserPermissions: () => api.get(`${BASE_URL}/user-permissions`),
  
  // Seat Analytics
  getSeatSummary: (params) => api.get(`${BASE_URL}/seats/summary`, { params }),
  getSeatCharts: (params) => api.get(`${BASE_URL}/seats/charts`, { params }),
  downloadSeatSimple: (data) => api.post(`${BASE_URL}/seats/report/simple`, data, { responseType: 'blob' }),
  downloadSeatDetailed: (data) => api.post(`${BASE_URL}/seats/report/detailed`, data, { responseType: 'blob' }),
  
  // Room Analytics
  getRoomSummary: (params) => api.get(`${BASE_URL}/rooms/summary`, { params }),
  getRoomCharts: (params) => api.get(`${BASE_URL}/rooms/charts`, { params }),
  downloadRoomSimple: (data) => api.post(`${BASE_URL}/rooms/report/simple`, data, { responseType: 'blob' }),
  downloadRoomDetailed: (data) => api.post(`${BASE_URL}/rooms/report/detailed`, data, { responseType: 'blob' }),
  
  // Equipment Analytics
  getEquipmentSummary: (params) => api.get(`${BASE_URL}/equipment/summary`, { params }),
  getEquipmentCharts: (params) => api.get(`${BASE_URL}/equipment/charts`, { params }),
  downloadEquipmentSimple: (data) => api.post(`${BASE_URL}/equipment/report/simple`, data, { responseType: 'blob' }),
  downloadEquipmentDetailed: (data) => api.post(`${BASE_URL}/equipment/report/detailed`, data, { responseType: 'blob' }),
  
  // User Analytics
  getUserSummary: (params) => api.get(`${BASE_URL}/users/summary`, { params }),
  getUserCharts: (params) => api.get(`${BASE_URL}/users/charts`, { params }),
  downloadUserSimple: (data) => api.post(`${BASE_URL}/users/report/simple`, data, { responseType: 'blob' }),
  downloadUserDetailed: (data) => api.post(`${BASE_URL}/users/report/detailed`, data, { responseType: 'blob' })
};
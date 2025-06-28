import api from './axiosConfig';

const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getEquipmentUsageStats = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  return safeApiCall(() => api.get('/analytics/equipment-usage', { params }));
};

export const getSystemOverview = async () => {
  return safeApiCall(() => api.get('/analytics/system-overview'));
};
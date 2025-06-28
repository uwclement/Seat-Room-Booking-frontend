import api from './axiosConfig';

const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getEquipmentAvailability = async (equipmentId, startTime, endTime) => {
  return safeApiCall(() => api.get(`/availability/equipment/${equipmentId}`, {
    params: { startTime, endTime }
  }));
};

export const getLabClassAvailability = async (labClassId, startTime, endTime) => {
  return safeApiCall(() => api.get(`/availability/lab-class/${labClassId}`, {
    params: { startTime, endTime }
  }));
};
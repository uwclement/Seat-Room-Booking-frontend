import api from './axiosConfig';

const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProfessorDashboard = async () => {
  return safeApiCall(() => api.get('/dashboard/professor'));
};

export const getEquipmentAdminDashboard = async () => {
  return safeApiCall(() => api.get('/dashboard/equipment-admin'));
};

export const getHODDashboard = async () => {
  return safeApiCall(() => api.get('/dashboard/hod'));
};
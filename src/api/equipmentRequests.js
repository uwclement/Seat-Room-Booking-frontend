import api from './axiosConfig';

const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Equipment Request Management
export const createEquipmentRequest = async (requestData) => {
  return safeApiCall(() => api.post('/equipment-requests', requestData));
};

export const getMyEquipmentRequests = async () => {
  return safeApiCall(() => api.get('/equipment-requests/my-requests'));
};

export const escalateRequest = async (requestId) => {
  return safeApiCall(() => api.post(`/equipment-requests/${requestId}/escalate`));
};

// Equipment Admin functions
export const getPendingEquipmentRequests = async () => {
  return safeApiCall(() => api.get('/equipment-requests/pending'));
};

export const approveEquipmentRequest = async (requestId, approvalData) => {
  return safeApiCall(() => api.post(`/equipment-requests/${requestId}/approve`, approvalData));
};

// HOD functions
export const getEscalatedRequests = async () => {
  return safeApiCall(() => api.get('/equipment-requests/escalated'));
};

export const hodReviewRequest = async (requestId, reviewData) => {
  return safeApiCall(() => api.post(`/equipment-requests/${requestId}/hod-review`, reviewData));
};

// Public endpoints
export const getPublicAvailableEquipment = async () => {
  return safeApiCall(() => api.get('/public/equipment/available'));
};

export const getPublicStudentEquipment = async () => {
  return safeApiCall(() => api.get('/public/equipment/student-allowed'));
};

export const getPublicLabClasses = async () => {
  return safeApiCall(() => api.get('/public/lab-classes/available'));
};

export const getPublicActiveCourses = async () => {
  return safeApiCall(() => api.get('/public/courses/active'));
};
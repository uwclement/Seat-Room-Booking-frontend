import api from './axiosConfig';

const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Professor lab request functions
export const createLabRequest = async (labRequest) => {
  return safeApiCall(() => api.post('/lab-requests', labRequest));
};

export const getMyLabRequests = async () => {
  return safeApiCall(() => api.get('/lab-requests/my-requests'));
};

export const escalateLabRequest = async (requestId) => {
  return safeApiCall(() => api.post(`/lab-requests/${requestId}/escalate`));
};

export const cancelLabRequest = async (requestId) => {
  return safeApiCall(() => api.post(`/lab-requests/${requestId}/cancel`));
};

// Equipment Admin functions
export const getPendingLabRequests = async () => {
  return safeApiCall(() => api.get('/lab-requests/pending'));
};

export const approveLabRequest = async (requestId, approvalData) => {
  return safeApiCall(() => api.post(`/lab-requests/${requestId}/approve`, approvalData));
};

export const getCurrentMonthLabRequests = async () => {
  return safeApiCall(() => api.get('/lab-requests/current-month'));
};

// HOD functions
export const getEscalatedLabRequests = async () => {
  return safeApiCall(() => api.get('/lab-requests/escalated'));
};

export const hodReviewLabRequest = async (requestId, reviewData) => {
  return safeApiCall(() => api.post(`/lab-requests/${requestId}/hod-review`, reviewData));
};
import api from './axiosConfig';

const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Professor course management
export const requestCourseApproval = async (courseRequest) => {
  return safeApiCall(() => api.post('/professor/request-courses', courseRequest));
};

// FIXED: Add missing function
export const getMyApprovedCourses = async () => {
  return safeApiCall(() => api.get('/professor/my-courses'));
};

// HOD functions
export const getPendingProfessorApprovals = async () => {
  return safeApiCall(() => api.get('/professor/pending-approvals'));
};

export const approveProfessorAccount = async (professorId) => {
  return safeApiCall(() => api.post(`/professor/${professorId}/approve-account`));
};

export const approveProfessorCourses = async (professorId, courseIds) => {
  return safeApiCall(() => api.post(`/professor/${professorId}/approve-courses`, courseIds));
};

// get course
export const getActiveCourses = async () => {
  return safeApiCall(() => api.get('professor/courses/active'));
};


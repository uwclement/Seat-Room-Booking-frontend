import api from './axiosConfig';

const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Enhanced Equipment Management (Equipment Admin)
export const getAllEquipmentAdmin = async () => {
  return safeApiCall(() => api.get('/equipment-admin/equipment'));
};

export const getStudentAllowedEquipment = async () => {
  return safeApiCall(() => api.get('/equipment-admin/equipment/student-allowed'));
};

export const createEquipmentAdmin = async (equipmentData) => {
  return safeApiCall(() => api.post('/equipment-admin/equipment', equipmentData));
};

export const updateEquipmentAdmin = async (id, equipmentData) => {
  return safeApiCall(() => api.put(`/equipment-admin/equipment/${id}`, equipmentData));
};

export const deleteEquipmentAdmin = async (id) => {
  return safeApiCall(() => api.delete(`/equipment-admin/equipment/${id}`));
};

export const toggleEquipmentAvailabilityAdmin = async (id) => {
  return safeApiCall(() => api.post(`/equipment-admin/equipment/${id}/toggle-availability`));
};

// Course Management
export const getAllCourses = async () => {
  return safeApiCall(() => api.get('/equipment-admin/courses'));
};

export const getActiveCourses = async () => {
  return safeApiCall(() => api.get('/equipment-admin/courses/active'));
};

export const createCourse = async (courseData) => {
  return safeApiCall(() => api.post('/equipment-admin/courses', courseData));
};

export const updateCourse = async (id, courseData) => {
  return safeApiCall(() => api.put(`/equipment-admin/courses/${id}`, courseData));
};

export const deleteCourse = async (id) => {
  return safeApiCall(() => api.delete(`/equipment-admin/courses/${id}`));
};

export const toggleCourseStatus = async (id) => {
  return safeApiCall(() => api.post(`/equipment-admin/courses/${id}/toggle-status`));
};

// Lab Class Management
export const getAllLabClasses = async () => {
  return safeApiCall(() => api.get('/equipment-admin/lab-classes'));
};

export const getAvailableLabClasses = async () => {
  return safeApiCall(() => api.get('/equipment-admin/lab-classes/available'));
};

export const createLabClass = async (labClassData) => {
  return safeApiCall(() => api.post('/equipment-admin/lab-classes', labClassData));
};

export const updateLabClass = async (id, labClassData) => {
  return safeApiCall(() => api.put(`/equipment-admin/lab-classes/${id}`, labClassData));
};

export const deleteLabClass = async (id) => {
  return safeApiCall(() => api.delete(`/equipment-admin/lab-classes/${id}`));
};

export const toggleLabAvailability = async (id) => {
  return safeApiCall(() => api.post(`/equipment-admin/lab-classes/${id}/toggle-availability`));
};

// FIXED: Add missing equipment requests function
export const getPendingEquipmentRequests = async () => {
  return safeApiCall(() => api.get('/equipment-requests/pending'));
};
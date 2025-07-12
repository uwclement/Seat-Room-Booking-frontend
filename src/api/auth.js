import api from './axiosConfig';

export const login = async (identifier, password) => {
  const response = await api.post('/auth/signin', { 
    identifier, 
    password 
  });
  return response.data;
};

// Enhanced register function with location support
export const register = async (userData) => {
  const response = await api.post('/auth/signup', {
    fullName: userData.fullName,
    email: userData.email,
    studentId: userData.studentId,
    location: userData.location, // Add location support
    password: userData.password
  });
  return response.data;
};

// Email availability check
export const checkEmailExists = async (email) => {
  const response = await api.get(`/auth/check-email?email=${email}`);
  return response.data;
};

// Student ID availability check
export const checkStudentIdExists = async (studentId) => {
  const response = await api.get(`/auth/check-student-id?studentId=${studentId}`);
  return response.data;
};

// Employee ID availability check  
export const checkEmployeeIdExists = async (employeeId) => {
  const response = await api.get(`/auth/check-employee-id?employeeId=${employeeId}`);
  return response.data;
};

// Email verification
export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify?token=${token}`);
  return response.data;
};

// Change password (for authenticated users)
export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('/auth/change-password', {
    currentPassword,
    newPassword
  });
  return response.data;
};

// Forgot password (if you implement this feature)
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// Reset password (if you implement this feature)
export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/reset-password', {
    token,
    newPassword
  });
  return response.data;
};
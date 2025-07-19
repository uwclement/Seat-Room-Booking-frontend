import api from './axiosConfig';

export const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user;
};

const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

// export const getUserById = async (id) => {
//   const response = await api.get(`/users/${id}`);
//   return response.data;
// };

export const getAllUsers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.userType) queryParams.append('userType', params.userType);
  if (params.role) queryParams.append('role', params.role);
  if (params.location) queryParams.append('location', params.location);
  if (params.search) queryParams.append('search', params.search);
  if (params.active !== undefined) queryParams.append('active', params.active);
  
  const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return safeApiCall(() => api.get(url));
};

// Get users by type
export const getStudents = async () => {
  return safeApiCall(() => api.get('/admin/users/students'));
};

export const getStaff = async () => {
  return safeApiCall(() => api.get('/admin/users/staff'));
};

export const getLibrarians = async (location = null) => {
  const url = location 
    ? `/admin/users/librarians?location=${location}`
    : '/admin/users/librarians';
  return safeApiCall(() => api.get(url));
};

// Get librarians by specific location
export const getGishushuLibrarians = async () => {
  return safeApiCall(() => api.get('/admin/users/librarians?location=GISHUSHU'));
};

export const getMasoroLibrarians = async () => {
  return safeApiCall(() => api.get('/admin/users/librarians?location=MASORO'));
};

// Get active librarians for a specific date and location
export const getActiveLibrarians = async (date, location = null) => {
  const url = location 
    ? `/users/librarians/active?day=${date}&location=${location}`
    : `/users/librarians/active?day=${date}`;
  return safeApiCall(() => api.get(url));
};

// Get default librarians by location
export const getDefaultLibrarians = async (location = null) => {
  const url = location 
    ? `/users/librarians/default?location=${location}`
    : '/users/librarians/default';
  return safeApiCall(() => api.get(url));
};

// Create staff user
export const createStaffUser = async (userData) => {
  return safeApiCall(() => api.post('/admin/users/staff', userData));
};

// Update staff user
export const updateStaffUser = async (userId, userData) => {
  return safeApiCall(() => api.put(`/admin/users/staff/${userId}`, userData));
};

// Update user status (enable/disable)
export const updateUserStatus = async (userId, status) => {
  return safeApiCall(() => api.put(`/admin/users/${userId}/status`, { status }));
};

// Delete user
export const deleteUser = async (userId) => {
  return safeApiCall(() => api.delete(`/admin/users/${userId}`));
};

// Get user by ID
export const getUserById = async (userId) => {
  return safeApiCall(() => api.get(`/users/${userId}`));
};

// Get user by email
export const getUserByEmail = async (email) => {
  return safeApiCall(() => api.get(`/users/email/${email}`));
};

// Get user by identifier (studentId or employeeId)
export const getUserByIdentifier = async (identifier) => {
  return safeApiCall(() => api.get(`/users/identifier/${identifier}`));
};


// Bulk user actions
export const bulkUserActions = async (userIds, action) => {
  return safeApiCall(() => api.post('/admin/users/bulk-actions', {
    userIds,
    action
  }));
};

// Bulk enable users
export const bulkEnableUsers = async (userIds) => {
  return safeApiCall(() => api.post('/admin/users/bulk-enable', { userIds }));
};

// Bulk delete users
export const bulkDeleteUsers = async (userIds) => {
  return safeApiCall(() => api.delete('/admin/users/bulk', { 
    data: { userIds } 
  }));
};

// ==================== SEARCH AND FILTER ====================

// Advanced search
export const searchUsers = async (query, filters = {}) => {
  const params = new URLSearchParams();
  params.append('query', query);
  
  if (filters.userType) params.append('userType', filters.userType);
  if (filters.role) params.append('role', filters.role);
  if (filters.location) params.append('location', filters.location);
  
  return safeApiCall(() => api.get(`/admin/users/search?${params.toString()}`));
};

// Filter users
export const filterUsers = async (filters) => {
  const params = new URLSearchParams();
  
  if (filters.roles) params.append('roles', filters.roles.join(','));
  if (filters.locations) params.append('locations', filters.locations.join(','));
  if (filters.active !== undefined) params.append('active', filters.active);
  
  return safeApiCall(() => api.get(`/admin/users/filter?${params.toString()}`));
};

// ==================== STATISTICS ====================

// Get user statistics by role
export const getUserStatsByRole = async () => {
  return safeApiCall(() => api.get('/admin/users/stats/by-role'));
};

// Get admin dashboard data
export const getAdminDashboard = async () => {
  return safeApiCall(() => api.get('/admin/users/dashboard'));
};

export const getPendingProfessors = async () => {
  return safeApiCall(() => api.get('/users/professors/pending'));
};

// Approve professor (HOD only)
export const approveProfessor = async (professorId) => {
  return safeApiCall(() => api.post(`/users/professors/${professorId}/approve`));
};

// Check email availability
export const checkEmailAvailability = async (email) => {
  return safeApiCall(() => api.get(`/auth/check-email?email=${email}`));
};

// Check student ID availability
export const checkStudentIdAvailability = async (studentId) => {
  return safeApiCall(() => api.get(`/auth/check-student-id?studentId=${studentId}`));
};

// Check employee ID availability
export const checkEmployeeIdAvailability = async (employeeId) => {
  return safeApiCall(() => api.get(`/auth/check-employee-id?employeeId=${employeeId}`));
};

// ==================== PASSWORD MANAGEMENT ====================

// Change own password
export const changePassword = async (currentPassword, newPassword) => {
  return safeApiCall(() => api.post('/auth/change-password', {
    currentPassword,
    newPassword
  }));
};

// Admin reset user password
export const resetUserPassword = async (userId) => {
  return safeApiCall(() => api.post(`/admin/users/${userId}/reset-password`));
};



// Get staff users who have default passwords (haven't changed them yet)
export const getStaffWithDefaultPasswords = async () => {
  return safeApiCall(() => api.get('/admin/users/staff/default-passwords'));
};

// Get default password for a specific user (admin only)
export const getDefaultPassword = async (userId) => {
  const response = await api.get(`/admin/users/${userId}/default-password`);
  return response.data.data; 
};

// // Send password email to user (admin only)
// export const sendPasswordEmail = async (userId) => {
//   return safeApiCall(() => api.post(`/admin/users/${userId}/send-password-email`));
// };

// Get all staff members with their password status
export const getStaffPasswordStatus = async () => {
  return safeApiCall(() => api.get('/admin/users/staff/password-status'));
};

// Force password change for user (admin only)
export const forcePasswordChange = async (userId) => {
  return safeApiCall(() => api.post(`/admin/users/${userId}/force-password-change`));
};

// Check if user has default password
export const hasDefaultPassword = async (userId) => {
  return safeApiCall(() => api.get(`/admin/users/${userId}/has-default-password`));
};
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getAllUsers,
  getStudents,
  getStaff,
  getLibrarians,
  getGishushuLibrarians,
  getMasoroLibrarians,
  createStaffUser,
  updateStaffUser,
  updateUserStatus,
  deleteUser,
  bulkUserActions,
  searchUsers,
  filterUsers,
  getUserStatsByRole,
  getAdminDashboard
} from '../api/user';

export const UserManagementContext = createContext();

export const UserManagementProvider = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  // State for user data
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [librarians, setLibrarians] = useState([]);
  const [gishushuLibrarians, setGishushuLibrarians] = useState([]);
  const [masoroLibrarians, setMasoroLibrarians] = useState([]);
  
  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // State for filters and search
  const [filters, setFilters] = useState({
    userType: '',
    role: '',
    location: '',
    active: '',
    search: ''
  });
  
  // State for pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalUsers: 0,
    totalPages: 0
  });
  
  // State for statistics
  const [userStats, setUserStats] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Fetch all users with filters
  const fetchUsers = useCallback(async (customFilters = null) => {
    if (!isAuthenticated() || !isAdmin()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const filterParams = customFilters || filters;
      const data = await getAllUsers(filterParams);
      setUsers(data);
      
      // Update pagination if the response includes pagination info
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          ...data.pagination
        }));
      }
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch users. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, filters]);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return;
    
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch students.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch staff
  const fetchStaff = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return;
    
    setLoading(true);
    try {
      const data = await getStaff();
      setStaff(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch staff.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch all librarians
  const fetchLibrarians = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return;
    
    setLoading(true);
    try {
      const data = await getLibrarians();
      setLibrarians(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch librarians.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch Gishushu librarians
  const fetchGishushuLibrarians = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return;
    
    try {
      const data = await getGishushuLibrarians();
      setGishushuLibrarians(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch Gishushu librarians.');
        console.error(err);
      }
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch Masoro librarians
  const fetchMasoroLibrarians = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return;
    
    try {
      const data = await getMasoroLibrarians();
      setMasoroLibrarians(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch Masoro librarians.');
        console.error(err);
      }
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch user statistics
  const fetchUserStats = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return;
    
    try {
      const data = await getUserStatsByRole();
      setUserStats(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch user statistics.');
        console.error(err);
      }
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return;
    
    try {
      const data = await getAdminDashboard();
      setDashboardData(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch dashboard data.');
        console.error(err);
      }
    }
  }, [isAuthenticated, isAdmin]);

  // Create staff user
  const handleCreateStaff = async (userData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await createStaffUser(userData);
      setSuccess('Staff user created successfully');
      await fetchUsers();
      await fetchStaff();
      
      // Refresh librarians if the created user is a librarian
      if (userData.role === 'LIBRARIAN') {
        await fetchLibrarians();
        if (userData.location === 'GISHUSHU') {
          await fetchGishushuLibrarians();
        } else if (userData.location === 'MASORO') {
          await fetchMasoroLibrarians();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff user');
      throw err;
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Update staff user
  const handleUpdateStaff = async (userId, userData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await updateStaffUser(userId, userData);
      setSuccess('Staff user updated successfully');
      await fetchUsers();
      await fetchStaff();
      
      // Refresh librarians if relevant
      if (userData.role === 'LIBRARIAN' || 
          users.find(u => u.id === userId)?.roles?.includes('ROLE_LIBRARIAN')) {
        await fetchLibrarians();
        await fetchGishushuLibrarians();
        await fetchMasoroLibrarians();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update staff user');
      throw err;
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Update user status
  const handleUpdateUserStatus = async (userId, status) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await updateUserStatus(userId, status);
      setSuccess(`User ${status === 'ENABLED' ? 'enabled' : 'disabled'} successfully`);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
      throw err;
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await deleteUser(userId);
      setSuccess('User deleted successfully');
      await fetchUsers();
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      setError('No users selected');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await bulkUserActions(selectedUsers, action);
      setSuccess(result.message || `Bulk ${action.toLowerCase()} completed successfully`);
      await fetchUsers();
      setSelectedUsers([]);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to perform bulk ${action.toLowerCase()}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Search users
  const handleSearch = async (query) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await searchUsers(query, filters);
      setUsers(data);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const handleApplyFilters = async (newFilters) => {
    setFilters(newFilters);
    await fetchUsers(newFilters);
  };

  // Clear filters
  const handleClearFilters = () => {
    const clearedFilters = {
      userType: '',
      role: '',
      location: '',
      active: '',
      search: ''
    };
    setFilters(clearedFilters);
    fetchUsers(clearedFilters);
  };

  // User selection functions
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(user => user.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  // Load initial data when authentication status changes
  useEffect(() => {
    if (isAuthenticated() && isAdmin()) {
      fetchUsers();
      fetchUserStats();
      fetchDashboardData();
    }
  }, [isAuthenticated, isAdmin, fetchUsers, fetchUserStats, fetchDashboardData]);

  const contextValue = {
    // State
    users,
    students,
    staff,
    librarians,
    gishushuLibrarians,
    masoroLibrarians,
    loading,
    error,
    success,
    selectedUsers,
    filters,
    pagination,
    userStats,
    dashboardData,
    
    // Functions
    fetchUsers,
    fetchStudents,
    fetchStaff,
    fetchLibrarians,
    fetchGishushuLibrarians,
    fetchMasoroLibrarians,
    fetchUserStats,
    fetchDashboardData,
    handleCreateStaff,
    handleUpdateStaff,
    handleUpdateUserStatus,
    handleDeleteUser,
    handleBulkAction,
    handleSearch,
    handleApplyFilters,
    handleClearFilters,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    setError,
    setSuccess,
    setFilters
  };

  return (
    <UserManagementContext.Provider value={contextValue}>
      {children}
    </UserManagementContext.Provider>
  );
};
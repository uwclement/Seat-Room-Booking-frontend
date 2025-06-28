import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMyEquipmentRequests } from '../api/equipmentRequests';
import { getMyApprovedCourses } from '../api/professor'; 
import { getProfessorDashboard } from '../api/dashboards';

const ProfessorContext = createContext();

export const useProfessor = () => {
  const context = useContext(ProfessorContext);
  if (!context) {
    throw new Error('useProfessor must be used within a ProfessorProvider');
  }
  return context;
};

export const ProfessorProvider = ({ children }) => {
  const { isProfessor, user } = useAuth();
  
  // State
  const [myRequests, setMyRequests] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedRequests, setSelectedRequests] = useState([]);
  
  // Loading states
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    equipment: '',
    dateRange: { start: '', end: '' }
  });
  
  // Messages
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load my requests
  const loadMyRequests = async () => {
    if (!isProfessor()) return;
    
    setLoadingRequests(true);
    try {
      const data = await getMyEquipmentRequests();
      setMyRequests(data);
    } catch (err) {
      setError('Failed to load your requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  // Load my courses
  const loadMyCourses = async () => {
    if (!isProfessor()) return;
    
    setLoadingCourses(true);
    try {
      const data = await getMyApprovedCourses();
      setMyCourses(data);
    } catch (err) {
      setError('Failed to load your courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  // Load dashboard
  const loadDashboard = async () => {
    if (!isProfessor()) return;
    
    setLoadingDashboard(true);
    try {
      const data = await getProfessorDashboard();
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Filter functions
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getFilteredRequests = () => {
    let filtered = [...myRequests];
    
    if (filters.status) {
      filtered = filtered.filter(req => req.status === filters.status);
    }
    
    if (filters.equipment) {
      filtered = filtered.filter(req => 
        req.equipmentName.toLowerCase().includes(filters.equipment.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Selection functions
  const toggleRequestSelection = (requestId) => {
    setSelectedRequests(prev => {
      if (prev.includes(requestId)) {
        return prev.filter(id => id !== requestId);
      } else {
        return [...prev, requestId];
      }
    });
  };

  const clearSelection = () => {
    setSelectedRequests([]);
  };

  // Update functions
  const updateRequestInState = (requestId, updates) => {
    setMyRequests(prev => 
      prev.map(req => req.id === requestId ? { ...req, ...updates } : req)
    );
  };

  // Message functions
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // Refresh all data
  const refreshAll = async () => {
    await Promise.all([
      loadMyRequests(),
      loadMyCourses(),
      loadDashboard()
    ]);
  };

  // Load data on mount
  useEffect(() => {
    if (isProfessor()) {
      refreshAll();
    }
  }, [isProfessor]);

  const contextValue = {
    // Data
    myRequests,
    myCourses,
    dashboardData,
    selectedRequests,
    
    // Loading states
    loadingRequests,
    loadingCourses,
    loadingDashboard,
    
    // Filters
    filters,
    
    // Messages
    error,
    successMessage,
    
    // Functions
    loadMyRequests,
    loadMyCourses,
    loadDashboard,
    updateFilters,
    getFilteredRequests,
    toggleRequestSelection,
    clearSelection,
    updateRequestInState,
    showSuccess,
    showError,
    clearMessages,
    refreshAll
  };

  return (
    <ProfessorContext.Provider value={contextValue}>
      {children}
    </ProfessorContext.Provider>
  );
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getAllEquipmentAdmin,
  getAllCourses,
  getAllLabClasses,
  getPendingEquipmentRequests,
  getCurrentMonthEquipmentRequests
} from '../api/equipmentAdmin';

import {
  getPendingLabRequests,
  getCurrentMonthLabRequests
} from '../api/labRequests';

const EquipmentAdminContext = createContext();

export const useEquipmentAdmin = () => {
  const context = useContext(EquipmentAdminContext);
  if (!context) {
    throw new Error('useEquipmentAdmin must be used within an EquipmentAdminProvider');
  }
  return context;
};

export const EquipmentAdminProvider = ({ children }) => {
  const { isEquipmentAdmin } = useAuth();
  
  // Equipment state
  const [equipment, setEquipment] = useState([]);
  const [courses, setCourses] = useState([]);
  const [labClasses, setLabClasses] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [EquipmentRequests, setEquipmentRequests] = useState([]);
  
  // Loading states
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingLabClasses, setLoadingLabClasses] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingEquipmentRequests, setLoadingEquipmentRequests] = useState(false);


  // Lab class requests 
  const [pendingLabRequests, setPendingLabRequests] = useState([]);
  const [labRequests, setLabRequests] = useState([]);
  const [loadingLabRequests, setLoadingLabRequests] = useState(false);
  const [loadingCurrentMonthLabs, setLoadingCurrentMonthLabs] = useState(false);
  
  // Filter and view state
  const [filters, setFilters] = useState({
    keyword: '',
    availability: '',
    allowedToStudents: '',
    category: ''
  });
  
  const [viewMode, setViewMode] = useState('equipment'); // equipment, courses, labs, requests
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Messages
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load equipment
  const loadEquipment = async () => {
    if (!isEquipmentAdmin()) return;
    
    setLoadingEquipment(true);
    try {
      const data = await getAllEquipmentAdmin();
      setEquipment(data);
    } catch (err) {
      setError('Failed to load equipment');
    } finally {
      setLoadingEquipment(false);
    }
  };

  // Load courses
  const loadCourses = async () => {
    if (!isEquipmentAdmin()) return;
    
    setLoadingCourses(true);
    try {
      const data = await getAllCourses();
      setCourses(data);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  // load the equipment request
  const loadEquipmentRequests = async () => {
    if (!isEquipmentAdmin()) return;
    
    setLoadingEquipmentRequests(true);
    try {
      const data = await getCurrentMonthEquipmentRequests();
      setEquipmentRequests(data);
    } catch (err) {
      setError('Failed to load EquipmentRequests');
    } finally {
      setLoadingEquipmentRequests(false);
    }
  };

  // Load lab classes
  const loadLabClasses = async () => {
    if (!isEquipmentAdmin()) return;
    
    setLoadingLabClasses(true);
    try {
      const data = await getAllLabClasses();
      setLabClasses(data);
    } catch (err) {
      setError('Failed to load lab classes');
    } finally {
      setLoadingLabClasses(false);
    }
  };

  // Load pending requests
  const loadPendingRequests = async () => {
    if (!isEquipmentAdmin()) return;
    
    setLoadingRequests(true);
    try {
      const data = await getPendingEquipmentRequests();
      setPendingRequests(data);
    } catch (err) {
      setError('Failed to load pending requests');
    } finally {
      setLoadingRequests(false);
    }
  };


  // Load pending lab requests
const loadPendingLabRequests = async () => {
  if (!isEquipmentAdmin()) return;
  
  setLoadingLabRequests(true);
  try {
    const data = await getPendingLabRequests();
    setPendingLabRequests(data);
  } catch (err) {
    setError('Failed to load pending lab requests');
  } finally {
    setLoadingLabRequests(false);
  }
};

// Load current month lab requests
const loadCurrentMonthLabRequests = async () => {
  if (!isEquipmentAdmin()) return;
  
  setLoadingCurrentMonthLabs(true);
  try {
    const data = await getCurrentMonthLabRequests();
    setLabRequests(data);
  } catch (err) {
    setError('Failed to load lab requests');
  } finally {
    setLoadingCurrentMonthLabs(false);
  }
};


  // Filter functions
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      availability: '',
      allowedToStudents: '',
      category: ''
    });
  };

  const getFilteredData = () => {
    let dataToFilter;
    
    switch (viewMode) {
      case 'courses':
        dataToFilter = courses;
        break;
      case 'labs':
        dataToFilter = labClasses;
        break;
      case 'requests':
        dataToFilter = pendingRequests;
        break;
      case 'lab-requests':              
        dataToFilter = pendingLabRequests;
        break;
      default:
        dataToFilter = equipment;
    }
    
    if (!filters.keyword) return dataToFilter;
    
    return dataToFilter.filter(item => {
      const searchFields = [item.name, item.description, item.courseCode, item.labNumber];
      return searchFields.some(field => 
        field && field.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    });
  };

  // Selection functions
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const selectAllItems = () => {
    const filteredData = getFilteredData();
    setSelectedItems(filteredData.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Update functions
  const updateItemInState = (itemId, updates, type = 'equipment') => {
    const updateList = (items) =>
      items.map(item => item.id === itemId ? { ...item, ...updates } : item);
    
    switch (type) {
      case 'courses':
        setCourses(updateList);
        break;
      case 'labs':
        setLabClasses(updateList);
        break;
      case 'requests':
        setPendingRequests(updateList);
        break;
      default:
        setEquipment(updateList);
    }
  };

  const removeItemFromState = (itemId, type = 'equipment') => {
    const filterList = (items) => items.filter(item => item.id !== itemId);
    
    switch (type) {
      case 'courses':
        setCourses(filterList);
        break;
      case 'labs':
        setLabClasses(filterList);
        break;
      case 'requests':
        setPendingRequests(filterList);
        break;
      default:
        setEquipment(filterList);
    }
    
    setSelectedItems(prev => prev.filter(id => id !== itemId));
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
      loadEquipment(),
      loadCourses(),
      loadLabClasses(),
      loadPendingRequests(),
      loadEquipmentRequests(),
      loadPendingLabRequests(),        
      loadCurrentMonthLabRequests(),
    ]);
  };

  // Load data on mount
  useEffect(() => {
    if (isEquipmentAdmin()) {
      refreshAll();
    }
  }, [isEquipmentAdmin]);

  const contextValue = {
    // Data
    equipment,
    courses,
    labClasses,
    pendingRequests,
    EquipmentRequests,
    pendingLabRequests,     
    labRequests,
    
    // Loading states
    loadingEquipment,
    loadingCourses,
    loadingLabClasses,
    loadingRequests,
    loadingEquipmentRequests,
    loadingLabRequests,        
    loadingCurrentMonthLabs,
    
    // Filters and view
    filters,
    viewMode,
    selectedItems,
    
    // Messages
    error,
    successMessage,
    
    // Functions
    loadEquipment,
    loadCourses,
    loadEquipmentRequests,
    loadLabClasses,
    loadPendingRequests,
    loadPendingLabRequests,        
    loadCurrentMonthLabRequests,  
    updateFilters,
    clearFilters,
    getFilteredData,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    updateItemInState,
    removeItemFromState,
    showSuccess,
    showError,
    clearMessages,
    refreshAll,
    setViewMode
  };

  return (
    <EquipmentAdminContext.Provider value={contextValue}>
      {children}
    </EquipmentAdminContext.Provider>
  );
};
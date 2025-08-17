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

import {
  getActiveRequests,
  getExtensionRequests
} from '../api/equipmentRequests';

// NEW: Import equipment units API
import {
  getAllEquipmentUnits,
  getActiveAssignments,
  getEquipmentSummary
} from '../api/equipmentUnits';

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
  
  // Existing state
  const [equipment, setEquipment] = useState([]);
  const [courses, setCourses] = useState([]);
  const [labClasses, setLabClasses] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [EquipmentRequests, setEquipmentRequests] = useState([]);
  
  // NEW: Equipment Units state
  const [equipmentUnits, setEquipmentUnits] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [equipmentSummary, setEquipmentSummary] = useState({
    totalUnits: 0,
    availableUnits: 0,
    assignedUnits: 0,
    maintenanceUnits: 0,
    damagedUnits: 0
  });
  
  // Existing loading states
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingLabClasses, setLoadingLabClasses] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingEquipmentRequests, setLoadingEquipmentRequests] = useState(false);

  // NEW: Equipment Units loading states
  const [loadingEquipmentUnits, setLoadingEquipmentUnits] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Existing lab class requests 
  const [pendingLabRequests, setPendingLabRequests] = useState([]);
  const [labRequests, setLabRequests] = useState([]);
  const [loadingLabRequests, setLoadingLabRequests] = useState(false);
  const [loadingCurrentMonthLabs, setLoadingCurrentMonthLabs] = useState(false);

  // Existing requests 
  const [activeRequests, setActiveRequests] = useState([]);
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [loadingActiveRequests, setLoadingActiveRequests] = useState(false);
  const [loadingExtensionRequests, setLoadingExtensionRequests] = useState(false);
  
  // Enhanced filter state to include equipment units
  const [filters, setFilters] = useState({
    keyword: '',
    availability: '',
    allowedToStudents: '',
    category: '',
    // NEW: Equipment unit filters
    unitStatus: '',
    assignmentType: '',
    serialNumber: ''
  });
  
  // Enhanced view mode to include new views
  const [viewMode, setViewMode] = useState('equipment'); // equipment, units, assignments, courses, labs, requests
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Messages
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Existing load functions
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

  const updateEquipmentRequestInState = (requestId, updates) => {
    setEquipmentRequests(prev => 
      prev.map(req => req.id === requestId ? { ...req, ...updates } : req)
    );
    
    setPendingRequests(prev => 
      prev.map(req => req.id === requestId ? { ...req, ...updates } : req)
    );

    setActiveRequests(prev => 
        prev.map(req => req.id === requestId ? { ...req, ...updates } : req)
    );

    setExtensionRequests(prev => 
        prev.map(req => req.id === requestId ? { ...req, ...updates } : req)
    );
    
    // Auto-refresh to get latest data
    setTimeout(() => {
      loadEquipmentRequests();
      loadPendingRequests();
      loadActiveRequests();
      loadExtensionRequests();
    }, 1000);
  };

  const loadExtensionRequests = async () => {
    if (!isEquipmentAdmin()) return;
    
    setLoadingExtensionRequests(true);
    try {
      const data = await getExtensionRequests();
      setExtensionRequests(data);
    } catch (err) {
      setError('Failed to load extension requests');
    } finally {
      setLoadingExtensionRequests(false);
    }
  };

  const loadActiveRequests = async () => {
    if (!isEquipmentAdmin()) return;
    
    setLoadingActiveRequests(true);
    try {
      const data = await getActiveRequests();
      setActiveRequests(data);
    } catch (err) {
      setError('Failed to load active requests');
    } finally {
      setLoadingActiveRequests(false);
    }
  };

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

  // NEW: Equipment Units load functions
  const loadEquipmentUnits = async () => {
    if (!isEquipmentAdmin()) return;
    
    setLoadingEquipmentUnits(true);
    try {
      const data = await getAllEquipmentUnits();
      setEquipmentUnits(data);
    } catch (err) {
      setError('Failed to load equipment units');
    } finally {
      setLoadingEquipmentUnits(false);
    }
  };

  const loadAssignments = async () => {
    if (!isEquipmentAdmin()) return;
    
    setLoadingAssignments(true);
    try {
      const data = await getActiveAssignments();
      setAssignments(data);
    } catch (err) {
      setError('Failed to load assignments');
    } finally {
      setLoadingAssignments(false);
    }
  };

  const loadEquipmentSummary = async () => {
    if (!isEquipmentAdmin()) return;
    
    setLoadingSummary(true);
    try {
      const data = await getEquipmentSummary();
      setEquipmentSummary(data);
    } catch (err) {
      setError('Failed to load equipment summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  // Enhanced filter functions
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      availability: '',
      allowedToStudents: '',
      category: '',
      unitStatus: '',
      assignmentType: '',
      serialNumber: ''
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
      case 'units': // NEW
        dataToFilter = equipmentUnits;
        break;
      case 'assignments': // NEW
        dataToFilter = assignments;
        break;
      default:
        dataToFilter = equipment;
    }
    
    if (!filters.keyword && !filters.unitStatus && !filters.assignmentType && !filters.serialNumber) {
      return dataToFilter;
    }
    
    return dataToFilter.filter(item => {
      // Keyword search
      if (filters.keyword) {
        const searchFields = [
          item.name, 
          item.description, 
          item.courseCode, 
          item.labNumber,
          item.serialNumber, // NEW
          item.equipmentName, // NEW
          item.assignedToName // NEW
        ];
        const matchesKeyword = searchFields.some(field => 
          field && field.toLowerCase().includes(filters.keyword.toLowerCase())
        );
        if (!matchesKeyword) return false;
      }
      
      // Unit status filter
      if (filters.unitStatus && item.status && item.status !== filters.unitStatus) {
        return false;
      }
      
      // Assignment type filter
      if (filters.assignmentType && item.assignmentType && item.assignmentType !== filters.assignmentType) {
        return false;
      }
      
      // Serial number filter
      if (filters.serialNumber && item.serialNumber && 
          !item.serialNumber.toLowerCase().includes(filters.serialNumber.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  // Enhanced update functions
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
      case 'units': // NEW
        setEquipmentUnits(updateList);
        break;
      case 'assignments': // NEW
        setAssignments(updateList);
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
      case 'units': // NEW
        setEquipmentUnits(filterList);
        break;
      case 'assignments': // NEW
        setAssignments(filterList);
        break;
      default:
        setEquipment(filterList);
    }
    
    setSelectedItems(prev => prev.filter(id => id !== itemId));
  };

  // NEW: Equipment unit specific functions
  const addEquipmentUnitToState = (newUnit) => {
    setEquipmentUnits(prev => [...prev, newUnit]);
  };

  const addAssignmentToState = (newAssignment) => {
    setAssignments(prev => [...prev, newAssignment]);
  };

  // Enhanced selection functions
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

  // Enhanced refresh function
  const refreshAll = async () => {
    await Promise.all([
      loadEquipment(),
      loadCourses(),
      loadLabClasses(),
      loadPendingRequests(),
      loadEquipmentRequests(),
      loadPendingLabRequests(),        
      loadCurrentMonthLabRequests(),
      loadActiveRequests(),           
      loadExtensionRequests(),
      // NEW
      loadEquipmentUnits(),
      loadAssignments(),
      loadEquipmentSummary()
    ]);
  };

  // Load data on mount
  useEffect(() => {
    if (isEquipmentAdmin()) {
      refreshAll();
    }
  }, [isEquipmentAdmin]);

  const contextValue = {
    // Existing data
    equipment,
    courses,
    labClasses,
    pendingRequests,
    EquipmentRequests,
    pendingLabRequests,     
    labRequests,
    extensionRequests,
    activeRequests,
    
    // NEW: Equipment units data
    equipmentUnits,
    assignments,
    equipmentSummary,
    
    // Existing loading states
    loadingEquipment,
    loadingCourses,
    loadingLabClasses,
    loadingRequests,
    loadingEquipmentRequests,
    loadingLabRequests,        
    loadingCurrentMonthLabs,
    loadingActiveRequests,
    loadingExtensionRequests,
    
    // NEW: Equipment units loading states
    loadingEquipmentUnits,
    loadingAssignments,
    loadingSummary,
    
    // Enhanced filters and view
    filters,
    viewMode,
    selectedItems,
    
    // Messages
    error,
    successMessage,
    
    // Existing functions
    loadEquipment,
    loadCourses,
    loadEquipmentRequests,
    loadLabClasses,
    loadPendingRequests,
    loadPendingLabRequests,        
    loadCurrentMonthLabRequests, 
    loadExtensionRequests,
    loadActiveRequests,
    updateEquipmentRequestInState,
    
    // NEW: Equipment units functions
    loadEquipmentUnits,
    loadAssignments,
    loadEquipmentSummary,
    addEquipmentUnitToState,
    addAssignmentToState,
    
    // Enhanced common functions
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
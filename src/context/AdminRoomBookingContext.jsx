import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAllBookingsAdmin,
  getBookingsByDateRangeAdmin,
  getPendingBookingsAdmin,
  getBookingsWithCapacityWarnings,
  getEquipmentUsageAnalytics,
  getCapacityUtilizationAnalytics,
  getApprovalStatistics
} from '../api/adminroombooking';

const AdminRoomBookingContext = createContext();

export const useAdminRoomBooking = () => {
  const context = useContext(AdminRoomBookingContext);
  if (!context) {
    throw new Error('useAdminRoomBooking must be used within an AdminRoomBookingProvider');
  }
  return context;
};

export const AdminRoomBookingProvider = ({ children }) => {
  // Booking management state
  const [allBookings, setAllBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [capacityWarningBookings, setCapacityWarningBookings] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);
  
  // Loading states
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingCapacityWarnings, setLoadingCapacityWarnings] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // Analytics state
  const [equipmentAnalytics, setEquipmentAnalytics] = useState(null);
  const [capacityAnalytics, setCapacityAnalytics] = useState(null);
  const [approvalStats, setApprovalStats] = useState(null);
  
  // Filter and view state
  const [filters, setFilters] = useState({
    status: '',
    building: '',
    dateRange: { start: '', end: '' },
    roomCategory: '',
    hasCapacityWarning: false,
    hasEquipmentRequests: false
  });
  
  const [viewMode, setViewMode] = useState('all'); // all, pending, warnings
  const [sortBy, setSortBy] = useState('startTime');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Error handling
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ========== BOOKING DATA FUNCTIONS ==========

  const loadAllBookings = async (dateRange = null) => {
    setLoadingBookings(true);
    setError(null);
    
    try {
      let bookingsData;
      if (dateRange?.start && dateRange?.end) {
        bookingsData = await getBookingsByDateRangeAdmin(dateRange.start, dateRange.end);
      } else {
        bookingsData = await getAllBookingsAdmin();
      }
      
      setAllBookings(bookingsData);
    } catch (err) {
      console.error('Error loading all bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadPendingBookings = async () => {
    setLoadingPending(true);
    setError(null);
    
    try {
      const pendingData = await getPendingBookingsAdmin();
      setPendingBookings(pendingData);
    } catch (err) {
      console.error('Error loading pending bookings:', err);
      setError('Failed to load pending bookings');
    } finally {
      setLoadingPending(false);
    }
  };

  const loadCapacityWarnings = async () => {
    setLoadingCapacityWarnings(true);
    setError(null);
    
    try {
      const warningsData = await getBookingsWithCapacityWarnings();
      setCapacityWarningBookings(warningsData);
    } catch (err) {
      console.error('Error loading capacity warnings:', err);
      setError('Failed to load capacity warnings');
    } finally {
      setLoadingCapacityWarnings(false);
    }
  };

  const loadAnalytics = async (dateRange = null) => {
    setLoadingAnalytics(true);
    setError(null);
    
    try {
      const [equipmentData, capacityData, approvalData] = await Promise.all([
        getEquipmentUsageAnalytics(dateRange?.start, dateRange?.end),
        getCapacityUtilizationAnalytics(dateRange?.start, dateRange?.end),
        getApprovalStatistics(dateRange?.start, dateRange?.end)
      ]);
      
      setEquipmentAnalytics(equipmentData);
      setCapacityAnalytics(capacityData);
      setApprovalStats(approvalData);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // ========== FILTER AND SORT FUNCTIONS ==========

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      building: '',
      dateRange: { start: '', end: '' },
      roomCategory: '',
      hasCapacityWarning: false,
      hasEquipmentRequests: false
    });
  };

  const getFilteredBookings = () => {
    let bookingsToFilter;
    
    switch (viewMode) {
      case 'pending':
        bookingsToFilter = pendingBookings;
        break;
      case 'warnings':
        bookingsToFilter = capacityWarningBookings;
        break;
      default:
        bookingsToFilter = allBookings;
    }
    
    let filtered = [...bookingsToFilter];
    
    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }
    
    if (filters.building) {
      filtered = filtered.filter(booking => booking.building === filters.building);
    }
    
    if (filters.roomCategory) {
      filtered = filtered.filter(booking => booking.roomCategory === filters.roomCategory);
    }
    
    if (filters.hasCapacityWarning) {
      filtered = filtered.filter(booking => booking.hasCapacityWarning);
    }
    
    if (filters.hasEquipmentRequests) {
      filtered = filtered.filter(booking => booking.hasEquipmentRequests);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle date sorting
      if (sortBy.includes('Time') || sortBy.includes('At')) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };

  // ========== SELECTION FUNCTIONS ==========

  const toggleBookingSelection = (bookingId) => {
    setSelectedBookings(prev => {
      if (prev.includes(bookingId)) {
        return prev.filter(id => id !== bookingId);
      } else {
        return [...prev, bookingId];
      }
    });
  };

  const selectAllBookings = () => {
    const filteredBookings = getFilteredBookings();
    setSelectedBookings(filteredBookings.map(booking => booking.id));
  };

  const clearSelection = () => {
    setSelectedBookings([]);
  };

  const isBookingSelected = (bookingId) => {
    return selectedBookings.includes(bookingId);
  };

  // ========== UPDATE FUNCTIONS ==========

  const updateBookingInState = (bookingId, updates) => {
    const updateBookingList = (bookings) =>
      bookings.map(booking =>
        booking.id === bookingId ? { ...booking, ...updates } : booking
      );
    
    setAllBookings(updateBookingList);
    setPendingBookings(updateBookingList);
    setCapacityWarningBookings(updateBookingList);
  };

  const removeBookingFromState = (bookingId) => {
    const filterBookingList = (bookings) =>
      bookings.filter(booking => booking.id !== bookingId);
    
    setAllBookings(filterBookingList);
    setPendingBookings(filterBookingList);
    setCapacityWarningBookings(filterBookingList);
    setSelectedBookings(prev => prev.filter(id => id !== bookingId));
  };

  // ========== STATISTICS FUNCTIONS ==========

  const getBookingStats = () => {
    const stats = {
      total: allBookings.length,
      pending: pendingBookings.length,
      withCapacityWarnings: capacityWarningBookings.length,
      withEquipmentRequests: allBookings.filter(b => b.hasEquipmentRequests).length,
      confirmed: allBookings.filter(b => b.status === 'CONFIRMED').length,
      rejected: allBookings.filter(b => b.status === 'REJECTED').length,
      cancelled: allBookings.filter(b => b.status === 'CANCELLED').length
    };
    
    return stats;
  };

  const getQuickStats = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return {
      pendingApprovals: pendingBookings.length,
      todayBookings: allBookings.filter(booking => 
        booking.startTime.startsWith(todayStr)
      ).length,
      capacityWarnings: capacityWarningBookings.length,
      equipmentRequests: allBookings.filter(b => b.hasEquipmentRequests).length
    };
  };

  // ========== MESSAGE FUNCTIONS ==========

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

  // ========== REFRESH FUNCTIONS ==========

  const refreshCurrentView = async () => {
    switch (viewMode) {
      case 'pending':
        await loadPendingBookings();
        break;
      case 'warnings':
        await loadCapacityWarnings();
        break;
      default:
        await loadAllBookings(filters.dateRange);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      loadAllBookings(),
      loadPendingBookings(),
      loadCapacityWarnings(),
      loadAnalytics()
    ]);
  };

  // ========== CONTEXT VALUE ==========

  const contextValue = {
    // Data
    allBookings,
    pendingBookings,
    capacityWarningBookings,
    selectedBookings,
    
    // Analytics
    equipmentAnalytics,
    capacityAnalytics,
    approvalStats,
    
    // State
    loadingBookings,
    loadingPending,
    loadingCapacityWarnings,
    loadingAnalytics,
    error,
    successMessage,
    
    // Filters and view
    filters,
    viewMode,
    sortBy,
    sortOrder,
    
    // Functions
    loadAllBookings,
    loadPendingBookings,
    loadCapacityWarnings,
    loadAnalytics,
    
    // Filtering and sorting
    updateFilters,
    clearFilters,
    getFilteredBookings,
    setViewMode,
    setSortBy,
    setSortOrder,
    
    // Selection
    toggleBookingSelection,
    selectAllBookings,
    clearSelection,
    isBookingSelected,
    
    // Updates
    updateBookingInState,
    removeBookingFromState,
    
    // Statistics
    getBookingStats,
    getQuickStats,
    
    // Messages
    showSuccess,
    showError,
    clearMessages,
    
    // Refresh
    refreshCurrentView,
    refreshAll
  };

  return (
    <AdminRoomBookingContext.Provider value={contextValue}>
      {children}
    </AdminRoomBookingContext.Provider>
  );
};
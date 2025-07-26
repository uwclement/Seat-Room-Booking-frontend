import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getCurrentAdminBookings,
  getBookingsByDate,
  getBookingsInRange,
  getBookingsByUser,
  getBookingsBySeat,
  manualCheckInBooking,
  manualCancelBooking,
  bulkCancelBookings,
  getBookingsEligibleForCheckIn,
  getBookingsEligibleForCancellation
} from '../api/admin';

export const AdminSeatBookingContext = createContext();

export const AdminSeatBookingProvider = ({ children }) => {
  const { isAuthenticated, isAdmin, isLibrarian, getUserLocation } = useAuth();
  
  // State for booking management
  const [bookings, setBookings] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

   const getUserEffectiveLocation = useCallback(() => {
      return isLibrarian() ? getUserLocation() : null;
    }, [isLibrarian, getUserLocation]);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    user: '',
    seat: '',
    date: '',
    startDate: '',
    endDate: ''
  });

  // View mode state
  const [viewMode, setViewMode] = useState('current'); // current, date, range, user, seat

  // Fetch current bookings
  const fetchCurrentBookings = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin() && !isLibrarian ()) return;
    
    setLoading(true);
    setError('');
    try {
      const userLocation = getUserEffectiveLocation();
      const data = await getCurrentAdminBookings();
      setBookings(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch current bookings. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, isLibrarian, getUserEffectiveLocation]);

  // Fetch bookings by date
  const fetchBookingsByDate = useCallback(async (date) => {
    if (!isAuthenticated() || !isAdmin () && !isLibrarian()) return;
    
    setLoading(true);
    setError('');
    try {
      const userLocation = getUserEffectiveLocation();
      const data = await getBookingsByDate(date);
      setBookings(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch bookings for selected date.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, isLibrarian, getUserEffectiveLocation]);

  // Fetch bookings in date range
  const fetchBookingsInRange = useCallback(async (startDate, endDate) => {
    if (!isAuthenticated() || !isAdmin() && !isLibrarian ()) return;
    
    setLoading(true);
    setError('');
    try {
      const userLocation = getUserEffectiveLocation();
      const data = await getBookingsInRange(startDate, endDate);
      setBookings(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch bookings for selected range.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, isLibrarian, getUserEffectiveLocation]);

  // Handle booking selection
  const toggleBookingSelection = (bookingId) => {
    setSelectedBookings(prevSelected => {
      if (prevSelected.includes(bookingId)) {
        return prevSelected.filter(id => id !== bookingId);
      } else {
        return [...prevSelected, bookingId];
      }
    });
  };

  // Select all filtered bookings
  const selectAllBookings = () => {
    const filteredBookings = getFilteredBookings();
    setSelectedBookings(filteredBookings.map(booking => booking.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedBookings([]);
  };

  // Apply filters to bookings
  const getFilteredBookings = () => {
    return bookings.filter(booking => {
      let matchesStatus = true;
      let matchesUser = true;
      let matchesSeat = true;

      if (filters.status) {
        matchesStatus = booking.status.toLowerCase() === filters.status.toLowerCase();
      }

      if (filters.user) {
        matchesUser = booking.userName.toLowerCase().includes(filters.user.toLowerCase()) ||
                     booking.userId.toString().includes(filters.user);
      }

      if (filters.seat) {
        matchesSeat = booking.seatNumber.toLowerCase().includes(filters.seat.toLowerCase()) ||
                     booking.seatId.toString().includes(filters.seat);
      }

      return matchesStatus && matchesUser && matchesSeat;
    });
  };

  // Manual check-in
  const handleManualCheckIn = async (bookingId) => {
    setLoading(true);
    setError('');
    try {
      await manualCheckInBooking(bookingId);
      setSuccess('User checked in successfully');
      await refreshCurrentData();
    } catch (err) {
      setError('Failed to check in user. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Manual cancellation
  const handleManualCancel = async (bookingId, reason = '') => {
    setLoading(true);
    setError('');
    try {
      await manualCancelBooking(bookingId, reason);
      setSuccess('Booking cancelled successfully');
      await refreshCurrentData();
    } catch (err) {
      setError('Failed to cancel booking. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Bulk cancellation
  const handleBulkCancel = async (reason = '') => {
    if (selectedBookings.length === 0) {
      setError('No bookings selected for cancellation');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await bulkCancelBookings(selectedBookings, reason);
      setSuccess(`Successfully cancelled ${response.successCount} booking(s)`);
      if (response.errorCount > 0) {
        setError(`Failed to cancel ${response.errorCount} booking(s)`);
      }
      await refreshCurrentData();
      clearSelection();
    } catch (err) {
      setError('Failed to perform bulk cancellation. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Refresh current data based on view mode
  const refreshCurrentData = async () => {
    switch (viewMode) {
      case 'current':
        await fetchCurrentBookings();
        break;
      case 'date':
        if (filters.date) {
          await fetchBookingsByDate(filters.date);
        }
        break;
      case 'range':
        if (filters.startDate && filters.endDate) {
          await fetchBookingsInRange(filters.startDate, filters.endDate);
        }
        break;
      default:
        await fetchCurrentBookings();
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: '',
      user: '',
      seat: '',
      date: '',
      startDate: '',
      endDate: ''
    });
  };

  // Get booking statistics
  const getBookingStats = () => {
    const filteredBookings = getFilteredBookings();
    return {
      total: filteredBookings.length,
      reserved: filteredBookings.filter(b => b.status === 'RESERVED').length,
      checkedIn: filteredBookings.filter(b => b.status === 'CHECKED_IN').length,
      cancelled: filteredBookings.filter(b => b.status === 'CANCELLED').length,
      noShow: filteredBookings.filter(b => b.status === 'NO_SHOW').length,
      completed: filteredBookings.filter(b => b.status === 'COMPLETED').length
    };
  };

  // Load current bookings on mount
  useEffect(() => {
    if (isAuthenticated() && isAdmin () || isLibrarian()) {
      fetchCurrentBookings();
    }
  }, [isAuthenticated, isAdmin, fetchCurrentBookings]);

  const contextValue = {
    // State
    bookings,
    selectedBookings,
    loading,
    error,
    success,
    filters,
    viewMode,
    
    // Functions
    fetchCurrentBookings,
    fetchBookingsByDate,
    fetchBookingsInRange,
    toggleBookingSelection,
    selectAllBookings,
    clearSelection,
    getFilteredBookings,
    handleManualCheckIn,
    handleManualCancel,
    handleBulkCancel,
    refreshCurrentData,
    updateFilters,
    clearFilters,
    getBookingStats,
    setViewMode,
    setError,
    setSuccess,
    userLocation: getUserEffectiveLocation(),
  };

  return (
    <AdminSeatBookingContext.Provider value={contextValue}>
      {children}
    </AdminSeatBookingContext.Provider>
  );
};
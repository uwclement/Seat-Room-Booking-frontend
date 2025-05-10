import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth'; // Import auth hook
import {
  getAllAdminSeats,
  bulkUpdateSeats,
  toggleDesktop,
  disableSeatsForMaintenance,
  enableSeats,
  getDisabledSeats
} from '../api/admin';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth(); // Get auth state
  
  // State for seat management
  const [seats, setSeats] = useState([]);
  const [disabledSeats, setDisabledSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    zone: '',
    isDesktop: '',
    status: ''
  });

  // State for admin actions
  const [adminLogs, setAdminLogs] = useState([]);
  const [success, setSuccess] = useState('');

  // Fetch all seats
  const fetchSeats = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return; // Skip if not authenticated admin
    
    setLoading(true);
    setError('');
    try {
      const data = await getAllAdminSeats();
      setSeats(data);
    } catch (err) {
      // Only set error if it's not a 401
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch seats. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch disabled seats
  const fetchDisabledSeats = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return; // Skip if not authenticated admin
    
    setLoading(true);
    try {
      const data = await getDisabledSeats();
      setDisabledSeats(data);
    } catch (err) {
      // Only set error if it's not a 401
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch disabled seats.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Handle seat selection
  const toggleSeatSelection = (seatId) => {
    setSelectedSeats(prevSelected => {
      if (prevSelected.includes(seatId)) {
        return prevSelected.filter(id => id !== seatId);
      } else {
        return [...prevSelected, seatId];
      }
    });
  };

  // Select all seats (optionally filtered)
  const selectAllSeats = () => {
    const filteredSeats = applyFilters(seats);
    setSelectedSeats(filteredSeats.map(seat => seat.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedSeats([]);
  };

  // Apply filters to seats
  const applyFilters = (seatsToFilter) => {
    return seatsToFilter.filter(seat => {
      let matchesZone = true;
      let matchesDesktop = true;
      let matchesStatus = true;

      if (filters.zone) {
        matchesZone = seat.zone === filters.zone;
      }

      if (filters.isDesktop !== '') {
        matchesDesktop = seat.isDesktop === (filters.isDesktop === 'true');
      }

      if (filters.status) {
        if (filters.status === 'disabled') {
          matchesStatus = disabledSeats.some(ds => ds.id === seat.id);
        } else if (filters.status === 'enabled') {
          matchesStatus = !disabledSeats.some(ds => ds.id === seat.id);
        }
      }

      return matchesZone && matchesDesktop && matchesStatus;
    });
  };

  // Bulk update seats
  const handleBulkUpdate = async (propertyUpdates) => {
    setLoading(true);
    setError('');
    try {
      await bulkUpdateSeats({
        seatIds: selectedSeats,
        updates: propertyUpdates
      });
      setSuccess('Seats updated successfully');
      await fetchSeats();
      clearSelection();
    } catch (err) {
      setError('Failed to update seats. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Toggle desktop property
  const handleToggleDesktop = async (seatId) => {
    setLoading(true);
    setError('');
    try {
      await toggleDesktop(seatId);
      setSuccess('Seat updated successfully');
      await fetchSeats();
    } catch (err) {
      setError('Failed to toggle desktop property. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Disable seats for maintenance
  const handleDisableSeats = async (reason, endDate) => {
    setLoading(true);
    setError('');
    try {
      await disableSeatsForMaintenance(selectedSeats, reason, endDate);
      setSuccess('Seats disabled for maintenance');
      await fetchSeats();
      await fetchDisabledSeats();
      clearSelection();
    } catch (err) {
      setError('Failed to disable seats. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Enable seats after maintenance
  const handleEnableSeats = async () => {
  setLoading(true);
  setError('');
  setSuccess('');

  if (!selectedSeats || selectedSeats.length === 0) {
    setError('No seats selected to enable.');
    setLoading(false);
    return;
  }

  try {
    await enableSeats(selectedSeats);
    setSuccess('Seats enabled successfully');
    await fetchSeats();
    await fetchDisabledSeats();
    clearSelection();
  } catch (err) {
    setError('Failed to enable seats. Please try again later.');
    console.error(err);
  } finally {
    setLoading(false);
    setTimeout(() => setSuccess(''), 3000);
  }
};


  // Load seats when authentication status changes
  useEffect(() => {
    if (isAuthenticated() && isAdmin()) {
      fetchSeats();
      fetchDisabledSeats();
    }
  }, [isAuthenticated, isAdmin, fetchSeats, fetchDisabledSeats]);

  const contextValue = {
    // State
    seats,
    disabledSeats,
    selectedSeats,
    loading,
    error,
    filters,
    success,
    adminLogs,
    
    // Functions
    fetchSeats,
    fetchDisabledSeats,
    toggleSeatSelection,
    selectAllSeats,
    clearSelection,
    applyFilters,
    handleBulkUpdate,
    handleToggleDesktop,
    handleDisableSeats,
    handleEnableSeats,
    setFilters,
    setError
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};
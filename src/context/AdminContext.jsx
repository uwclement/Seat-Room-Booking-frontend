import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import {
  getAllAdminSeats,
  bulkUpdateSeats,
  toggleDesktop,
  disableSeatsForMaintenance,
  bulkToggleDesktop,
  enableSeats,
  getDisabledSeats,
  createSeat,
  bulkCreateSeats,
  updateSeat,
  deleteSeat
} from '../api/admin';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { isAuthenticated, isAdmin, isLibrarian, getUserLocation } = useAuth(); // Get auth state
  
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

   const getUserEffectiveLocation = useCallback(() => {
    return isLibrarian() ? getUserLocation() : null;
  }, [isLibrarian, getUserLocation]);

  // Fetch all seats
  const fetchSeats = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin() && !isLibrarian() ) return; // Skip if not authenticated admin
    
    setLoading(true);
    setError('');
    try {
      const userLocation = getUserEffectiveLocation();
      const data = await getAllAdminSeats();
      setSeats(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch seats. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, isLibrarian, getUserEffectiveLocation]);

  // Fetch disabled seats
  const fetchDisabledSeats = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin() && !isLibrarian() ) return; // Skip if not authenticated admin

    
    setLoading(true);
    try {
      const userLocation = getUserEffectiveLocation();
      const data = await getDisabledSeats();
      setDisabledSeats(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch disabled seats.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, isLibrarian, getUserEffectiveLocation ]);

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

  // create seats 
   const handleCreateSeat = async (seatData) => {
    setLoading(true);
    setError('');
    try {
      // Add user's location if librarian
      if (isLibrarian()) {
        seatData.location = getUserLocation();
      }
      
      await createSeat(seatData);
      setSuccess('Seat created successfully');
      await fetchSeats();
    } catch (err) {
      setError('Failed to create seat: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleBulkCreateSeats = async (bulkCreationData) => {
    setLoading(true);
    setError('');
    try {
      // Add user's location if librarian
      if (isLibrarian()) {
        bulkCreationData.location = getUserLocation();
      }
      
      const createdSeats = await bulkCreateSeats(bulkCreationData);
      setSuccess(`Successfully created ${createdSeats.length} seats`);
      await fetchSeats();
    } catch (err) {
      setError('Failed to create seats: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Bulk update seats
  const handleUpdateSeat = async (seatId, seatData) => {
    setLoading(true);
    setError('');
    try {
      await updateSeat(seatId, seatData);
      setSuccess('Seat updated successfully');
      await fetchSeats();
    } catch (err) {
      setError('Failed to update seat: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleBulkUpdate = async (propertyUpdates) => {
    setLoading(true);
    setError('');
    try {
      await bulkUpdateSeats({
        seatIds: selectedSeats,
        ...propertyUpdates
      });
      setSuccess('Seats updated successfully');
      await fetchSeats();
      clearSelection();
    } catch (err) {
      setError('Failed to update seats: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
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
  
  // bulk desktop toggle
  const handleBulkToggleDesktop = async () => {
  setLoading(true);
  setError('');
  try {
    await bulkToggleDesktop(selectedSeats);
    setSuccess('Desktop properties toggled successfully');
    await fetchSeats();
    clearSelection();
  } catch (err) {
    setError('Failed to toggle desktop properties. Please try again later.');
    console.error(err);
  } finally {
    setLoading(false);
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

  // delete seat 
  const handleDeleteSeat = async (seatId) => {
    setLoading(true);
    setError('');
    try {
      await deleteSeat(seatId);
      setSuccess('Seat deleted successfully');
      await fetchSeats();
    } catch (err) {
      setError('Failed to delete seat: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };


  // Load seats when authentication status changes
  useEffect(() => {
    if (isAuthenticated() && isAdmin() || isLibrarian()) {
      fetchSeats();
      fetchDisabledSeats();
    }
  }, [isAuthenticated, isAdmin, isLibrarian, fetchSeats, fetchDisabledSeats]);

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
    
    // User info
    isLibrarian: isLibrarian(),
    isAdmin: isAdmin(),
    userLocation: getUserEffectiveLocation(),

    // Functions
    fetchSeats,
    fetchDisabledSeats,
    toggleSeatSelection,
    selectAllSeats,
    clearSelection,
    applyFilters,
    handleBulkUpdate,
    handleToggleDesktop,
    handleBulkToggleDesktop,
    handleDisableSeats,
    handleEnableSeats,
    setFilters,
    setError,
    // create
    handleCreateSeat,
    handleBulkCreateSeats,

    // Update functions
    handleUpdateSeat,
    handleBulkUpdate,
    handleToggleDesktop,
    handleBulkToggleDesktop,
    handleDisableSeats,
    handleEnableSeats,

    // Delete functions
    handleDeleteSeat,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};
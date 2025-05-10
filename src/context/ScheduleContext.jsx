import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth'; // Import auth hook
import {
  getLibrarySchedule,
  updateDaySchedule,
  getClosureExceptions,
  createClosureException,
  deleteClosureException,
  createRecurringClosures,
  setScheduleMessage,
  getScheduleMessage,
  getCurrentLibraryStatus
} from '../api/schedule';

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth(); // Get auth state

  // State for schedule
  const [regularSchedule, setRegularSchedule] = useState([]);
  const [closureExceptions, setClosureExceptions] = useState([]);
  const [scheduleMessage, setMessage] = useState('');
  const [libraryStatus, setLibraryStatus] = useState({ 
    isOpen: true, 
    message: '', 
    nextChangeTime: null 
  });
  
  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch regular schedule
  const fetchRegularSchedule = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return; // Skip if not authenticated admin
    
    setLoading(true);
    setError('');
    try {
      const data = await getLibrarySchedule();
      setRegularSchedule(data);
    } catch (err) {
      // Only set error if it's not a 401 (which is expected when not logged in)
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch library schedule. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch closure exceptions
  const fetchClosureExceptions = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return; // Skip if not authenticated admin
    
    setLoading(true);
    setError('');
    try {
      const data = await getClosureExceptions();
      setClosureExceptions(data);
    } catch (err) {
      // Only set error if it's not a 401
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch closure exceptions. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch schedule message
  const fetchScheduleMessage = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return; // Skip if not authenticated admin
    
    try {
      const data = await getScheduleMessage();
      setMessage(data.message || '');
    } catch (err) {
      // No need to set error for this one, as it's not critical
      if (err.response && err.response.status !== 401) {
        console.error('Failed to fetch schedule message:', err);
      }
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch current library status
  const fetchLibraryStatus = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return; // Skip if not authenticated admin
    
    try {
      const data = await getCurrentLibraryStatus();
      setLibraryStatus(data);
    } catch (err) {
      // No need to set error for this one, as it's not critical
      if (err.response && err.response.status !== 401) {
        console.error('Failed to fetch library status:', err);
      }
    }
  }, [isAuthenticated, isAdmin]);

  // Update a day's schedule
  const handleUpdateDaySchedule = async (id, scheduleData) => {
    setLoading(true);
    setError('');
    try {
      await updateDaySchedule(id, scheduleData);
      setSuccess('Schedule updated successfully');
      await fetchRegularSchedule();
    } catch (err) {
      setError('Failed to update schedule. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Create a closure exception
  const handleCreateClosureException = async (closureData) => {
    setLoading(true);
    setError('');
    try {
      await createClosureException(closureData);
      setSuccess('Closure created successfully');
      await fetchClosureExceptions();
      await fetchLibraryStatus();
    } catch (err) {
      setError('Failed to create closure. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Delete a closure exception
  const handleDeleteClosureException = async (id) => {
    setLoading(true);
    setError('');
    try {
      await deleteClosureException(id);
      setSuccess('Closure deleted successfully');
      await fetchClosureExceptions();
      await fetchLibraryStatus();
    } catch (err) {
      setError('Failed to delete closure. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Create recurring closures
  const handleCreateRecurringClosures = async (recurringData) => {
    setLoading(true);
    setError('');
    try {
      await createRecurringClosures(recurringData);
      setSuccess('Recurring closures created successfully');
      await fetchClosureExceptions();
      await fetchLibraryStatus();
    } catch (err) {
      setError('Failed to create recurring closures. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Set schedule message
  const handleSetScheduleMessage = async (message) => {
    setLoading(true);
    setError('');
    try {
      await setScheduleMessage(message);
      setSuccess('Message set successfully');
      await fetchScheduleMessage();
    } catch (err) {
      setError('Failed to set message. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Load schedule data when authentication status changes
  useEffect(() => {
    if (isAuthenticated() && isAdmin()) {
      fetchRegularSchedule();
      fetchClosureExceptions();
      fetchScheduleMessage();
      fetchLibraryStatus();

      // Set up interval to refresh library status every minute
      const statusInterval = setInterval(fetchLibraryStatus, 60000);
      
      // Clean up interval on unmount
      return () => clearInterval(statusInterval);
    }
  }, [
    isAuthenticated, 
    isAdmin, 
    fetchRegularSchedule, 
    fetchClosureExceptions, 
    fetchScheduleMessage, 
    fetchLibraryStatus
  ]);

  const contextValue = {
    // State
    regularSchedule,
    closureExceptions,
    scheduleMessage,
    libraryStatus,
    loading,
    error,
    success,
    
    // Functions
    fetchRegularSchedule,
    fetchClosureExceptions,
    fetchScheduleMessage,
    fetchLibraryStatus,
    handleUpdateDaySchedule,
    handleCreateClosureException,
    handleDeleteClosureException,
    handleCreateRecurringClosures,
    handleSetScheduleMessage,
    setError
  };

  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  );
};
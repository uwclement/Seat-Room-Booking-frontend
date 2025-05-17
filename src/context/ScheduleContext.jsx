import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getAllSchedules,
  updateSchedule,
  setDayClosed,
  setSpecialClosingTime,
  removeSpecialClosingTime,
  getLibraryStatus,
  getAllClosureExceptions,
  getClosureExceptionsInRange,
  createClosureException,
  updateClosureException,
  deleteClosureException,
  createRecurringClosures,
  setScheduleMessage,
  getScheduleMessage
} from '../api/schedule';

import {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../api/announcements';

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  // State for schedules
  const [schedules, setSchedules] = useState([]);
  const [closureExceptions, setClosureExceptions] = useState([]);
  const [libraryStatus, setLibraryStatus] = useState(null);
  const [scheduleMessage, setScheduleMessageState] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all schedules
  const fetchSchedules = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await getAllSchedules();
      setSchedules(data);
    } catch (err) {
      // Only set error if it's not a 401
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch schedules. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch closure exceptions
  const fetchClosureExceptions = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await getAllClosureExceptions();
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

  // Fetch library status
  const fetchLibraryStatus = useCallback(async () => {
    if (!isAuthenticated() ) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await getLibraryStatus();
      setLibraryStatus(data);
    } catch (err) {
      // Only set error if it's not a 401
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch library status. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated ]);

  // Fetch schedule message
  const fetchScheduleMessage = useCallback(async () => {
    if (!isAuthenticated() ) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await getScheduleMessage();
      setScheduleMessageState(response.message);
    } catch (err) {
      // Only set error if it's not a 401
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch schedule message. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated ]);

  // Fetch announcements
  const fetchAnnouncements = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await getAllAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      // Only set error if it's not a 401
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch announcements. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Update a schedule
  const handleUpdateSchedule = async (id, scheduleData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateSchedule(id, scheduleData);
      await fetchSchedules();
      await fetchLibraryStatus();
      setSuccess('Schedule updated successfully');
    } catch (err) {
      setError('Failed to update schedule. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Mark a day as closed
  const handleSetDayClosed = async (id, message) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await setDayClosed(id, message);
      await fetchSchedules();
      await fetchLibraryStatus();
      setSuccess('Day marked as closed successfully');
    } catch (err) {
      setError('Failed to mark day as closed. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Set special closing time
  const handleSetSpecialClosingTime = async (id, specialCloseTime, message) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await setSpecialClosingTime(id, specialCloseTime, message);
      await fetchSchedules();
      await fetchLibraryStatus();
      setSuccess('Special closing time set successfully');
    } catch (err) {
      setError('Failed to set special closing time. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Remove special closing time
  const handleRemoveSpecialClosingTime = async (id) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await removeSpecialClosingTime(id);
      await fetchSchedules();
      await fetchLibraryStatus();
      setSuccess('Special closing time removed successfully');
    } catch (err) {
      setError('Failed to remove special closing time. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Create a new closure exception
  const handleCreateClosureException = async (exceptionData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createClosureException(exceptionData);
      await fetchClosureExceptions();
      await fetchLibraryStatus();
      setSuccess('Closure exception created successfully');
    } catch (err) {
      setError('Failed to create closure exception. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Create recurring closures
  const handleCreateRecurringClosures = async (recurringClosureData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createRecurringClosures(recurringClosureData);
      await fetchClosureExceptions();
      await fetchLibraryStatus();
      setSuccess('Recurring closures created successfully');
    } catch (err) {
      setError('Failed to create recurring closures. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Set schedule message
  const handleSetScheduleMessage = async (message) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await setScheduleMessage(message);
      setScheduleMessageState(message);
      setSuccess('Schedule message updated successfully');
    } catch (err) {
      setError('Failed to update schedule message. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Create a new announcement
  const handleCreateAnnouncement = async (announcementData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createAnnouncement(announcementData);
      await fetchAnnouncements();
      setSuccess('Announcement created successfully');
    } catch (err) {
      setError('Failed to create announcement. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Load data when authentication status changes
  useEffect(() => {
    if (isAuthenticated() && isAdmin()) {
      fetchSchedules();
      fetchClosureExceptions();
      fetchLibraryStatus();
      fetchScheduleMessage();
      fetchAnnouncements();
    }
  }, [
    isAuthenticated, 
    isAdmin, 
    fetchSchedules, 
    fetchClosureExceptions, 
    fetchLibraryStatus,
    fetchScheduleMessage,
    fetchAnnouncements
  ]);

  // Refresh library status every 5 minutes
  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) return;
    
    const intervalId = setInterval(() => {
      fetchLibraryStatus();
    }, 300000); // 5 minutes
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, isAdmin, fetchLibraryStatus]);

  const contextValue = {
    // State
    schedules,
    closureExceptions,
    libraryStatus,
    scheduleMessage,
    announcements,
    loading,
    error,
    success,
    
    // Functions
    fetchSchedules,
    fetchClosureExceptions,
    fetchLibraryStatus,
    fetchScheduleMessage,
    fetchAnnouncements,
    handleUpdateSchedule,
    handleSetDayClosed,
    handleSetSpecialClosingTime,
    handleRemoveSpecialClosingTime,
    handleCreateClosureException,
    handleCreateRecurringClosures,
    handleSetScheduleMessage,
    handleCreateAnnouncement,
    setError
  };

  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  );
};
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getLibraryStatus,
  getLibraryStatusByLocation,
  // Use public endpoints for students
  getAllPublicSchedules,
  getPublicSchedulesByLocation,
  getAllPublicClosureExceptions,
  getPublicScheduleMessage
} from '../api/schedule';

import {
  getActiveAnnouncements
} from '../api/announcements';

export const PublicScheduleContext = createContext();

export const PublicScheduleProvider = ({ children }) => {
  const { isAuthenticated, isStudent, getUserLocation } = useAuth();

  // State for schedules
  const [schedules, setSchedules] = useState([]);
  const [closureExceptions, setClosureExceptions] = useState([]);
  const [libraryStatus, setLibraryStatus] = useState(null);
  const [scheduleMessage, setScheduleMessageState] = useState('');
  const [Activeannouncements, setActiveAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ULocation state - students can switch locations like admins
  const [selectedLocation, setSelectedLocation] = useState(null); // Start with null to show all locations

  //  Simple location logic - students can switch locations
  const getCurrentLocation = useCallback(() => {
    // Priority: selectedLocation > userLocation > null (show all)
    return selectedLocation || getUserLocation();
  }, [selectedLocation, getUserLocation]);

  //  Fetch ALL schedules for students (like admin behavior)
  const fetchSchedules = useCallback(async () => {
    if (!isAuthenticated() || !isStudent()) return;
    
    setLoading(true);
    setError('');
    try {
      let data;
      
      // CStudents now get all schedules, not just their location
      if (selectedLocation) {
        // If a specific location is selected, get schedules for that location
        data = await getPublicSchedulesByLocation(selectedLocation);
      } else {
        // If no location selected, get ALL schedules from all locations
        data = await getAllPublicSchedules();
      }
      
      setSchedules(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch schedules. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isStudent, selectedLocation]);

  //  Students can fetch schedules for any location
  const fetchSchedulesByLocation = useCallback(async (location) => {
    if (!isAuthenticated() || !isStudent()) return [];
    
    setLoading(true);
    setError('');
    try {
      const data = await getPublicSchedulesByLocation(location);
      return data;
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch schedules for location. Please try again later.');
        console.error(err);
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isStudent]);

  //  Fetch ALL closure exceptions for students
  // const fetchClosureExceptions = useCallback(async () => {
  //   if (!isAuthenticated() || !isStudent()) return;
    
  //   setLoading(true);
  //   setError('');
  //   try {
  //     // Students get ALL closure exceptions from all locations
  //     const data = await getAllPublicClosureExceptions();
  //     setClosureExceptions(data);
  //   } catch (err) {
  //     if (err.response && err.response.status !== 401) {
  //       setError('Failed to fetch closure exceptions. Please try again later.');
  //       console.error(err);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [isAuthenticated, isStudent]);

  // Fetch library status (can be for specific location or general)
  const fetchLibraryStatus = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError('');
    try {
      const currentLocation = getCurrentLocation();
      let data;
      
      if (currentLocation) {
        // Get status for specific location
        data = await getLibraryStatusByLocation(currentLocation);
      } else {
        // Get general library status
        data = await getLibraryStatus();
      }
      
      setLibraryStatus(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch library status. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getCurrentLocation]);

  // Fetch library status for specific location
  const fetchLibraryStatusByLocation = useCallback(async (location) => {
    setLoading(true);
    setError('');
    try {
      const data = await getLibraryStatusByLocation(location);
      return data;
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch library status for location. Please try again later.');
        console.error(err);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch public schedule message
  const fetchScheduleMessage = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError('');
    try {
      // Use public endpoint for schedule message
      const response = await getPublicScheduleMessage();
      setScheduleMessageState(response.message);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch schedule message. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch active announcements (unchanged)
  const fetchActiveAnnouncements = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await getActiveAnnouncements();
      setActiveAnnouncements(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch announcements. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load data when authentication status or location changes
  useEffect(() => {
    if (!isAuthenticated() || !isStudent()) return;

    // Students now get all data like admins do
    fetchLibraryStatus();
    fetchScheduleMessage();
    fetchActiveAnnouncements();
    fetchSchedules();           // Now loads all locations
    // fetchClosureExceptions();   // Now loads all locations
  }, [
    isAuthenticated,
    isStudent,
    selectedLocation, // Refetch when student changes location
    fetchSchedules,
    // fetchClosureExceptions,
    fetchLibraryStatus,
    fetchScheduleMessage,
    fetchActiveAnnouncements
  ]);

  // Refresh library status every 5 minutes
  useEffect(() => {
    if (!isAuthenticated()) return;
    
    const intervalId = setInterval(() => {
      fetchLibraryStatus();
    }, 300000); // 5 minutes
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchLibraryStatus]);

  const contextValue = {
    // State
    schedules,
    closureExceptions,
    libraryStatus,
    scheduleMessage,
    Activeannouncements,
    loading,
    error,
    
    // ULocation context available to students
    selectedLocation,
    setSelectedLocation,
    getCurrentLocation,
    isStudent: isStudent(),
    userLocation: getUserLocation(),
    isAuthenticated: isAuthenticated(),
    
    // Functions - available to students
    fetchSchedules,
    fetchSchedulesByLocation,
    // fetchClosureExceptions,
    fetchLibraryStatus,
    fetchLibraryStatusByLocation,
    fetchScheduleMessage,
    fetchActiveAnnouncements,
    setError
  };

  return (
    <PublicScheduleContext.Provider value={contextValue}>
      {children}
    </PublicScheduleContext.Provider>
  );
};
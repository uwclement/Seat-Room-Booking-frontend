import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAllRooms,
  getMyRoomBookings,
  getRoomCategories,
  getBuildings,
  getJoinableBookings
} from '../api/roomBooking';

const RoomBookingContext = createContext();

export const useRoom = () => {
  const context = useContext(RoomBookingContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};

export const RoomBookProvider = ({ children }) => {
  // Room discovery state
  const [rooms, setRooms] = useState([]);
  const [roomCategories, setRoomCategories] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  
  // User bookings state
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  // Joinable bookings state
  const [joinableBookings, setJoinableBookings] = useState([]);
  const [loadingJoinable, setLoadingJoinable] = useState(false);
  
  // Filter state
  const [roomFilters, setRoomFilters] = useState({
    category: '',
    building: '',
    minCapacity: '',
    maxCapacity: '',
    keyword: ''
  });
  
  // Error state
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadRoomData();
  }, []);

  const loadRoomData = async () => {
    try {
      const [categoriesData, buildingsData] = await Promise.all([
        getRoomCategories(),
        getBuildings()
      ]);
      
      setRoomCategories(categoriesData);
      setBuildings(buildingsData);
    } catch (err) {
      console.error('Error loading room data:', err);
      setError('Failed to load room information');
    }
  };

  // ========== ROOM DISCOVERY FUNCTIONS ==========

  const loadRooms = async (filters = roomFilters) => {
    setLoadingRooms(true);
    setError(null);
    
    try {
      const roomsData = await getAllRooms();
      
      // Apply frontend filters
      let filteredRooms = roomsData;
      
      if (filters.category) {
        filteredRooms = filteredRooms.filter(room => 
          room.category === filters.category
        );
      }
      
      if (filters.building) {
        filteredRooms = filteredRooms.filter(room => 
          room.building === filters.building
        );
      }
      
      if (filters.minCapacity) {
        filteredRooms = filteredRooms.filter(room => 
          room.capacity >= parseInt(filters.minCapacity)
        );
      }
      
      if (filters.maxCapacity) {
        filteredRooms = filteredRooms.filter(room => 
          room.capacity <= parseInt(filters.maxCapacity)
        );
      }
      
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filteredRooms = filteredRooms.filter(room => 
          room.name.toLowerCase().includes(keyword) ||
          room.roomNumber.toLowerCase().includes(keyword) ||
          (room.description && room.description.toLowerCase().includes(keyword))
        );
      }
      
      setRooms(filteredRooms);
    } catch (err) {
      console.error('Error loading rooms:', err);
      setError('Failed to load rooms');
    } finally {
      setLoadingRooms(false);
    }
  };

  const updateRoomFilters = (newFilters) => {
    const updatedFilters = { ...roomFilters, ...newFilters };
    setRoomFilters(updatedFilters);
    loadRooms(updatedFilters);
  };

  const clearRoomFilters = () => {
    const clearedFilters = {
      category: '',
      building: '',
      minCapacity: '',
      maxCapacity: '',
      keyword: ''
    };
    setRoomFilters(clearedFilters);
    loadRooms(clearedFilters);
  };

  // ========== BOOKING MANAGEMENT FUNCTIONS ==========

  const loadMyBookings = async () => {
    setLoadingBookings(true);
    setError(null);
    
    try {
      const bookingsData = await getMyRoomBookings();
      setMyBookings(bookingsData);
    } catch (err) {
      console.error('Error loading my bookings:', err);
      setError('Failed to load your bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const addBooking = (newBooking) => {
    setMyBookings(prev => [newBooking, ...prev]);
  };

  const updateBooking = (bookingId, updatedBooking) => {
    setMyBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId ? { ...booking, ...updatedBooking } : booking
      )
    );
  };

  const removeBooking = (bookingId) => {
    setMyBookings(prev => prev.filter(booking => booking.id !== bookingId));
  };

  // ========== JOINABLE BOOKINGS FUNCTIONS ==========

  const loadJoinableBookings = async () => {
    setLoadingJoinable(true);
    setError(null);
    
    try {
      const joinableData = await getJoinableBookings();
      setJoinableBookings(joinableData);
    } catch (err) {
      console.error('Error loading joinable bookings:', err);
      setError('Failed to load joinable bookings');
    } finally {
      setLoadingJoinable(false);
    }
  };

  // ========== UTILITY FUNCTIONS ==========

  const getRoomById = (roomId) => {
    return rooms.find(room => room.id === parseInt(roomId));
  };

  const getBookingById = (bookingId) => {
    return myBookings.find(booking => booking.id === parseInt(bookingId));
  };

  const clearError = () => {
    setError(null);
  };

  // ========== STATS AND ANALYTICS ==========

  const getBookingStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      total: myBookings.length,
      upcoming: myBookings.filter(booking => 
        new Date(booking.startTime) > now && 
        ['PENDING', 'CONFIRMED'].includes(booking.status)
      ).length,
      today: myBookings.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        return bookingDate >= today && 
               bookingDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      }).length,
      pending: myBookings.filter(booking => booking.status === 'PENDING').length,
      confirmed: myBookings.filter(booking => booking.status === 'CONFIRMED').length
    };
  };

  const contextValue = {
    // Room discovery
    rooms,
    roomCategories,
    buildings,
    roomFilters,
    loadingRooms,
    loadRooms,
    updateRoomFilters,
    clearRoomFilters,
    
    // User bookings
    myBookings,
    loadingBookings,
    loadMyBookings,
    addBooking,
    updateBooking,
    removeBooking,
    
    // Joinable bookings
    joinableBookings,
    loadingJoinable,
    loadJoinableBookings,
    
    // Utilities
    getRoomById,
    getBookingById,
    getBookingStats,
    
    // Error handling
    error,
    clearError
  };

  return (
    <RoomBookingContext.Provider value={contextValue}>
      {children}
    </RoomBookingContext.Provider>
  );
};
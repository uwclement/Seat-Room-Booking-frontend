import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../context/RoomBookingContext';
import { getRoomAvailability } from '../../api/roomBooking';
// import './RoomBrowser.css';

const RoomBrowser = () => {
  const navigate = useNavigate();
  const {
    rooms,
    roomCategories,
    buildings,
    roomFilters,
    loadingRooms,
    loadRooms,
    updateRoomFilters,
    clearRoomFilters,
    error,
    clearError
  } = useRoom();

  const [roomAvailability, setRoomAvailability] = useState({});
  const [loadingAvailability, setLoadingAvailability] = useState({});

  useEffect(() => {
    loadRooms();
  }, []);

  // Load availability for visible rooms
  useEffect(() => {
    if (rooms.length > 0) {
      rooms.slice(0, 6).forEach(room => {
        loadRoomAvailability(room.id);
      });
    }
  }, [rooms]);

  const loadRoomAvailability = async (roomId) => {
    if (roomAvailability[roomId] || loadingAvailability[roomId]) return;
    
    setLoadingAvailability(prev => ({ ...prev, [roomId]: true }));
    
    try {
      const availability = await getRoomAvailability(roomId);
      setRoomAvailability(prev => ({ 
        ...prev, 
        [roomId]: availability 
      }));
    } catch (err) {
      console.error(`Error loading availability for room ${roomId}:`, err);
    } finally {
      setLoadingAvailability(prev => ({ ...prev, [roomId]: false }));
    }
  };

  const handleFilterChange = (filterName, value) => {
    updateRoomFilters({ [filterName]: value });
  };

  const handleBookRoom = (roomId) => {
    navigate(`/book-room/${roomId}`);
  };

  const handleQuickBook = async (roomId) => {
    try {
      // For now, redirect to booking page - you can implement quick booking logic later
      navigate(`/book-room/${roomId}?quick=true`);
    } catch (err) {
      console.error('Quick booking failed:', err);
    }
  };

  const getRoomStatusInfo = (room) => {
    const availability = roomAvailability[room.id];
    
    if (!availability) {
      return { status: 'unknown', message: 'Loading...', color: '#6c757d' };
    }

    if (availability.currentlyOccupied) {
      return {
        status: 'occupied',
        message: `Occupied until ${new Date(availability.occupiedUntil).toLocaleTimeString()}`,
        color: '#dc3545'
      };
    }

    if (availability.availableSlots && availability.availableSlots.length > 0) {
      return {
        status: 'available',
        message: 'Available now',
        color: '#28a745'
      };
    }

    return {
      status: 'busy',
      message: 'Busy today',
      color: '#ffc107'
    };
  };

  if (error) {
    return (
      <div className="room-browser-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={clearError} className="btn btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-browser-container">
      {/* Header */}
      <div className="room-browser-header">
        <h1>Browse Rooms</h1>
        <p>Find and book the perfect room for your needs</p>
      </div>

      {/* Filters */}
      <div className="room-filters">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search rooms..."
              value={roomFilters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={roomFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {roomCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Building</label>
            <select
              value={roomFilters.building}
              onChange={(e) => handleFilterChange('building', e.target.value)}
              className="filter-select"
            >
              <option value="">All Buildings</option>
              {buildings.map(building => (
                <option key={building} value={building}>{building}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Min Capacity</label>
            <input
              type="number"
              placeholder="Min"
              value={roomFilters.minCapacity}
              onChange={(e) => handleFilterChange('minCapacity', e.target.value)}
              className="filter-input"
              min="1"
            />
          </div>

          <div className="filter-group">
            <label>Max Capacity</label>
            <input
              type="number"
              placeholder="Max"
              value={roomFilters.maxCapacity}
              onChange={(e) => handleFilterChange('maxCapacity', e.target.value)}
              className="filter-input"
              min="1"
            />
          </div>

          <div className="filter-actions">
            <button 
              onClick={clearRoomFilters}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span>{rooms.length} rooms found</span>
        {Object.keys(roomFilters).some(key => roomFilters[key]) && (
          <span className="filtered-indicator">
            <i className="fas fa-filter"></i> Filtered
          </span>
        )}
      </div>

      {/* Room Grid */}
      {loadingRooms ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading rooms...</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {rooms.map(room => {
            const statusInfo = getRoomStatusInfo(room);
            
            return (
              <div key={room.id} className="room-card">
                <div className="room-header">
                  <h3 className="room-name">{room.name}</h3>
                  <span className="room-number">{room.roomNumber}</span>
                </div>

                <div className="room-details">
                  <div className="room-info">
                    <span className="room-category">{room.category}</span>
                    <span className="room-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {room.building} - {room.floor}
                    </span>
                    <span className="room-capacity">
                      <i className="fas fa-users"></i>
                      Capacity: {room.capacity}
                    </span>
                  </div>

                  {room.description && (
                    <p className="room-description">{room.description}</p>
                  )}

                  {room.equipment && room.equipment.length > 0 && (
                    <div className="room-equipment">
                      <span className="equipment-label">Equipment:</span>
                      <div className="equipment-list">
                        {room.equipment.slice(0, 3).map(equip => (
                          <span key={equip.id} className="equipment-tag">
                            {equip.name}
                          </span>
                        ))}
                        {room.equipment.length > 3 && (
                          <span className="equipment-more">
                            +{room.equipment.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="room-status">
                  <div 
                    className="status-indicator"
                    style={{ backgroundColor: statusInfo.color }}
                  >
                    <span className="status-text">{statusInfo.message}</span>
                  </div>
                </div>

                <div className="room-actions">
                  <button
                    onClick={() => handleBookRoom(room.id)}
                    className="btn btn-primary"
                  >
                    Book Room
                  </button>
                  
                  {statusInfo.status === 'available' && (
                    <button
                      onClick={() => handleQuickBook(room.id)}
                      className="btn btn-secondary"
                    >
                      Quick Book
                    </button>
                  )}
                  
                  <button
                    onClick={() => loadRoomAvailability(room.id)}
                    className="btn btn-outline"
                    disabled={loadingAvailability[room.id]}
                  >
                    {loadingAvailability[room.id] ? (
                      <span><i className="fas fa-spinner fa-spin"></i> Loading</span>
                    ) : (
                      <span><i className="fas fa-calendar"></i> View Schedule</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rooms.length === 0 && !loadingRooms && (
        <div className="no-results">
          <div className="no-results-content">
            <i className="fas fa-search"></i>
            <h3>No rooms found</h3>
            <p>Try adjusting your filters to find available rooms.</p>
            <button onClick={clearRoomFilters} className="btn btn-primary">
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBrowser;
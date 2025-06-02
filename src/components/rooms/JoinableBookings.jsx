// src/pages/rooms/JoinableBookings.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../context/RoomContext';
import { getJoinableBookings, requestToJoinBooking } from '../../api/roomBooking';
import './JoinableBookings.css';

const JoinableBookings = () => {
  const navigate = useNavigate();
  const { buildings, roomCategories } = useRoom();
  
  const [joinableBookings, setJoinableBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    building: '',
    dateFilter: 'upcoming', // upcoming, today, tomorrow, this_week
    timeFilter: 'all', // all, morning, afternoon, evening
    availableSpots: false
  });

  useEffect(() => {
    loadJoinableBookings();
  }, [filters]);

  const loadJoinableBookings = async () => {
    try {
      setLoading(true);
      const data = await getJoinableBookings(filters);
      setJoinableBookings(data);
    } catch (err) {
      console.error('Error loading joinable bookings:', err);
      setError('Failed to load available bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (bookingId) => {
    setActionLoading(prev => ({ ...prev, [bookingId]: true }));
    
    try {
      await requestToJoinBooking(bookingId);
      setSuccess('Join request sent successfully!');
      
      // Update the booking in the list to show request sent
      setJoinableBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, userHasRequestedToJoin: true }
            : booking
        )
      );
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error requesting to join:', err);
      setError(err.response?.data?.message || 'Failed to send join request');
      setTimeout(() => setError(''), 5000);
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      building: '',
      dateFilter: 'upcoming',
      timeFilter: 'all',
      availableSpots: false
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    let dateLabel;
    if (isToday) dateLabel = 'Today';
    else if (isTomorrow) dateLabel = 'Tomorrow';
    else dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return { dateLabel, time, fullDate: date.toLocaleDateString() };
  };

  const getDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end - start) / (1000 * 60 * 60);
    return hours < 1 ? `${Math.round(hours * 60)}m` : `${hours}h`;
  };

  const getAvailableSpots = (booking) => {
    const currentParticipants = (booking.participants?.length || 0) + 1; // +1 for organizer
    return booking.maxParticipants - currentParticipants;
  };

  const getTimeOfDay = (dateString) => {
    const hour = new Date(dateString).getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  if (error && joinableBookings.length === 0) {
    return (
      <div className="joinable-bookings-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={loadJoinableBookings} className="btn btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="joinable-bookings-container">
      {/* Header */}
      <div className="joinable-bookings-header">
        <h1>Joinable Room Bookings</h1>
        <p>Discover and join public room bookings from other users</p>
      </div>

      {/* Messages */}
      {success && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search bookings..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>When</label>
            <select
              value={filters.dateFilter}
              onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
              className="filter-select"
            >
              <option value="upcoming">Upcoming</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this_week">This Week</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Time of Day</label>
            <select
              value={filters.timeFilter}
              onChange={(e) => handleFilterChange('timeFilter', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Times</option>
              <option value="morning">Morning (6AM-12PM)</option>
              <option value="afternoon">Afternoon (12PM-5PM)</option>
              <option value="evening">Evening (5PM-11PM)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
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
              value={filters.building}
              onChange={(e) => handleFilterChange('building', e.target.value)}
              className="filter-select"
            >
              <option value="">All Buildings</option>
              {buildings.map(building => (
                <option key={building} value={building}>{building}</option>
              ))}
            </select>
          </div>

          <div className="filter-group checkbox-filter">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.availableSpots}
                onChange={(e) => handleFilterChange('availableSpots', e.target.checked)}
              />
              <span>Available spots only</span>
            </label>
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span>{joinableBookings.length} bookings available</span>
        {Object.values(filters).some(value => value && value !== 'upcoming' && value !== 'all') && (
          <span className="filtered-indicator">
            <i className="fas fa-filter"></i> Filtered
          </span>
        )}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading available bookings...</p>
        </div>
      ) : (
        <div className="bookings-grid">
          {joinableBookings.map(booking => {
            const startDateTime = formatDateTime(booking.startTime);
            const endDateTime = formatDateTime(booking.endTime);
            const duration = getDuration(booking.startTime, booking.endTime);
            const availableSpots = getAvailableSpots(booking);
            const isLoading = actionLoading[booking.id];
            const timeOfDay = getTimeOfDay(booking.startTime);

            return (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-title">
                    <h3>{booking.title}</h3>
                    <div className="booking-meta">
                      <span className="organizer">
                        <i className="fas fa-user"></i>
                        by {booking.user?.fullName}
                      </span>
                      <span className={`time-badge ${timeOfDay}`}>
                        <i className="fas fa-clock"></i>
                        {timeOfDay}
                      </span>
                    </div>
                  </div>
                  
                  <div className="availability-info">
                    <span className={`spots-badge ${availableSpots === 0 ? 'full' : 'available'}`}>
                      {availableSpots} spots left
                    </span>
                  </div>
                </div>

                <div className="booking-details">
                  <div className="room-info">
                    <div className="room-name">
                      <i className="fas fa-door-open"></i>
                      <strong>{booking.room?.name}</strong>
                      <span className="room-number">({booking.room?.roomNumber})</span>
                    </div>
                    
                    <div className="room-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {booking.room?.building} - {booking.room?.floor}
                    </div>
                    
                    <div className="room-category">
                      <span className="category-tag">{booking.room?.category}</span>
                    </div>
                  </div>

                  <div className="time-info">
                    <div className="date-time">
                      <div className="date">
                        <i className="fas fa-calendar"></i>
                        <span className="date-label">{startDateTime.dateLabel}</span>
                        {startDateTime.dateLabel !== startDateTime.fullDate && (
                          <span className="full-date">({startDateTime.fullDate})</span>
                        )}
                      </div>
                      
                      <div className="time">
                        <i className="fas fa-clock"></i>
                        <span>{startDateTime.time} - {endDateTime.time}</span>
                        <span className="duration">({duration})</span>
                      </div>
                    </div>
                  </div>

                  {booking.description && (
                    <div className="booking-description">
                      <p>{booking.description}</p>
                    </div>
                  )}

                  <div className="participants-info">
                    <div className="participants-count">
                      <i className="fas fa-users"></i>
                      <span>{(booking.participants?.length || 0) + 1} / {booking.maxParticipants} participants</span>
                    </div>
                    
                    {booking.participants && booking.participants.length > 0 && (
                      <div className="participants-preview">
                        <span className="participants-label">Joined:</span>
                        <div className="participants-list">
                          {booking.participants.slice(0, 3).map(participant => (
                            <span key={participant.id} className="participant-name">
                              {participant.user?.fullName}
                            </span>
                          ))}
                          {booking.participants.length > 3 && (
                            <span className="more-participants">
                              +{booking.participants.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {booking.room?.equipment && booking.room.equipment.length > 0 && (
                    <div className="equipment-info">
                      <span className="equipment-label">Equipment:</span>
                      <div className="equipment-list">
                        {booking.room.equipment.slice(0, 3).map(equip => (
                          <span key={equip.id} className="equipment-tag">
                            {equip.name}
                          </span>
                        ))}
                        {booking.room.equipment.length > 3 && (
                          <span className="equipment-more">
                            +{booking.room.equipment.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="booking-actions">
                  <button
                    onClick={() => navigate(`/room-booking/${booking.id}`)}
                    className="btn btn-outline"
                  >
                    <i className="fas fa-eye"></i>
                    View Details
                  </button>
                  
                  {booking.userHasRequestedToJoin ? (
                    <button className="btn btn-secondary" disabled>
                      <i className="fas fa-clock"></i>
                      Request Sent
                    </button>
                  ) : availableSpots > 0 ? (
                    <button
                      onClick={() => handleJoinRequest(booking.id)}
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Requesting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus"></i>
                          Request to Join
                        </>
                      )}
                    </button>
                  ) : (
                    <button className="btn btn-secondary" disabled>
                      <i className="fas fa-users"></i>
                      Full
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {joinableBookings.length === 0 && !loading && (
        <div className="no-results">
          <div className="no-results-content">
            <i className="fas fa-calendar-times"></i>
            <h3>No joinable bookings found</h3>
            <p>
              {Object.values(filters).some(value => value && value !== 'upcoming' && value !== 'all') 
                ? 'Try adjusting your filters to find more bookings.' 
                : 'There are currently no public bookings available to join.'
              }
            </p>
            <div className="no-results-actions">
              <button onClick={clearFilters} className="btn btn-secondary">
                Clear Filters
              </button>
              <button onClick={() => navigate('/rooms')} className="btn btn-primary">
                Create New Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinableBookings;
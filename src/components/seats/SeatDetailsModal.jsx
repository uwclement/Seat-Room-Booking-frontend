import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import './SeatDetailsModal.css';

// Enhanced Alert Component with unique classnames
const Alert = ({ type, message, errors, onClose }) => {
  return (
    <div className={`sdm-alert sdm-alert-${type}`}>
      <div className="sdm-alert-icon">
        {type === 'success' ? (
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        ) : (
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
        )}
      </div>
      <div className="sdm-alert-content">
        <div className="sdm-alert-message">{message}</div>
        {errors && Object.keys(errors).length > 0 && (
          <ul className="sdm-alert-errors">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <strong>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> {error}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button className="sdm-alert-close" onClick={onClose}>
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      </button>
    </div>
  );
};

const SeatDetailsModal = ({ 
  seat, 
  onClose, 
  onBook, 
  onWaitlist, 
  onToggleFavorite,
  isFavorite,
  userBookings = [],
  nearbySeats = [],
  onSeatSelect 
}) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '', errors: null });
  const [isBooking, setIsBooking] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    // Auto-show recommendations for occupied seats
    if (!isSeatAvailable() && nearbySeats.length > 0) {
      setShowRecommendations(true);
    }
  }, [seat]);

  // Check if seat is currently available (no active bookings)
  const isSeatAvailable = () => {
    if (typeof seat.available === 'boolean') {
      return seat.available;
    }   
    return !seat.isDisabled && !seat.bookings?.some(booking => 
      booking.status === 'RESERVED' || booking.status === 'CHECKED_IN'
    );
  };

  // Check if seat is booked by the current user
  const isUserBooking = () => {
    if (!userBookings || !userBookings.length) return false;
    
    const seatId = seat.id;
    
    const hasSeatIdMatch = userBookings.some(booking => 
      booking.seatId === seatId && 
      (booking.status === 'RESERVED' || booking.status === 'CHECKED_IN')
    );
    
    if (hasSeatIdMatch) return true;
    
    return userBookings.some(booking => 
      booking.seat && booking.seat.id === seatId &&
      (booking.status === 'RESERVED' || booking.status === 'CHECKED_IN')
    );
  };

  // Get current active booking if there is one
  const getCurrentBooking = () => {
    if (!seat.bookings || seat.bookings.length === 0) return null;
    
    return seat.bookings.find(booking => 
      booking.status === 'RESERVED' || booking.status === 'CHECKED_IN'
    );
  };

  // Get user's booking for this seat if they have one
  const getUserBooking = () => {
    if (!userBookings.length) return null;
    
    return userBookings.find(booking => 
      booking.seat && booking.seat.id === seat.id &&
      (booking.status === 'RESERVED' || booking.status === 'CHECKED_IN')
    );
  };

  // Format time for display
  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  // Format availability time for better display
  const formatAvailabilityTime = (timeString) => {
    try {
      const availTime = new Date(timeString);
      const now = new Date();
      
      if (availTime.toDateString() === now.toDateString()) {
        return `Today at ${availTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (availTime.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow at ${availTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      return `${availTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at ${availTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return 'Unknown';
    }
  };

  // Calculate duration
  const calculateDuration = () => {
    if (!startTime || !endTime) return null;
    
    const start = new Date(`2023-01-01T${startTime}`);
    const end = new Date(`2023-01-01T${endTime}`);
    const durationMs = end - start;
    
    if (durationMs <= 0) return null;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} minutes`;
  };

  // Handle booking submission with enhanced error handling
  const handleBooking = async () => {
    // Clear previous alerts
    setAlert({ type: '', message: '', errors: null });

    // Validation
    if (!startTime || !endTime) {
      setAlert({ 
        type: 'danger', 
        message: 'Please select both start and end times',
        errors: null
      });
      return;
    }

    // Check if start time is in the past (for today's date)
    const now = new Date();
    const selectedDate = new Date(bookingDate);
    const startDateTime = new Date(`${bookingDate}T${startTime}:00`);
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    if (isToday && startDateTime <= now) {
      setAlert({ 
        type: 'danger', 
        message: 'Validation failed',
        errors: {
          startTime: 'Start time cannot be in the past'
        }
      });
      return;
    }

    // Check if end time is earlier than start time
    if (startTime >= endTime) {
      setAlert({ 
        type: 'danger', 
        message: 'Validation failed',
        errors: {
          endTime: 'End time must be after start time'
        }
      });
      return;
    }

    // Check for maximum booking duration (6 hours)
    const start = new Date(`${bookingDate}T${startTime}`);
    const end = new Date(`${bookingDate}T${endTime}`);
    const durationHours = (end - start) / (1000 * 60 * 60);
    
    if (durationHours > 6) {
      setAlert({ 
        type: 'danger', 
        message: 'Validation failed',
        errors: {
          duration: 'Maximum booking duration is 6 hours'
        }
      });
      return;
    }

    // Prepare booking data
    const bookingData = {
      seatId: seat.id,
      startTime: `${bookingDate}T${startTime}:00`,
      endTime: `${bookingDate}T${endTime}:00`,
      notes: notes || undefined
    };

    try {
      setIsBooking(true);
      const result = await onBook(bookingData);
      
      if (result.success) {
        setAlert({ 
          type: 'success', 
          message: result.message || 'Booking confirmed successfully!',
          errors: null
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // Handle backend validation errors
        if (result.errors) {
          setAlert({ 
            type: 'danger', 
            message: result.message || 'Validation failed',
            errors: result.errors
          });
        } else {
          setAlert({ 
            type: 'danger', 
            message: result.message || 'Booking failed. Please try again.',
            errors: null
          });
        }
      }
    } catch (error) {
      // Parse error response if it contains validation errors
      let errorMessage = 'An error occurred during booking. Please try again.';
      let errors = null;
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        errorMessage = errorData.message || errorMessage;
        errors = errorData.errors || null;
      }
      
      setAlert({ 
        type: 'danger', 
        message: errorMessage,
        errors: errors
      });
      console.error('Booking error:', error);
    } finally {
      setIsBooking(false);
    }
  };

  // Handle joining the waitlist with enhanced error handling
  const handleJoinWaitlist = async () => {
    // Clear previous alerts
    setAlert({ type: '', message: '', errors: null });

    if (!startTime || !endTime) {
      setAlert({
        type: 'danger',
        message: 'Please select both start and end times',
        errors: null
      });
      return;
    }

    // Check if start time is in the past (for today's date)
    const now = new Date();
    const selectedDate = new Date(bookingDate);
    const startDateTime = new Date(`${bookingDate}T${startTime}:00`);
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    if (isToday && startDateTime <= now) {
      setAlert({ 
        type: 'danger', 
        message: 'Validation failed',
        errors: {
          startTime: 'Start time cannot be in the past'
        }
      });
      return;
    }

    // Check if end time is earlier than start time
    if (startTime >= endTime) {
      setAlert({ 
        type: 'danger', 
        message: 'Validation failed',
        errors: {
          endTime: 'End time must be after start time'
        }
      });
      return;
    }

    const waitlistData = {
      seatId: seat.id,
      requestedStartTime: `${bookingDate}T${startTime}:00`,
      requestedEndTime: `${bookingDate}T${endTime}:00`,
      notes: notes || undefined
    };

    try {
      setIsBooking(true);
      const result = await onWaitlist(waitlistData);
      
      if (result.success) {
        setAlert({ 
          type: 'success', 
          message: result.message || 'Successfully joined the waitlist!',
          errors: null
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        if (result.errors) {
          setAlert({ 
            type: 'danger', 
            message: result.message || 'Validation failed',
            errors: result.errors
          });
        } else {
          setAlert({ 
            type: 'danger', 
            message: result.message || 'Failed to join waitlist. Please try again.',
            errors: null
          });
        }
      }
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.';
      let errors = null;
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        errorMessage = errorData.message || errorMessage;
        errors = errorData.errors || null;
      }
      
      setAlert({
        type: 'danger',
        message: errorMessage,
        errors: errors
      });
      console.error('Waitlist error:', error);
    } finally {
      setIsBooking(false);
    }
  };

  // Generate time slot options (8:00 AM to 10:00 PM in 30-minute increments)
  const generateTimeOptions = () => {
    const options = [];
    const start = 8 * 60; // 8:00 AM in minutes
    const end = 22 * 60;  // 10:00 PM in minutes
    const increment = 30;  // 30-minute increments
    
    for (let minutes = start; minutes <= end; minutes += increment) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      const value = `${formattedHour}:${formattedMinute}`;
      
      const displayHour = hour % 12 || 12;
      const amPm = hour < 12 ? 'AM' : 'PM';
      const displayValue = `${displayHour}:${formattedMinute.padStart(2, '0')} ${amPm}`;
      
      options.push({ value, display: displayValue });
    }
    
    return options;
  };

  // Get the time when seat will be available again
  const getAvailabilityTime = () => {
    if (isSeatAvailable()) return null;
    
    const activeBookings = seat.bookings?.filter(booking => 
      booking.status === 'RESERVED' || booking.status === 'CHECKED_IN'
    ) || [];
    
    if (!activeBookings.length) return null;
    
    const sortedBookings = [...activeBookings].sort((a, b) => 
      new Date(a.endTime) - new Date(b.endTime)
    );
    
    return sortedBookings[sortedBookings.length - 1].endTime;
  };

  const timeOptions = generateTimeOptions();
  const activeBooking = getCurrentBooking();
  const userBooking = getUserBooking();
  const isAvailable = isSeatAvailable();
  const isUserSeat = isUserBooking();
  const availabilityTime = getAvailabilityTime();
  const duration = calculateDuration();

  return (
    <div className="sdm-overlay" onClick={onClose}>
      <div className="sdm-container" onClick={(e) => e.stopPropagation()}>
        <div className="sdm-header">
          <h3 className="sdm-title">
            Seat {seat.seatNumber}
            <span className={`sdm-status-badge ${isAvailable ? 'sdm-available' : isUserSeat ? 'sdm-user-booked' : 'sdm-occupied'}`}>
              {isAvailable ? 'Available' : isUserSeat ? 'Your Booking' : 'Occupied'}
            </span>
          </h3>
          <button className="sdm-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="sdm-body">
          {alert.message && (
            <Alert 
              type={alert.type} 
              message={alert.message}
              errors={alert.errors}
              onClose={() => setAlert({ type: '', message: '', errors: null })} 
            />
          )}
          
          <div className="sdm-content-grid">
            {/* Left Column - Seat Information */}
            <div className="sdm-info-panel">
              <h4 className="sdm-section-title">Seat Information</h4>
              
              <div className="sdm-info-item">
                <span className="sdm-info-label">Zone</span>
                <span className="sdm-info-value">{seat.zoneType}</span>
              </div>
              
              <div className="sdm-info-item">
                <span className="sdm-info-label">Floor</span>
                <span className="sdm-info-value">{seat.floor || '1st Floor'}</span>
              </div>
              
              <div className="sdm-info-item">
                <span className="sdm-info-label">Desktop</span>
                <span className={`sdm-info-badge ${seat.hasDesktop ? 'sdm-badge-yes' : 'sdm-badge-no'}`}>
                  {seat.hasDesktop ? 'Yes' : 'No'}
                </span>
              </div>
              
              {seat.hasWindow !== undefined && (
                <div className="sdm-info-item">
                  <span className="sdm-info-label">Window Seat</span>
                  <span className={`sdm-info-badge ${seat.hasWindow ? 'sdm-badge-yes' : 'sdm-badge-no'}`}>
                    {seat.hasWindow ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
              
              {seat.powerOutlets && (
                <div className="sdm-info-item">
                  <span className="sdm-info-label">Power Outlets</span>
                  <span className="sdm-info-value">{seat.powerOutlets}</span>
                </div>
              )}
              
              {seat.monitor !== undefined && (
                <div className="sdm-info-item">
                  <span className="sdm-info-label">Monitor</span>
                  <span className={`sdm-info-badge ${seat.monitor ? 'sdm-badge-yes' : 'sdm-badge-no'}`}>
                    {seat.monitor ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
              
              {seat.description && (
                <div className="sdm-info-item">
                  <span className="sdm-info-label">Notes</span>
                  <span className="sdm-info-value">{seat.description}</span>
                </div>
              )}
              
              {/* Availability time for occupied seats */}
              {!isAvailable && availabilityTime && !isUserSeat && (
                <div className="sdm-availability-notice">
                  <span className="sdm-info-label">Available</span>
                  <span className="sdm-info-value sdm-availability-time">
                    {formatAvailabilityTime(availabilityTime)}
                  </span>
                </div>
              )}
              
              {/* Current booking info if seat is occupied */}
              {isUserSeat && userBooking && (
                <div className="sdm-booking-card sdm-user-booking">
                  <h4>Your Current Booking</h4>
                  <div className="sdm-info-item">
                    <span className="sdm-info-label">Date</span>
                    <span className="sdm-info-value">
                      {formatDate(userBooking.startTime)}
                    </span>
                  </div>
                  <div className="sdm-info-item">
                    <span className="sdm-info-label">Time</span>
                    <span className="sdm-info-value">
                      {formatTime(userBooking.startTime)} - {formatTime(userBooking.endTime)}
                    </span>
                  </div>
                  <div className="sdm-info-item">
                    <span className="sdm-info-label">Status</span>
                    <span className="sdm-info-value sdm-booking-status">
                      {userBooking.checkedIn ? 'Checked In' : 'Reserved'}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Show other user's booking if not your seat */}
              {!isUserSeat && activeBooking && (
                <div className="sdm-booking-card">
                  <h4>Current Booking</h4>
                  <div className="sdm-info-item">
                    <span className="sdm-info-label">Date</span>
                    <span className="sdm-info-value">
                      {formatDate(activeBooking.startTime)}
                    </span>
                  </div>
                  <div className="sdm-info-item">
                    <span className="sdm-info-label">Time</span>
                    <span className="sdm-info-value">
                      {formatTime(activeBooking.startTime)} - {formatTime(activeBooking.endTime)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column - Booking Form */}
            {!isUserSeat && (
              <div className="sdm-form-panel">
                <h4 className="sdm-section-title">
                  {isAvailable 
                    ? 'Book This Seat' 
                    : 'Book for Another Time or Join Waitlist'}
                </h4>
                
                <div className="sdm-form-field sdm-full-width">
                  <label htmlFor="bookingDate" className="sdm-form-label">
                    Date <span className="sdm-required">*</span>
                  </label>
                  <input
                    type="date"
                    id="bookingDate"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="sdm-form-input"
                  />
                </div>
                
                <div className="sdm-form-row">
                  <div className="sdm-form-field">
                    <label htmlFor="startTime" className="sdm-form-label">
                      Start Time <span className="sdm-required">*</span>
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="sdm-form-input"
                      list="start-time-options"
                    />
                    <datalist id="start-time-options">
                      {timeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.display}
                        </option>
                      ))}
                    </datalist>
                  </div>
                  
                  <div className="sdm-form-field">
                    <label htmlFor="endTime" className="sdm-form-label">
                      End Time <span className="sdm-required">*</span>
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="sdm-form-input"
                      list="end-time-options"
                    />
                    <datalist id="end-time-options">
                      {timeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.display}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>
                
                {duration && (
                  <div className={`sdm-duration-display ${duration && duration.includes('hour') && parseInt(duration) > 6 ? 'sdm-duration-warning' : ''}`}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                    <span><strong>Duration:</strong> {duration}</span>
                  </div>
                )}
                
                <div className="sdm-form-field sdm-full-width">
                  <label htmlFor="notes" className="sdm-form-label">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any special requirements or notes"
                    className="sdm-form-input"
                  />
                </div>
                
                {/* Nearby available seats recommendations */}
                {!isAvailable && nearbySeats.length > 0 && (
                  <div className="sdm-recommendations">
                    <button 
                      className="sdm-toggle-btn"
                      onClick={() => setShowRecommendations(!showRecommendations)}
                    >
                      {showRecommendations ? '▼' : '▶'} 
                      {showRecommendations ? ' Hide Recommendations' : ' Show Available Alternatives'}
                    </button>
                    
                    {showRecommendations && (
                      <div className="sdm-nearby-seats">
                        <h5 className="sdm-nearby-title">Available Nearby Seats:</h5>
                        <div className="sdm-nearby-grid">
                          {nearbySeats.slice(0, 3).map(nearbySeat => (
                            <div key={nearbySeat.id} className="sdm-nearby-card">
                              <span className="sdm-nearby-number">{nearbySeat.seatNumber}</span>
                              <span className="sdm-nearby-zone">{nearbySeat.zoneType}</span>
                              <span className="sdm-nearby-desktop">
                                {nearbySeat.hasDesktop ? '✓ Desktop' : '✗ No Desktop'}
                              </span>
                              <button
                                onClick={() => {
                                  onClose();
                                  setTimeout(() => onSeatSelect(nearbySeat), 100);
                                }}
                                className="sdm-nearby-select-btn"
                              >
                                Select
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="sdm-action-buttons">
                  <button
                    onClick={() => onToggleFavorite()}
                    className="sdm-btn sdm-btn-secondary"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>
                  
                  {isAvailable ? (
                    <button
                      onClick={handleBooking}
                      disabled={isBooking || !startTime || !endTime}
                      className="sdm-btn sdm-btn-primary"
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      {isBooking ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinWaitlist}
                      disabled={isBooking || !startTime || !endTime}
                      className="sdm-btn sdm-btn-primary"
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {isBooking ? 'Processing...' : 'Join Waitlist'}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* User's current booking actions */}
            {isUserSeat && userBooking && (
              <div className="sdm-user-actions">
                <h4 className="sdm-section-title">Manage Your Booking</h4>
                <div className="sdm-action-buttons">
                  <button
                    onClick={() => window.location.href = '/bookings'}
                    className="sdm-btn sdm-btn-secondary"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    View All Bookings
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this booking?')) {
                        // You can call a cancel booking function here
                        // For now, redirect to bookings page
                        window.location.href = '/bookings';
                      }
                    }}
                    className="sdm-btn sdm-btn-danger"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Cancel Booking
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

SeatDetailsModal.propTypes = {
  seat: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    seatNumber: PropTypes.string.isRequired,
    zoneType: PropTypes.string,
    floor: PropTypes.string,
    hasDesktop: PropTypes.bool,
    hasWindow: PropTypes.bool,
    powerOutlets: PropTypes.number,
    monitor: PropTypes.bool,
    available: PropTypes.bool,
    isDisabled: PropTypes.bool,
    description: PropTypes.string,
    bookings: PropTypes.arrayOf(PropTypes.shape({
      status: PropTypes.string,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
      checkedIn: PropTypes.bool
    }))
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onBook: PropTypes.func.isRequired,
  onWaitlist: PropTypes.func.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool.isRequired,
  userBookings: PropTypes.arrayOf(PropTypes.shape({
    seatId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    seat: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }),
    status: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    checkedIn: PropTypes.bool
  })),
  nearbySeats: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    seatNumber: PropTypes.string,
    zoneType: PropTypes.string,
    hasDesktop: PropTypes.bool
  })),
  onSeatSelect: PropTypes.func
};

SeatDetailsModal.defaultProps = {
  userBookings: [],
  nearbySeats: [],
  onSeatSelect: () => {}
};

export default SeatDetailsModal;
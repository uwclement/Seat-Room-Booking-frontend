import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import Alert from '../common/Alert';
import './SeatDetailsModal.css';

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
  const [alert, setAlert] = useState({ type: '', message: '' });
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
    // First check the available property
    if (typeof seat.available === 'boolean') {
      return seat.available;
    }   
    // Then fall back to checking bookings
    return !seat.isDisabled && !seat.bookings?.some(booking => 
      booking.status === 'RESERVED' || booking.status === 'CHECKED_IN'
    );
  };

  // Check if seat is booked by the current user
const isUserBooking = () => {
  if (!userBookings || !userBookings.length) return false;
  
  const seatId = seat.id;
  
  // First check if the booking references the seat directly by seatId 
  const hasSeatIdMatch = userBookings.some(booking => 
    booking.seatId === seatId && 
    (booking.status === 'RESERVED' || booking.status === 'CHECKED_IN')
  );
  
  if (hasSeatIdMatch) return true;
  
  // Fall back to the old way in case data structure varies
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
      
      // If available today, show "Today at [time]"
      if (availTime.toDateString() === now.toDateString()) {
        return `Today at ${availTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // If available tomorrow, show "Tomorrow at [time]"
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (availTime.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow at ${availTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Otherwise show day and time
      return `${availTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at ${availTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return 'Unknown';
    }
  };

  // Handle booking submission
  const handleBooking = async () => {
    // Validation
    if (!startTime || !endTime) {
      setAlert({ 
        type: 'danger', 
        message: 'Please select both start and end times' 
      });
      return;
    }

    // NEW VALIDATION 1: Check if start time is in the past (for today's date)
    const now = new Date();
    const selectedDate = new Date(bookingDate);
    const startDateTime = new Date(`${bookingDate}T${startTime}:00`);
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    if (isToday && startDateTime <= now) {
      setAlert({ 
        type: 'danger', 
        message: 'Start time cannot be in the past' 
      });
      return;
    }

    // NEW VALIDATION 2: Check if end time is earlier than start time
    if (startTime >= endTime) {
      setAlert({ 
        type: 'danger', 
        message: 'End time must be after start time' 
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
        message: 'Maximum booking duration is 6 hours' 
      });
      return;
    }

    // Prepare booking data
    const bookingData = {
      seatId: seat.id,
      startTime: `${bookingDate}T${startTime}:00`,
      endTime: `${bookingDate}T${endTime}:00`
    };

    try {
      setIsBooking(true);
      const result = await onBook(bookingData);
      
      if (result.success) {
        setAlert({ type: 'success', message: result.message });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setAlert({ type: 'danger', message: result.message });
      }
    } catch (error) {
      setAlert({ 
        type: 'danger', 
        message: 'An error occurred during booking. Please try again.' 
      });
      console.error('Booking error:', error);
    } finally {
      setIsBooking(false);
    }
  };

  // Handle joining the waitlist
  const handleJoinWaitlist = async () => {
    if (!startTime || !endTime) {
      setAlert({
        type: 'danger',
        message: 'Please select both start and end times'
      });
      return;
    }

    // NEW VALIDATION 1: Check if start time is in the past (for today's date)
    const now = new Date();
    const selectedDate = new Date(bookingDate);
    const startDateTime = new Date(`${bookingDate}T${startTime}:00`);
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    if (isToday && startDateTime <= now) {
      setAlert({ 
        type: 'danger', 
        message: 'Start time cannot be in the past' 
      });
      return;
    }

    // NEW VALIDATION 2: Check if end time is earlier than start time
    if (startTime >= endTime) {
      setAlert({ 
        type: 'danger', 
        message: 'End time must be after start time' 
      });
      return;
    }

    const waitlistData = {
      seatId: seat.id,
      requestedStartTime: `${bookingDate}T${startTime}:00`,
      requestedEndTime: `${bookingDate}T${endTime}:00`
    };

    try {
      setIsBooking(true);
      const result = await onWaitlist(waitlistData);
      
      if (result.success) {
        setAlert({ type: 'success', message: result.message });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setAlert({ type: 'danger', message: result.message });
      }
    } catch (error) {
      setAlert({
        type: 'danger',
        message: 'An error occurred. Please try again.'
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
      
      const displayHour = hour % 12 || 12; // Convert to 12-hour format
      const amPm = hour < 12 ? 'AM' : 'PM';
      const displayValue = `${displayHour}:${formattedMinute.padStart(2, '0')} ${amPm}`;
      
      options.push({ value, display: displayValue });
    }
    
    return options;
  };

  const timeOptions = generateTimeOptions();
  const activeBooking = getCurrentBooking();
  const userBooking = getUserBooking();
  const isAvailable = isSeatAvailable();
  const isUserSeat = isUserBooking();

  // Get the time when seat will be available again
  const getAvailabilityTime = () => {
    if (isAvailable) return null;
    
    const activeBookings = seat.bookings?.filter(booking => 
      booking.status === 'RESERVED' || booking.status === 'CHECKED_IN'
    ) || [];
    
    if (!activeBookings.length) return null;
    
    // Sort bookings by end time to find when the seat will be available
    const sortedBookings = [...activeBookings].sort((a, b) => 
      new Date(a.endTime) - new Date(b.endTime)
    );
    
    // Return the latest end time
    return sortedBookings[sortedBookings.length - 1].endTime;
  };

  const availabilityTime = getAvailabilityTime();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            Seat {seat.seatNumber}
            {isUserSeat}
            <span className={`seat-status ${isAvailable ? 'available' : isUserSeat ? 'user-booked' : 'occupied'}`}>
              {isAvailable ? 'Available' : isUserSeat ? 'Your Booking' : 'Occupied'}
            </span>
          </h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          {alert.message && (
            <Alert 
              type={alert.type} 
              message={alert.message} 
              onClose={() => setAlert({ type: '', message: '' })} 
            />
          )}
          
          <div className="seat-details">
            <div className="seat-info-row">
              <span className="seat-info-label">Zone:</span>
              <span className="seat-info-value">{seat.zoneType}</span>
            </div>
            
            <div className="seat-info-row">
              <span className="seat-info-label">Desktop:</span>
              <span className="seat-info-value">
                {seat.hasDesktop ? 'Yes' : 'No'}
              </span>
            </div>
            
            {/* {isUserSeat && userBooking(
            <div className="seat-info-row">
              <span className="seat-info-label">Start</span>
              <span className="seat-info-value">
              {formatDate(userBooking.startTime)}
              </span>
            </div>
            )} */}
            
            {/* <div className="seat-info-row">
              <span className="seat-info-label">End</span>
              <span className="seat-info-value">
              {formatAvailabilityTime(availabilityTime)}
              </span>
            </div> */}
            
            {seat.description && (
              <div className="seat-info-row">
                <span className="seat-info-label">Description:</span>
                <span className="seat-info-value">{seat.description}</span>
              </div>
            )}
            
            
            {/* Availability time for occupied seats */}
            {!isAvailable && availabilityTime && !isUserSeat && (
              <div className="seat-info-row availability-time-row">
                <span className="seat-info-label">Available:</span>
                <span className="seat-info-value availability-highlight">
                {formatAvailabilityTime(availabilityTime)}
                </span>
              </div>
            )}
            
            {/* Current booking info if seat is occupied */}
            {isUserSeat && userBooking && (
              <div className="current-booking-info user-booking-info">
                <h4>Your Current Booking</h4>
                <div className="seat-info-row">
                  <span className="seat-info-label">Date:</span>
                  <span className="seat-info-value">
                    {formatDate(userBooking.startTime)}
                  </span>
                </div>
                <div className="seat-info-row">
                  <span className="seat-info-label">Time:</span>
                  <span className="seat-info-value">
                    {formatTime(userBooking.startTime)} - {formatTime(userBooking.endTime)}
                  </span>
                </div>
                <div className="seat-info-row">
                  <span className="seat-info-label">Status:</span>
                  <span className="seat-info-value booking-status">
                    {userBooking.checkedIn ? 'Checked In' : 'Reserved'}
                  </span>
                </div>
              </div>
            )}
            {/* Show other user's booking if not your seat */}
            {!isUserSeat && activeBooking && (
              <div className="current-booking-info">
                <h4>Current Booking</h4>
                <div className="seat-info-row">
                  <span className="seat-info-label">Date:</span>
                  <span className="seat-info-value">
                    {formatDate(activeBooking.startTime)}
                  </span>
                </div>
                <div className="seat-info-row">
                  <span className="seat-info-label">Time:</span>
                  <span className="seat-info-value">
                    {formatTime(activeBooking.startTime)} - {formatTime(activeBooking.endTime)}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Only show booking form if not user's current booking */}
          {!isUserSeat && (
            <div className="booking-form">
              <h4>
                {isAvailable 
                  ? 'Book this seat' 
                  : 'Book for another time or join waitlist'}
              </h4>
              
              <div className="form-group">
                <label htmlFor="bookingDate">Date:</label>
                <input
                  type="date"
                  id="bookingDate"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="form-control"
                /><div className="form-group">
                <label htmlFor="startTime">Start Time:</label>
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endTime">End Time:</label>
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="form-control"
                  min={startTime} // ensures end time cannot be earlier than start time
                />
                <small className="duration-hint">
                  {startTime && endTime ? (
                    `Duration: ${((new Date(`2023-01-01T${endTime}`) - new Date(`2023-01-01T${startTime}`)) / (1000 * 60 * 60)).toFixed(1)} hours`
                  ) : ''}
                </small>
              </div>
              
              </div>
              
              
              
              {/* Nearby available seats recommendations */}
              {!isAvailable && nearbySeats.length > 0 && (
                <div className="nearby-seats-section">
                  <button 
                    className="toggle-recommendations"
                    onClick={() => setShowRecommendations(!showRecommendations)}
                  >
                    {showRecommendations ? 'Hide Recommendations' : 'Show Available Alternatives'}
                  </button>
                  
                  {showRecommendations && (
                    <div className="nearby-seats">
                      <h5>Available Nearby Seats:</h5>
                      <div className="nearby-seats-grid">
                        {nearbySeats.slice(0, 3).map(nearbySeat => (
                          <div key={nearbySeat.id} className="nearby-seat">
                            <span className="nearby-seat-number">{nearbySeat.seatNumber}</span>
                            <span className="nearby-seat-zone">{nearbySeat.zoneType}</span>
                            <span className="nearby-seat-desktop">
                              {nearbySeat.hasDesktop ? 'With Desktop' : 'No Desktop'}
                            </span>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                onClose();
                                setTimeout(() => onSeatSelect(nearbySeat), 100);
                              }}
                              className="nearby-seat-btn"
                            >
                              Select
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => onToggleFavorite()}
                  className="favorite-button"
                >
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
                
                {isAvailable ? (
                  <Button
                    variant="primary"
                    onClick={handleBooking}
                    disabled={isBooking || !startTime || !endTime}
                  >
                    {isBooking ? 'Booking...' : 'Book Seat'}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleJoinWaitlist}
                    disabled={isBooking || !startTime || !endTime}
                  >
                    {isBooking ? 'Processing...' : 'Join Waitlist'}
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* User's current booking actions */}
          {isUserSeat && userBooking && (
            <div className="user-booking-actions">
              <h4>Manage Your Booking</h4>
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = '/bookings'}
                >
                  View All Bookings
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel this booking?')) {
                      window.location.href = '/bookings';
                    }
                  }}
                >
                  Cancel Booking
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

SeatDetailsModal.propTypes = {
  seat: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onBook: PropTypes.func.isRequired,
  onWaitlist: PropTypes.func.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool.isRequired,
  userBookings: PropTypes.array,
  nearbySeats: PropTypes.array
};

export default SeatDetailsModal;
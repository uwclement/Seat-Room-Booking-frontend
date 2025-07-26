import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './SeatGrid.css';

const MasoroSeatGrid = ({ 
  seats, 
  onSeatSelect, 
  favoriteSeats = [], 
  userBookings = [],
  seatsPerRow = 6 // Default to 6 seats per row
}) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);

  // Function to check if seat is available
  const isSeatAvailable = (seat) => {
    return seat.available; 
  };

  // Check if seat is booked by the current user
  const isUserBooking = (seat) => {
    if (!userBookings || !userBookings.length) return false;
    
    return userBookings.some(booking => 
      booking.seatId === seat.id && 
      (booking.status === 'RESERVED' || booking.status === 'CHECKED_IN')
    );
  };

  // Get upcoming availability time for occupied seats
  const getAvailabilityTime = (seat) => {
    if (isSeatAvailable(seat)) return null;
    
    if (seat.nextAvailableTime && seat.nextAvailableTime !== '') {
      return seat.nextAvailableTime;
    }
    
    const activeBookings = seat.bookings?.filter(booking => 
      booking.status === 'RESERVED' || booking.status === 'CHECKED_IN'
    ) || [];
    
    if (activeBookings.length > 0) {
      const sortedBookings = [...activeBookings].sort((a, b) => 
        new Date(a.endTime) - new Date(b.endTime)
      );
      
      return sortedBookings[sortedBookings.length - 1].endTime;
    }
    
    const bookingsForSeat = userBookings.filter(booking => 
      booking.seatId === seat.id && 
      (booking.status === 'RESERVED' || booking.status === 'CHECKED_IN')
    );
    
    if (!bookingsForSeat.length) return null;
    
    const latestEndTime = bookingsForSeat.reduce((latest, booking) => {
      const endTime = new Date(booking.endTime);
      return endTime > latest ? endTime : latest;
    }, new Date(0));
    
    return latestEndTime.toISOString();
  };

  // Format time for display
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

  // Calculate time to availability for seat coloring
  const getTimeToAvailability = (availabilityTime) => {
    if (!availabilityTime) return 0;
    
    const now = new Date();
    const availTime = new Date(availabilityTime);
    const hoursToAvail = (availTime - now) / (1000 * 60 * 60);
    
    return Math.min(hoursToAvail / 8, 1);
  };

  // Generate a color based on availability time
  const getAvailabilityColor = (availabilityTime) => {
    const timeRatio = getTimeToAvailability(availabilityTime);
    
    const r = 239 - Math.floor(timeRatio * 100);
    const g = 68 - Math.floor(timeRatio * 40);
    const b = 68 - Math.floor(timeRatio * 40);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Create uniform grid with specified seats per row
  const createUniformGrid = (seats, seatsPerRow) => {
    const rows = [];
    for (let i = 0; i < seats.length; i += seatsPerRow) {
      rows.push(seats.slice(i, i + seatsPerRow));
    }
    return rows;
  };

  // Render a single seat with your existing styling
  const renderSeat = (seat) => {
    const isAvailable = isSeatAvailable(seat);
    const isFavorite = favoriteSeats.includes(seat.id);
    const userBooked = isUserBooking(seat);
    const availabilityTime = getAvailabilityTime(seat);
    
    let seatClass = 'seat-item';
    if (isAvailable) {
      seatClass += ' available';
    } else if (userBooked) {
      seatClass += ' user-booked';
    } else {
      seatClass += ' occupied';
    }
    
    if (isFavorite) seatClass += ' favorite';
    if (seat.id === hoveredSeat) seatClass += ' hovered';
    
    const customStyle = !isAvailable && !userBooked ? 
      { borderColor: getAvailabilityColor(availabilityTime), color: getAvailabilityColor(availabilityTime) } : {};
    
    return (
      <div 
        key={seat.id}
        className={seatClass}
        onClick={() => onSeatSelect(seat)}
        onMouseEnter={() => setHoveredSeat(seat.id)}
        onMouseLeave={() => setHoveredSeat(null)}
        data-seat={seat.seatNumber}
        style={customStyle}
      >
        <i className={`fa-solid ${seat.hasDesktop ? 'fa-desktop' : 'fa-book-open-reader'}`}></i>
        <span>{seat.seatNumber}</span>
        
        {/* User booking badge */}
        {userBooked && (
          <div className="user-booking-badge">Your Booking</div>
        )}
        
        {/* Favorite indicator */}
        {isFavorite && (
          <i className="favorite-icon fa-solid fa-bookmark"></i>
        )}
        
        {/* Available at time indicator for occupied seats */}
        {!isAvailable && availabilityTime && (
          <div className="availability-indicator">
            <span className="availability-time">
              Available {formatAvailabilityTime(availabilityTime)}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (seats.length === 0) {
    return (
      <div className="no-seats-message">
        <p>No seats available with the selected filters.</p>
      </div>
    );
  }

  // Create uniform rows for the new structure
  const uniformRows = createUniformGrid(seats, seatsPerRow);

  return (
    <div className="seats-grid-container">
      <div className="uniform-grid-container">
        {uniformRows.map((row, rowIndex) => (
          <div key={rowIndex} className="uniform-seat-row">
            {row.map(seat => renderSeat(seat))}
          </div>
        ))}
      </div>
    </div>
  );
};

MasoroSeatGrid.propTypes = {
  seats: PropTypes.array.isRequired,
  onSeatSelect: PropTypes.func.isRequired,
  favoriteSeats: PropTypes.array.isRequired,
  userBookings: PropTypes.array,
  seatsPerRow: PropTypes.number
};

export default MasoroSeatGrid;
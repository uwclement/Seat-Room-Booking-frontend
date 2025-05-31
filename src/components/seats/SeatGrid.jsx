import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './SeatGrid.css';

const SeatGrid = ({seats, onSeatSelect, favoriteSeats, userBookings = [] }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);

  // Function to check if seat is available
  const isSeatAvailable = (seat) => {
    return seat.available; 
  };

  // Check if seat is booked by the current user
  const isUserBooking = (seat) => {
    if (!userBookings || !userBookings.length) return false;
    
    // Check if the seat ID is in the userBookings list
    return userBookings.some(booking => 
      booking.seatId === seat.id && 
      (booking.status === 'RESERVED' || booking.status === 'CHECKED_IN')
    );
  };

  // Get upcoming availability time for occupied seats
  const getAvailabilityTime = (seat) => {
    if (isSeatAvailable(seat)) return null;
    
    // If the seat has nextAvailableTime, use that
    if (seat.nextAvailableTime && seat.nextAvailableTime !== '') {
      return seat.nextAvailableTime;
    }
    
    // Check local bookings array first
    const activeBookings = seat.bookings?.filter(booking => 
      booking.status === 'RESERVED' || booking.status === 'CHECKED_IN'
    ) || [];
    
    if (activeBookings.length > 0) {
      // Sort bookings by end time to find when the seat will be available
      const sortedBookings = [...activeBookings].sort((a, b) => 
        new Date(a.endTime) - new Date(b.endTime)
      );
      
      // Return the latest end time
      return sortedBookings[sortedBookings.length - 1].endTime;
    }
    
    // Fallback to userBookings if no local bookings found
    const bookingsForSeat = userBookings.filter(booking => 
      booking.seatId === seat.id && 
      (booking.status === 'RESERVED' || booking.status === 'CHECKED_IN')
    );
    
    if (!bookingsForSeat.length) return null;
    
    // Find the latest end time
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

  // Group seats by table and type
  const groupSeatsByTable = () => {
    const tableGroups = {};
    
    seats.forEach(seat => {
      // Clean up seat number by trimming any whitespace or newlines
      const cleanSeatNumber = seat.seatNumber.trim();
      
      // Extract the table letter (A, B, etc.)
      const tableLetter = cleanSeatNumber.charAt(0);
      
      // Check if it's a desktop seat (has "-D" in the seat number)
      const isDesktopSeat = cleanSeatNumber.includes('-D');
      
      // If this table hasn't been initialized yet
      if (!tableGroups[tableLetter]) {
        tableGroups[tableLetter] = {
          regularSeats: [],
          desktopSeats: []
        };
      }
      
      // Add seat to the appropriate array
      if (isDesktopSeat) {
        tableGroups[tableLetter].desktopSeats.push({...seat, seatNumber: cleanSeatNumber});
      } else {
        tableGroups[tableLetter].regularSeats.push({...seat, seatNumber: cleanSeatNumber});
      }
    });
    
    // Sort seats within each table by their number
    Object.keys(tableGroups).forEach(tableLetter => {
      const sortBySeatNumber = (a, b) => {
        // Extract the numeric part for regular seats (e.g. "A1" -> "1")
        // or for desktop seats (e.g. "A1-D" -> "1")
        const aNum = parseInt(a.seatNumber.includes('-D') 
          ? a.seatNumber.split('-D')[0].substring(1) 
          : a.seatNumber.substring(1));
        const bNum = parseInt(b.seatNumber.includes('-D') 
          ? b.seatNumber.split('-D')[0].substring(1) 
          : b.seatNumber.substring(1));
        return aNum - bNum;
      };
      
      tableGroups[tableLetter].regularSeats.sort(sortBySeatNumber);
      tableGroups[tableLetter].desktopSeats.sort(sortBySeatNumber);
    });
    
    return tableGroups;
  };
  
  const tableGroups = groupSeatsByTable();
  const tableLetters = Object.keys(tableGroups).sort();

  // Calculate time to availability for seat coloring
  const getTimeToAvailability = (availabilityTime) => {
    if (!availabilityTime) return 0;
    
    const now = new Date();
    const availTime = new Date(availabilityTime);
    const hoursToAvail = (availTime - now) / (1000 * 60 * 60);
    
    // Return a value between 0 and 1, where 1 means 8+ hours wait and 0 is available now
    return Math.min(hoursToAvail / 8, 1);
  };

  // Generate a color based on availability time (darker red = longer wait)
  const getAvailabilityColor = (availabilityTime) => {
    const timeRatio = getTimeToAvailability(availabilityTime);
    
    // RGB values for occupied seats, where higher timeRatio means darker red
    const r = 239 - Math.floor(timeRatio * 100); // Ranges from 239 to 139
    const g = 68 - Math.floor(timeRatio * 40);   // Ranges from 68 to 28
    const b = 68 - Math.floor(timeRatio * 40);   // Ranges from 68 to 28
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Render a single seat
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

  // If no seats are provided or all are filtered out
  if (!tableLetters.length) {
    return (
      <div className="no-seats-message">
        <p>No seats available with the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="seats-grid-container">
      {tableLetters.map(tableLetter => (
        <div key={tableLetter} className="table-section">
          <h3 className="table-heading">Table {tableLetter}</h3>
          <div className="table-container">
            <div className="table-grid">
              {/* Regular seats row */}
              <div className="seat-row">
                {tableGroups[tableLetter].regularSeats.map(seat => renderSeat(seat))}
              </div>
              
              {/* Divider between regular and desktop seats */}
              <div className="table-divider"></div>
              
              {/* Desktop seats row */}
              <div className="seat-row">
                {tableGroups[tableLetter].desktopSeats.map(seat => renderSeat(seat))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

SeatGrid.propTypes = {
  seats: PropTypes.array.isRequired,
  onSeatSelect: PropTypes.func.isRequired,
  favoriteSeats: PropTypes.array.isRequired,
  userBookings: PropTypes.array
};

export default SeatGrid;
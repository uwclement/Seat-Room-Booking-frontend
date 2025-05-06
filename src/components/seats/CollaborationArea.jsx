import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './CollaborationArea.css';

const CollaborationArea = ({ seats, onSeatSelect, favoriteSeats, userBookings = [] }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);

  // Function to check if seat is available
  const isSeatAvailable = (seat) => {
    // If the seat has an 'available' property, use that
    if (typeof seat.available === 'boolean') {
      return seat.available;
    }
    
    // Otherwise, check if there are any active bookings for this seat
    return !userBookings.some(booking => 
      booking.seatId === seat.id && 
      (booking.status === 'RESERVED' || booking.status === 'CHECKED_IN')
    );
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

  // Group seats by their location in the collaboration area
  const groupSeatsByLocation = () => {
    const topSeats = [];
    const bottomSeats = [];
    const leftColumnSeats = [];
    const rightColumnSeats = [];

    seats.forEach(seat => {
      const seatId = seat.seatNumber;
      
      // Top row (T1, T2)
      if (seatId.startsWith('C')) {
        topSeats.push(seat);
      }
      // Bottom row (B1, B2)
      else if (seatId.startsWith('B')) {
        bottomSeats.push(seat);
      }
      // Left column (L1-1, L1-2, etc.)
      else if (seatId.startsWith('L')) {
        leftColumnSeats.push(seat);
      }
      // Right column (R1-1, R1-2, etc.)
      else if (seatId.startsWith('R')) {
        rightColumnSeats.push(seat);
      }
    });

    // Sort each group by number
    const sortByNumber = (a, b) => {
      const numA = a.seatNumber.match(/\d+/g);
      const numB = b.seatNumber.match(/\d+/g);
      
      if (numA && numB) {
        for (let i = 0; i < Math.min(numA.length, numB.length); i++) {
          const diff = parseInt(numA[i]) - parseInt(numB[i]);
          if (diff !== 0) return diff;
        }
      }
      return 0;
    };

    return {
      topSeats: topSeats.sort(sortByNumber),
      leftColumnSeats: leftColumnSeats.sort(sortByNumber),
      rightColumnSeats: rightColumnSeats.sort(sortByNumber),
      bottomSeats: bottomSeats.sort(sortByNumber)
    };
  };

  // Group the seats
  const { topSeats, leftColumnSeats, rightColumnSeats, bottomSeats } = groupSeatsByLocation();

  // Group the vertical tables into their specific tables
  const groupVerticalTables = (columnSeats) => {
    const tables = {};
    
    columnSeats.forEach(seat => {
      // Extract table number from seat ID (e.g. "L1-2" -> tableNum = 1)
      const parts = seat.seatNumber.split('-');
      const prefix = parts[0].charAt(0); // L or R
      const tableNum = parseInt(parts[0].substring(1));
      
      const tableKey = `${prefix}${tableNum}`;
      
      if (!tables[tableKey]) {
        tables[tableKey] = [];
      }
      
      tables[tableKey].push(seat);
    });
    
    // Sort seats within each table
    Object.keys(tables).forEach(tableKey => {
      tables[tableKey].sort((a, b) => {
        const seatNumA = parseInt(a.seatNumber.split('-')[1]);
        const seatNumB = parseInt(b.seatNumber.split('-')[1]);
        return seatNumA - seatNumB;
      });
    });
    
    // Convert to array of tables sorted by table number
    return Object.keys(tables)
      .sort((a, b) => {
        const numA = parseInt(a.substring(1));
        const numB = parseInt(b.substring(1));
        return numA - numB;
      })
      .map(tableKey => ({
        tableKey,
        seats: tables[tableKey]
      }));
  };

  const leftTables = groupVerticalTables(leftColumnSeats);
  const rightTables = groupVerticalTables(rightColumnSeats);

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

  // Render a seat with status and icon
  const renderSeat = (seat) => {
    if (!seat) return null;
    
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
          <i className="favorite-icon fa-solid fa-star"></i>
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
  if (seats.length === 0) {
    return (
      <div className="no-seats-message">
        <p>No collaboration seats available with the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="collab-layout">
      {/* Top horizontal table */}
      <div className="horizontal-table top-table">
        {topSeats.map(seat => renderSeat(seat))}
      </div>
      
      {/* Vertical tables container */}
      <div className="vertical-tables-container">
        {/* Left column of tables */}
        <div className="table-column left-column">
          {leftTables.map(table => (
            <div key={table.tableKey} className="vertical-table">
              {table.seats.map(seat => renderSeat(seat))}
            </div>
          ))}
        </div>
        
        {/* Right column of tables */}
        <div className="table-column left-column">
          {rightTables.map(table => (
            <div key={table.tableKey} className="vertical-table">
              {table.seats.map(seat => renderSeat(seat))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom horizontal table */}
      <div className="horizontal-table bottom-table">
        {bottomSeats.map(seat => renderSeat(seat))}
      </div>
    </div>
  );
};

CollaborationArea.propTypes = {
  seats: PropTypes.array.isRequired,
  onSeatSelect: PropTypes.func.isRequired,
  favoriteSeats: PropTypes.array.isRequired,
  userBookings: PropTypes.array
};

export default CollaborationArea;
import React from 'react';
import { useAdmin } from '../../../hooks/useAdmin';

const SeatStatusBadge = ({ seatId }) => {
  const { seats, handleDisableSeat, handleEnableSeat, disabledSeats } = useAdmin();


  
  const isDisabled = disabledSeats.some(seat => seat.id === seatId);
  
  if (isDisabled) {
    const disabledSeat = disabledSeats.find(seat => seat.id === seatId);
    const endDate = disabledSeat?.endDate ? new Date(disabledSeat.endDate) : null;
    const formattedDate = endDate ? 
      `${endDate.toLocaleDateString()} at ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 
      'Indefinite';
    

    
    return (
      <div className="seat-status disabled" title={`Maintenance until ${formattedDate}`}>
        <span className="status-dot"></span>
        <span className="status-text">Maintenance</span>
      </div>
    );
  }
  
  return (
    <div className="seat-status available" title="Available for bookings">
      <span className="status-dot"></span>
      <span className="status-text">Available</span>
    </div>
  );
};

export default SeatStatusBadge;
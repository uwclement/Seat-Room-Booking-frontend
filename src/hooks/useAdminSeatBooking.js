
import { useContext } from 'react';
import { AdminSeatBookingContext } from '../context/AdminSeatBookingContext';

export const useAdminSeatBooking = () => {
  const context = useContext(AdminSeatBookingContext);
  
  if (!context) {
    throw new Error('useAdminSeatBooking must be used within an AdminSeatBookingProvider');
  }
  
  return context;
};
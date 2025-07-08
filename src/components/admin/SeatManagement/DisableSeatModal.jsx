import React, { useState } from 'react';
import { useAdmin } from '../../../hooks/useAdmin';

const DisableSeatModal = ({ isOpen, onClose }) => {
  const { selectedSeats, handleDisableSeats } = useAdmin();
  
  const [reason, setReason] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('17:00');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Combine date and time for the end date
    const combinedEndDateTime = endDate ? `${endDate}T${endTime}:00` : null;
    
    handleDisableSeats(reason, combinedEndDateTime);
    onClose();
    
    // Reset form
    setReason('');
    setEndDate('');
    setEndTime('17:00');
  };
  
  if (!isOpen) return null;
  
  // Calculate minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  
  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Disable Seats for Maintenance</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="alert alert-info">
            You are about to disable {selectedSeats.length} seat(s) for maintenance.
          </div>
          
          <form onSubmit={handleSubmit}>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Disable Seats
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DisableSeatModal;
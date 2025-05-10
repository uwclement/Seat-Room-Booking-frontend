import React, { useState } from 'react';
import { useAdmin } from '../../../hooks/useAdmin';
import DisableSeatModal from './DisableSeatModal';

const SeatActions = () => {
  const { 
    selectedSeats, 
    selectAllSeats, 
    clearSelection, 
    handleBulkUpdate,
    handleEnableSeats,
    seats
  } = useAdmin();

  const [showDisableModal, setShowDisableModal] = useState(false);

  const handleToggleDesktopBulk = () => {
    handleBulkUpdate({ toggleDesktop: true });
  };

  return (
    <div className="seat-actions">
      <div className="selection-tools">
        <button 
          className="btn btn-outline-primary" 
          onClick={selectAllSeats}
        >
          Select All
        </button>
        {selectedSeats.length > 0 && (
          <button 
            className="btn btn-outline-secondary" 
            onClick={clearSelection}
          >
            Clear Selection
          </button>
        )}
        <div className="selection-count">
          {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={handleToggleDesktopBulk}
          >
            Toggle Desktop
          </button>
          <button 
            className="btn btn-warning"
            onClick={() => setShowDisableModal(true)}
          >
            Disable for Maintenance
          </button>
          <button 
            className="btn btn-success"
            onClick={handleEnableSeats}
          >
            Enable Seats
          </button>
        </div>
      )}

      <DisableSeatModal 
        isOpen={showDisableModal} 
        onClose={() => setShowDisableModal(false)} 
      />
    </div>
  );
};

export default SeatActions;
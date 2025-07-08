import React, { useState } from 'react';
import { useAdminSeatBooking } from '../../../hooks/useAdminSeatBooking';

const BookingActions = () => {
  const {
    selectedBookings,
    selectAllBookings,
    clearSelection,
    handleBulkCancel,
    getFilteredBookings
  } = useAdminSeatBooking();

  const [showBulkCancelModal, setShowBulkCancelModal] = useState(false);
  const [bulkCancelReason, setBulkCancelReason] = useState('');

  const filteredBookings = getFilteredBookings();
  const cancellableBookings = filteredBookings.filter(
    booking => booking.status === 'RESERVED' || booking.status === 'CHECKED_IN'
  );

  const handleBulkCancelSubmit = async () => {
    await handleBulkCancel(bulkCancelReason);
    setShowBulkCancelModal(false);
    setBulkCancelReason('');
  };

  return (
    <div className="booking-actions">
      <div className="selection-tools">
        <button 
          className="btn btn-outline-primary" 
          onClick={selectAllBookings}
          disabled={filteredBookings.length === 0}
        >
          Select All
        </button>
        
        {selectedBookings.length > 0 && (
          <button 
            className="btn btn-outline-secondary" 
            onClick={clearSelection}
          >
            Clear Selection
          </button>
        )}
        
        <div className="selection-count">
          {selectedBookings.length} booking{selectedBookings.length !== 1 ? 's' : ''} selected
        </div>
      </div>

      {selectedBookings.length > 0 && (
        <div className="action-buttons">
          <button 
            className="btn btn-danger"
            onClick={() => setShowBulkCancelModal(true)}
            disabled={selectedBookings.length === 0}
          >
            <i className="fas fa-times"></i> 
            Bulk Cancel ({selectedBookings.length})
          </button>
        </div>
      )}

      {/* Bulk Cancel Modal */}
      {showBulkCancelModal && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Bulk Cancel Bookings</h3>
              <button 
                className="close-button" 
                onClick={() => setShowBulkCancelModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <p>
                You are about to cancel <strong>{selectedBookings.length}</strong> booking(s).
                This action cannot be undone.
              </p>

              <div className="form-group">
                <label>Cancellation Reason (Optional)</label>
                <textarea
                  value={bulkCancelReason}
                  onChange={(e) => setBulkCancelReason(e.target.value)}
                  className="form-control"
                  rows="3"
                  placeholder="Enter reason for bulk cancellation (e.g., Emergency evacuation, System maintenance, etc.)"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowBulkCancelModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleBulkCancelSubmit}
              >
                <i className="fas fa-times"></i>
                Confirm Bulk Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingActions;
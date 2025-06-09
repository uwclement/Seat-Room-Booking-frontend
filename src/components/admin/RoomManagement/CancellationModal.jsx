import React, { useState } from 'react';
import { useAdminRoomBooking } from '../../../context/AdminRoomBookingContext';
import {
  cancelBookingAsAdmin,
  bulkCancelBookingsAsAdmin
} from '../../../api/adminroombooking';

const CancellationModal = ({ booking, selectedBookings, onClose }) => {
  const { updateBookingInState, removeBookingFromState, showSuccess, showError, clearSelection } = useAdminRoomBooking();
  
  const [cancellationReason, setCancellationReason] = useState('');
  const [notifyParticipants, setNotifyParticipants] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Determine if this is bulk operation or single booking
  const isBulkOperation = selectedBookings && selectedBookings.length > 1;
  const bookingsToCancel = isBulkOperation ? selectedBookings : [booking?.id];

  const handleSubmit = async () => {
    if (!cancellationReason.trim()) {
      showError('Please provide a reason for cancellation');
      return;
    }

    setProcessing(true);
    try {
      if (isBulkOperation) {
        // Bulk cancellation
        const result = await bulkCancelBookingsAsAdmin(
          selectedBookings,
          cancellationReason,
          notifyParticipants
        );
        
        // Update booking states
        selectedBookings.forEach(bookingId => {
          updateBookingInState(bookingId, {
            status: 'CANCELLED',
            adminCancelledAt: new Date().toISOString(),
            adminCancellationReason: cancellationReason
          });
        });

        showSuccess(`${result.successCount} bookings cancelled successfully`);
        clearSelection();
      } else {
        // Single booking cancellation
        await cancelBookingAsAdmin(
          booking.id,
          cancellationReason,
          notifyParticipants
        );
        
        updateBookingInState(booking.id, {
          status: 'CANCELLED',
          adminCancelledAt: new Date().toISOString(),
          adminCancellationReason: cancellationReason
        });

        showSuccess('Booking cancelled successfully');
      }

      onClose();
    } catch (error) {
      showError('Failed to cancel booking(s)');
    } finally {
      setProcessing(false);
    }
  };

  const getAffectedBookings = () => {
    if (isBulkOperation) {
      return `${selectedBookings.length} selected bookings`;
    } else {
      return booking ? `"${booking.title}"` : '1 booking';
    }
  };

  const getTotalParticipants = () => {
    if (isBulkOperation) {
      // This would need to be calculated from the actual booking data
      return 'multiple participants';
    } else {
      const participantCount = booking?.participantCount || 0;
      return participantCount > 0 ? `${participantCount} participants` : 'no participants';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal cancellation-modal">
        <div className="modal-header">
          <h3>
            <i className="fas fa-exclamation-triangle text-warning"></i>
            Cancel {isBulkOperation ? 'Bookings' : 'Booking'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="cancellation-warning">
            <div className="warning-content">
              <h4>Are you sure you want to cancel {getAffectedBookings()}?</h4>
              <p>
                This action cannot be undone. The affected users and {getTotalParticipants()} will be notified.
              </p>
            </div>
          </div>

          {/* Booking Details */}
          {!isBulkOperation && booking && (
            <div className="booking-details">
              <h4>Booking Details</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Title:</label>
                  <span>{booking.title}</span>
                </div>
                <div className="detail-item">
                  <label>Room:</label>
                  <span>{booking.room?.name} ({booking.room?.roomNumber})</span>
                </div>
                <div className="detail-item">
                  <label>Organizer:</label>
                  <span>{booking.user?.fullName}</span>
                </div>
                <div className="detail-item">
                  <label>Date & Time:</label>
                  <span>
                    {new Date(booking.startTime).toLocaleDateString()} at {' '}
                    {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status-badge ${booking.status?.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Operation Info */}
          {isBulkOperation && (
            <div className="bulk-info">
              <h4>Bulk Cancellation</h4>
              <p>
                You are about to cancel <strong>{selectedBookings.length}</strong> bookings.
                All affected users will receive cancellation notifications.
              </p>
            </div>
          )}

          {/* Cancellation Reason */}
          <div className="cancellation-reason">
            <h4>Cancellation Reason <span className="required">*</span></h4>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter the reason for cancelling this booking..."
              className="form-control"
              rows="4"
              required
            />
            <div className="help-text">
              This reason will be included in the notification sent to users.
            </div>
          </div>

          {/* Notification Options */}
          <div className="notification-options">
            <h4>Notification Settings</h4>
            <label className="checkbox-label">
              <input 
                type="checkbox"
                checked={notifyParticipants}
                onChange={(e) => setNotifyParticipants(e.target.checked)}
              />
              <span className="checkmark"></span>
              Notify participants and organizers about the cancellation
            </label>
            <div className="help-text">
              {notifyParticipants 
                ? "Email notifications will be sent to all affected users."
                : "No notifications will be sent. Users will only see the cancellation when they check their bookings."
              }
            </div>
          </div>

          {/* Impact Summary */}
          <div className="impact-summary">
            <h4>Impact Summary</h4>
            <div className="impact-item">
              <i className="fas fa-calendar-times text-danger"></i>
              <span>{isBulkOperation ? `${selectedBookings.length} bookings` : '1 booking'} will be cancelled</span>
            </div>
            <div className="impact-item">
              <i className="fas fa-users text-warning"></i>
              <span>Users will be notified {notifyParticipants ? 'immediately' : 'when they next check their bookings'}</span>
            </div>
            <div className="impact-item">
              <i className="fas fa-door-open text-info"></i>
              <span>Room slots will become available for new bookings</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
            disabled={processing}
          >
            <i className="fas fa-arrow-left"></i>
            Cancel
          </button>
          
          <button 
            className="btn btn-danger"
            onClick={handleSubmit}
            disabled={processing || !cancellationReason.trim()}
          >
            {processing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Cancelling...
              </>
            ) : (
              <>
                <i className="fas fa-ban"></i>
                Confirm Cancellation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;
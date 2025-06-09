import React, { useState } from 'react';
import { useAdminRoomBooking } from '../../../context/AdminRoomBookingContext';
import {
  bulkApproveRejectBookings,
  approveAllPendingBookings,
  approveBookingsWithinCapacity
} from '../../../api/adminroombooking';

const BookingActions = ({ selectedBookings, onEquipmentManage, onCancelBookings }) => {
  const {
    allBookings,
    pendingBookings,
    updateBookingInState,
    removeBookingFromState,
    clearSelection,
    showSuccess,
    showError,
    refreshCurrentView
  } = useAdminRoomBooking();

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkReason, setBulkReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const selectedBookingObjects = allBookings.filter(booking => 
    selectedBookings.includes(booking.id)
  );

  const canApprove = selectedBookingObjects.some(booking => booking.status === 'PENDING');
  const canReject = selectedBookingObjects.some(booking => booking.status === 'PENDING');
  const canCancel = selectedBookingObjects.some(booking => 
    !['CANCELLED', 'COMPLETED'].includes(booking.status)
  );
  const hasEquipmentRequests = selectedBookingObjects.some(booking => 
    booking.hasEquipmentRequests
  );

  const handleBulkApproval = async (approved) => {
    setBulkAction(approved ? 'approve' : 'reject');
    setShowBulkModal(true);
  };

  const executeBulkAction = async () => {
    if (!bulkAction) return;
    
    setProcessing(true);
    try {
      const approved = bulkAction === 'approve';
      const result = await bulkApproveRejectBookings(
        selectedBookings, 
        approved, 
        bulkReason || null
      );

      // Update booking states
      selectedBookings.forEach(bookingId => {
        updateBookingInState(bookingId, {
          status: approved ? 'CONFIRMED' : 'REJECTED',
          approvedAt: new Date().toISOString(),
          rejectionReason: approved ? null : bulkReason
        });
      });

      showSuccess(`${result.successCount} bookings ${approved ? 'approved' : 'rejected'} successfully`);
      clearSelection();
      setShowBulkModal(false);
      setBulkReason('');
      
    } catch (error) {
      showError(`Failed to ${bulkAction} bookings`);
    } finally {
      setProcessing(false);
    }
  };

  const handleQuickApproveAll = async () => {
    setProcessing(true);
    try {
      const result = await approveAllPendingBookings();
      showSuccess(`${result.successCount} pending bookings approved`);
      await refreshCurrentView();
    } catch (error) {
      showError('Failed to approve all pending bookings');
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveWithinCapacity = async () => {
    setProcessing(true);
    try {
      const result = await approveBookingsWithinCapacity();
      showSuccess(`${result.successCount} bookings approved (capacity requirements met)`);
      await refreshCurrentView();
    } catch (error) {
      showError('Failed to approve bookings within capacity');
    } finally {
      setProcessing(false);
    }
  };

  const getSelectionSummary = () => {
    const statusCounts = selectedBookingObjects.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    const summaryItems = Object.entries(statusCounts).map(([status, count]) => 
      `${count} ${status.toLowerCase()}`
    );

    return summaryItems.join(', ');
  };

  return (
    <>
      <div className="booking-actions-panel">
        <div className="actions-header">
          <div className="selection-info">
            <i className="fas fa-check-square"></i>
            <span className="selection-count">{selectedBookings.length} selected</span>
            <span className="selection-summary">({getSelectionSummary()})</span>
          </div>
          
          <button 
            className="btn btn-sm btn-outline"
            onClick={clearSelection}
          >
            <i className="fas fa-times"></i>
            Clear Selection
          </button>
        </div>

        <div className="bulk-actions">
          <div className="action-group approval-actions">
            <label>Approval Actions:</label>
            <button 
              className="btn btn-success"
              onClick={() => handleBulkApproval(true)}
              disabled={!canApprove || processing}
            >
              <i className="fas fa-check"></i>
              Bulk Approve ({selectedBookingObjects.filter(b => b.status === 'PENDING').length})
            </button>
            
            <button 
              className="btn btn-danger"
              onClick={() => handleBulkApproval(false)}
              disabled={!canReject || processing}
            >
              <i className="fas fa-times"></i>
              Bulk Reject ({selectedBookingObjects.filter(b => b.status === 'PENDING').length})
            </button>
          </div>

          <div className="action-group equipment-actions">
            <label>Equipment Actions:</label>
            <button 
              className="btn btn-primary"
              onClick={onEquipmentManage}
              disabled={!hasEquipmentRequests || processing}
            >
              <i className="fas fa-tools"></i>
              Manage Equipment ({selectedBookingObjects.filter(b => b.hasEquipmentRequests).length})
            </button>
          </div>

          <div className="action-group cancellation-actions">
            <label>Cancellation Actions:</label>
            <button 
              className="btn btn-warning"
              onClick={onCancelBookings}
              disabled={!canCancel || processing}
            >
              <i className="fas fa-ban"></i>
              Bulk Cancel ({selectedBookingObjects.filter(b => !['CANCELLED', 'COMPLETED'].includes(b.status)).length})
            </button>
          </div>
        </div>

        <div className="quick-actions">
          <div className="quick-actions-header">
            <label>Quick Actions:</label>
          </div>
          
          <div className="quick-action-buttons">
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleQuickApproveAll}
              disabled={pendingBookings.length === 0 || processing}
            >
              <i className="fas fa-check-double"></i>
              Approve All Pending ({pendingBookings.length})
            </button>
            
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleApproveWithinCapacity}
              disabled={processing}
            >
              <i className="fas fa-users-check"></i>
              Approve Within Capacity
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Confirmation Modal */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal bulk-action-modal">
            <div className="modal-header">
              <h3>
                {bulkAction === 'approve' ? 'Bulk Approve Bookings' : 'Bulk Reject Bookings'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowBulkModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="confirmation-message">
                <p>
                  You are about to <strong>{bulkAction}</strong> {selectedBookings.length} booking(s).
                </p>
                
                <div className="affected-bookings">
                  <h4>Affected Bookings:</h4>
                  <ul>
                    {selectedBookingObjects
                      .filter(booking => booking.status === 'PENDING')
                      .slice(0, 5)
                      .map(booking => (
                        <li key={booking.id}>
                          {booking.title} - {booking.room.name} 
                          ({new Date(booking.startTime).toLocaleDateString()})
                        </li>
                      ))}
                    {selectedBookingObjects.filter(booking => booking.status === 'PENDING').length > 5 && (
                      <li>... and {selectedBookingObjects.filter(booking => booking.status === 'PENDING').length - 5} more</li>
                    )}
                  </ul>
                </div>

                {bulkAction === 'reject' && (
                  <div className="reason-input">
                    <label htmlFor="bulkReason">Rejection Reason:</label>
                    <textarea
                      id="bulkReason"
                      value={bulkReason}
                      onChange={(e) => setBulkReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      className="form-control"
                      rows="3"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowBulkModal(false)}
                disabled={processing}
              >
                Cancel
              </button>
              
              <button 
                className={`btn ${bulkAction === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={executeBulkAction}
                disabled={processing || (bulkAction === 'reject' && !bulkReason.trim())}
              >
                {processing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className={`fas ${bulkAction === 'approve' ? 'fa-check' : 'fa-times'}`}></i>
                    Confirm {bulkAction === 'approve' ? 'Approval' : 'Rejection'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingActions;
import React, { useState } from 'react';
import { useAdminRoomBooking } from '../../../context/AdminRoomBookingContext';
import {
  approveRejectEquipment,
  bulkApproveRejectEquipment,
  getBookingEquipmentRequests
} from '../../../api/adminroombooking';

const EquipmentApprovalModal = ({ booking, selectedBookings, onClose }) => {
  const { updateBookingInState, showSuccess, showError } = useAdminRoomBooking();
  
  const [action, setAction] = useState('approve'); // 'approve' or 'reject'
  const [reason, setReason] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  // Determine if this is bulk operation or single booking
  const isBulkOperation = selectedBookings && selectedBookings.length > 1;
  const bookingsToProcess = isBulkOperation ? selectedBookings : [booking?.id];

  // Get all equipment requests across selected bookings
  const getAllEquipmentRequests = () => {
    if (isBulkOperation) {
      // For bulk operations, we'll need to get equipment from context
      // This is a simplified version - in real implementation, you'd fetch this data
      return [];
    } else {
      return booking?.equipmentApprovals || [];
    }
  };

  const equipmentRequests = getAllEquipmentRequests();

  const handleEquipmentToggle = (equipmentId) => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipmentId)) {
        return prev.filter(id => id !== equipmentId);
      } else {
        return [...prev, equipmentId];
      }
    });
  };

  const handleSelectAllToggle = () => {
    if (selectAll) {
      setSelectedEquipment([]);
    } else {
      setSelectedEquipment(equipmentRequests.map(eq => eq.equipmentId));
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = async () => {
    if (selectedEquipment.length === 0) {
      showError('Please select at least one equipment item');
      return;
    }

    if (action === 'reject' && !reason.trim()) {
      showError('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const approved = action === 'approve';

      if (isBulkOperation) {
        // Bulk equipment approval
        await bulkApproveRejectEquipment(
          bookingsToProcess,
          selectedEquipment,
          approved,
          reason || null
        );
        
        showSuccess(`Equipment ${approved ? 'approved' : 'rejected'} for ${bookingsToProcess.length} bookings`);
      } else {
        // Single booking equipment approval
        for (const equipmentId of selectedEquipment) {
          await approveRejectEquipment(
            booking.id,
            equipmentId,
            approved,
            reason || null
          );
        }
        
        showSuccess(`${selectedEquipment.length} equipment items ${approved ? 'approved' : 'rejected'}`);
      }

      onClose();
    } catch (error) {
      showError(`Failed to ${action} equipment requests`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal large equipment-approval-modal">
        <div className="modal-header">
          <h3>
            {isBulkOperation ? 'Bulk Equipment Management' : 'Equipment Approval'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {isBulkOperation ? (
            <div className="bulk-info">
              <p>Managing equipment for <strong>{bookingsToProcess.length}</strong> selected bookings.</p>
              <div className="bulk-warning">
                <i className="fas fa-info-circle"></i>
                Bulk equipment management will apply the selected action to all equipment requests across all selected bookings.
              </div>
            </div>
          ) : (
            <div className="booking-info">
              <h4>{booking?.title}</h4>
              <p>{booking?.room?.name} - {booking?.user?.fullName}</p>
            </div>
          )}

          {/* Action Selection */}
          <div className="action-selection">
            <h4>Action</h4>
            <div className="action-buttons">
              <button 
                className={`btn ${action === 'approve' ? 'btn-success active' : 'btn-outline'}`}
                onClick={() => setAction('approve')}
              >
                <i className="fas fa-check"></i>
                Approve Equipment
              </button>
              <button 
                className={`btn ${action === 'reject' ? 'btn-danger active' : 'btn-outline'}`}
                onClick={() => setAction('reject')}
              >
                <i className="fas fa-times"></i>
                Reject Equipment
              </button>
            </div>
          </div>

          {/* Equipment Selection */}
          <div className="equipment-selection">
            <div className="equipment-header">
              <h4>Equipment Items</h4>
              {equipmentRequests.length > 1 && (
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={handleSelectAllToggle}
                >
                  {selectAll ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {equipmentRequests.length === 0 ? (
              <div className="no-equipment">
                <p>No equipment requests found for the selected booking(s).</p>
              </div>
            ) : (
              <div className="equipment-list">
                {equipmentRequests.map((equipment) => (
                  <div 
                    key={equipment.equipmentId} 
                    className={`equipment-item ${selectedEquipment.includes(equipment.equipmentId) ? 'selected' : ''}`}
                  >
                    <label className="equipment-checkbox">
                      <input 
                        type="checkbox"
                        checked={selectedEquipment.includes(equipment.equipmentId)}
                        onChange={() => handleEquipmentToggle(equipment.equipmentId)}
                      />
                      <span className="checkmark"></span>
                    </label>
                    
                    <div className="equipment-details">
                      <div className="equipment-name">{equipment.equipmentName}</div>
                      <div className="equipment-status">
                        Status: {equipment.approved === null ? 'Pending' : 
                                equipment.approved ? 'Approved' : 'Rejected'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reason Input (for rejection) */}
          {action === 'reject' && (
            <div className="reason-section">
              <h4>Rejection Reason</h4>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for rejecting equipment..."
                className="form-control"
                rows="3"
                required
              />
            </div>
          )}

          {/* Summary */}
          <div className="action-summary">
            <div className="summary-item">
              <strong>Action:</strong> {action === 'approve' ? 'Approve' : 'Reject'}
            </div>
            <div className="summary-item">
              <strong>Equipment Items:</strong> {selectedEquipment.length} selected
            </div>
            {isBulkOperation && (
              <div className="summary-item">
                <strong>Bookings:</strong> {bookingsToProcess.length} bookings
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
            disabled={processing}
          >
            Cancel
          </button>
          
          <button 
            className={`btn ${action === 'approve' ? 'btn-success' : 'btn-danger'}`}
            onClick={handleSubmit}
            disabled={processing || selectedEquipment.length === 0 || (action === 'reject' && !reason.trim())}
          >
            {processing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Processing...
              </>
            ) : (
              <>
                <i className={`fas ${action === 'approve' ? 'fa-check' : 'fa-times'}`}></i>
                {action === 'approve' ? 'Approve' : 'Reject'} Selected Equipment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentApprovalModal;
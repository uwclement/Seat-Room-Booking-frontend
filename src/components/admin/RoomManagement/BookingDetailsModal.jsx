import React, { useState } from 'react';
import { 
  formatDateTime, 
  formatDuration, 
  formatBookingStatus,
  calculateCapacityPercentage,
  getCapacityWarningLevel 
} from '../../../api/adminroombooking';
import {
  approveRejectBooking,
  sendCustomReminder
} from '../../../api/adminroombooking';
import { useAdminRoomBooking } from '../../../context/AdminRoomBookingContext';

const BookingDetailsModal = ({ booking, onClose }) => {
  const { updateBookingInState, showSuccess, showError } = useAdminRoomBooking();
  
  const [activeTab, setActiveTab] = useState('details');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sendingReminder, setSendingReminder] = useState(false);
  const [processing, setProcessing] = useState(false);

  const startDateTime = formatDateTime(booking.startTime);
  const endDateTime = formatDateTime(booking.endTime);
  const statusInfo = formatBookingStatus(booking.status);

  const handleApprovalAction = (action) => {
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const executeApproval = async () => {
    setProcessing(true);
    try {
      const approved = approvalAction === 'approve';
      await approveRejectBooking(booking.id, approved, rejectionReason || null);
      
      updateBookingInState(booking.id, {
        status: approved ? 'CONFIRMED' : 'REJECTED',
        approvedAt: new Date().toISOString(),
        rejectionReason: approved ? null : rejectionReason
      });

      showSuccess(`Booking ${approved ? 'approved' : 'rejected'} successfully`);
      setShowApprovalModal(false);
      setRejectionReason('');
      
    } catch (error) {
      showError(`Failed to ${approvalAction} booking`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendReminder = async () => {
    if (!customMessage.trim()) {
      showError('Please enter a reminder message');
      return;
    }

    setSendingReminder(true);
    try {
      await sendCustomReminder(booking.id, customMessage, true);
      showSuccess('Reminder sent successfully');
      setCustomMessage('');
    } catch (error) {
      showError('Failed to send reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  const renderParticipantSummary = () => {
    if (!booking.participantSummary) return null;

    const { 
      totalInvited, 
      totalAccepted, 
      totalDeclined, 
      totalPending, 
      roomCapacity 
    } = booking.participantSummary;

    const confirmedCount = totalAccepted + 1; // +1 for organizer
    const percentage = calculateCapacityPercentage(confirmedCount, roomCapacity);
    const warningLevel = getCapacityWarningLevel(confirmedCount, roomCapacity);

    return (
      <div className="participant-summary">
        <h4>Participant Summary</h4>
        
        <div className="capacity-overview">
          <div className={`capacity-indicator large ${warningLevel}`}>
            <div className="capacity-bar">
              <div 
                className="capacity-fill" 
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            <div className="capacity-text">
              {confirmedCount} / {roomCapacity} participants ({percentage}%)
            </div>
          </div>
          
          {booking.hasCapacityWarning && (
            <div className="capacity-warning">
              <i className="fas fa-exclamation-triangle"></i>
              Room capacity not fully utilized
            </div>
          )}
        </div>

        <div className="participant-breakdown">
          <div className="participant-stat">
            <div className="stat-value">{totalInvited}</div>
            <div className="stat-label">Invited</div>
          </div>
          <div className="participant-stat accepted">
            <div className="stat-value">{totalAccepted}</div>
            <div className="stat-label">Accepted</div>
          </div>
          <div className="participant-stat declined">
            <div className="stat-value">{totalDeclined}</div>
            <div className="stat-label">Declined</div>
          </div>
          <div className="participant-stat pending">
            <div className="stat-value">{totalPending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>
    );
  };

  const renderEquipmentRequests = () => {
    if (!booking.hasEquipmentRequests) {
      return <p className="no-equipment">No equipment requested for this booking.</p>;
    }

    return (
      <div className="equipment-requests">
        <h4>Equipment Requests</h4>
        {booking.equipmentApprovals?.map((equipment) => (
          <div key={equipment.equipmentId} className="equipment-item">
            <div className="equipment-info">
              <span className="equipment-name">{equipment.equipmentName}</span>
              <span className={`equipment-status ${
                equipment.approved === null ? 'pending' : 
                equipment.approved ? 'approved' : 'rejected'
              }`}>
                {equipment.approved === null ? 'Pending' : 
                 equipment.approved ? 'Approved' : 'Rejected'}
              </span>
            </div>
            {equipment.rejectionReason && (
              <div className="rejection-reason">
                <strong>Reason:</strong> {equipment.rejectionReason}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderBookingTimeline = () => {
    const timeline = [];
    
    timeline.push({
      timestamp: booking.createdAt,
      event: 'Booking Created',
      icon: 'fa-plus',
      class: 'created'
    });

    if (booking.approvedAt) {
      timeline.push({
        timestamp: booking.approvedAt,
        event: booking.status === 'REJECTED' ? 'Booking Rejected' : 'Booking Approved',
        icon: booking.status === 'REJECTED' ? 'fa-times' : 'fa-check',
        class: booking.status === 'REJECTED' ? 'rejected' : 'approved',
        user: booking.approvedBy?.fullName
      });
    }

    if (booking.checkedInAt) {
      timeline.push({
        timestamp: booking.checkedInAt,
        event: 'Checked In',
        icon: 'fa-sign-in-alt',
        class: 'checked-in'
      });
    }

    return (
      <div className="booking-timeline">
        <h4>Booking Timeline</h4>
        <div className="timeline">
          {timeline.map((item, index) => (
            <div key={index} className={`timeline-item ${item.class}`}>
              <div className="timeline-icon">
                <i className={`fas ${item.icon}`}></i>
              </div>
              <div className="timeline-content">
                <div className="timeline-event">{item.event}</div>
                <div className="timeline-timestamp">
                  {formatDateTime(item.timestamp).full}
                </div>
                {item.user && (
                  <div className="timeline-user">by {item.user}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal large booking-details-modal">
          <div className="modal-header">
            <h2>Booking Details</h2>
            <button className="modal-close" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="modal-body">
            {/* Booking Header */}
            <div className="booking-header">
              <div className="booking-title-section">
                <h3>{booking.title}</h3>
                {booking.description && (
                  <p className="booking-description">{booking.description}</p>
                )}
                <div className="booking-meta">
                  <span className={`status-badge ${statusInfo.class}`}>
                    {statusInfo.label}
                  </span>
                  {booking.publicBooking && (
                    <span className="public-badge">Public</span>
                  )}
                </div>
              </div>
              
              <div className="booking-actions">
                {booking.status === 'PENDING' && (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={() => handleApprovalAction('approve')}
                    >
                      <i className="fas fa-check"></i>
                      Approve
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleApprovalAction('reject')}
                    >
                      <i className="fas fa-times"></i>
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button 
                className={`tab-button ${activeTab === 'participants' ? 'active' : ''}`}
                onClick={() => setActiveTab('participants')}
              >
                Participants
              </button>
              <button 
                className={`tab-button ${activeTab === 'equipment' ? 'active' : ''}`}
                onClick={() => setActiveTab('equipment')}
              >
                Equipment
              </button>
              <button 
                className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
                onClick={() => setActiveTab('timeline')}
              >
                Timeline
              </button>
              <button 
                className={`tab-button ${activeTab === 'actions' ? 'active' : ''}`}
                onClick={() => setActiveTab('actions')}
              >
                Actions
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'details' && (
                <div className="details-tab">
                  <div className="details-grid">
                    <div className="detail-section">
                      <h4>Booking Information</h4>
                      <div className="detail-item">
                        <label>Date & Time:</label>
                        <span>
                          {startDateTime.date} from {startDateTime.time} to {endDateTime.time}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>Duration:</label>
                        <span>{formatDuration(booking.durationHours)}</span>
                      </div>
                      <div className="detail-item">
                        <label>Created:</label>
                        <span>{formatDateTime(booking.createdAt).full}</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Room Information</h4>
                      <div className="detail-item">
                        <label>Room:</label>
                        <span>{booking.room.name} ({booking.room.roomNumber})</span>
                      </div>
                      <div className="detail-item">
                        <label>Location:</label>
                        <span>{booking.building}, Floor {booking.floor}</span>
                      </div>
                      <div className="detail-item">
                        <label>Capacity:</label>
                        <span>{booking.room.capacity} people</span>
                      </div>
                      <div className="detail-item">
                        <label>Category:</label>
                        <span>{booking.roomCategory}</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Organizer</h4>
                      <div className="detail-item">
                        <label>Name:</label>
                        <span>{booking.user.fullName}</span>
                      </div>
                      <div className="detail-item">
                        <label>Email:</label>
                        <span>{booking.user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'participants' && (
                <div className="participants-tab">
                  {renderParticipantSummary()}
                </div>
              )}

              {activeTab === 'equipment' && (
                <div className="equipment-tab">
                  {renderEquipmentRequests()}
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="timeline-tab">
                  {renderBookingTimeline()}
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="actions-tab">
                  <div className="action-section">
                    <h4>Send Custom Reminder</h4>
                    <div className="reminder-form">
                      <textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Enter reminder message..."
                        className="form-control"
                        rows="3"
                      />
                      <button 
                        className="btn btn-primary"
                        onClick={handleSendReminder}
                        disabled={!customMessage.trim() || sendingReminder}
                      >
                        {sendingReminder ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane"></i>
                            Send Reminder
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Approval Confirmation Modal */}
      {showApprovalModal && (
        <div className="modal-overlay">
          <div className="modal approval-modal">
            <div className="modal-header">
              <h3>{approvalAction === 'approve' ? 'Approve Booking' : 'Reject Booking'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowApprovalModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <p>
                Are you sure you want to <strong>{approvalAction}</strong> this booking?
              </p>
              
              <div className="booking-summary">
                <strong>{booking.title}</strong><br />
                {booking.room.name} on {startDateTime.date} at {startDateTime.time}
              </div>

              {approvalAction === 'reject' && (
                <div className="reason-input">
                  <label htmlFor="rejectionReason">Rejection Reason:</label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="form-control"
                    rows="3"
                  />
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowApprovalModal(false)}
                disabled={processing}
              >
                Cancel
              </button>
              
              <button 
                className={`btn ${approvalAction === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={executeApproval}
                disabled={processing || (approvalAction === 'reject' && !rejectionReason.trim())}
              >
                {processing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className={`fas ${approvalAction === 'approve' ? 'fa-check' : 'fa-times'}`}></i>
                    Confirm {approvalAction === 'approve' ? 'Approval' : 'Rejection'}
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

export default BookingDetailsModal;
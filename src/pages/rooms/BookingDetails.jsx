// src/pages/rooms/BookingDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useRoom } from '../../context/RoomBookingContext';
import { 
  getRoomBookingById, 
  updateRoomBooking, 
  cancelRoomBooking, 
  checkInToRoomBooking,
  inviteUsersToBooking,
  removeUserFromBooking,
  requestToJoinBooking
} from '../../api/roomBooking';
 import './BookingDetails.css';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { updateBooking, removeBooking } = useRoom();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  
  // UPDATED: Enhanced invite users state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteIdentifiers, setInviteIdentifiers] = useState(''); // NEW: Separate state for identifiers

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

    
  const loadBookingDetails = async () => {
  try {
    setLoading(true);
    setError(''); // Clear previous errors
    
    console.log('Loading booking details for ID:', bookingId); // Debug log
    
    const bookingData = await getRoomBookingById(bookingId);
    
    console.log('Loaded booking data:', bookingData); // Debug log
    
    setBooking(bookingData);
    setEditData({
      title: bookingData.title,
      description: bookingData.description || '',
      maxParticipants: bookingData.maxParticipants,
      isPublic: bookingData.isPublic,
      allowJoining: bookingData.allowJoining
    });
  } catch (err) {
    console.error('Error loading booking details:', err);
    
    let errorMessage = 'Failed to load booking details';
    
    if (err.response?.status === 404) {
      errorMessage = 'Booking not found';
    } else if (err.response?.status === 403) {
      errorMessage = 'You are not authorized to view this booking';
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setActionLoading(prev => ({ ...prev, cancel: true }));
    
    try {
      await cancelRoomBooking(bookingId);
      removeBooking(bookingId);
      setSuccess('Booking cancelled successfully');
      setTimeout(() => navigate('/room-bookings'), 2000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking');
    } finally {
      setActionLoading(prev => ({ ...prev, cancel: false }));
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(prev => ({ ...prev, checkin: true }));
    
    try {
      await checkInToRoomBooking(bookingId);
      const updatedBooking = { 
        ...booking, 
        status: 'CHECKED_IN', 
        checkedInAt: new Date().toISOString() 
      };
      setBooking(updatedBooking);
      updateBooking(bookingId, updatedBooking);
      setSuccess('Checked in successfully!');
    } catch (err) {
      console.error('Error checking in:', err);
      setError('Failed to check in');
    } finally {
      setActionLoading(prev => ({ ...prev, checkin: false }));
    }
  };

  const handleUpdateBooking = async () => {
    setActionLoading(prev => ({ ...prev, update: true }));
    
    try {
      const updatedBooking = await updateRoomBooking(bookingId, editData);
      setBooking(updatedBooking);
      updateBooking(bookingId, updatedBooking);
      setIsEditing(false);
      setSuccess('Booking updated successfully!');
    } catch (err) {
      console.error('Error updating booking:', err);
      setError('Failed to update booking');
    } finally {
      setActionLoading(prev => ({ ...prev, update: false }));
    }
  };

  // invite users function
   const handleInviteUsers = async () => {
  if (!inviteEmails.trim() && !inviteIdentifiers.trim()) {
    setError('Please enter email addresses or studentIDs');
    return;
  }
  
  setActionLoading(prev => ({ ...prev, invite: true }));
  setError('');
  
  try {
    const inviteData = {};
    
    if (inviteEmails.trim()) {
      inviteData.invitedEmails = inviteEmails.split(',').map(email => email.trim()).filter(Boolean);
    }
    
    if (inviteIdentifiers.trim()) {
      inviteData.invitedUserIdentifiers = inviteIdentifiers.split(',').map(id => id.trim()).filter(Boolean);
    }
    
    await inviteUsersToBooking(bookingId, inviteData);
    
    setShowInviteModal(false);
    setInviteEmails('');
    setInviteIdentifiers('');
    setSuccess('Invitations sent successfully!');
    loadBookingDetails();
    
  } catch (err) {
    // Just show the error message from backend
    const errorMessage = err.response?.data?.message || err.message || 'Failed to send invitations';
    setError(errorMessage);
  } finally {
    setActionLoading(prev => ({ ...prev, invite: false }));
  }
};

  const handleRemoveParticipant = async (participantId, participantName) => {
  if (!window.confirm(`Remove ${participantName} from this booking?`)) {
    return;
  }

  setActionLoading(prev => ({ ...prev, [`remove_${participantId}`]: true }));
  setError('');
  
  try {
    await removeUserFromBooking(bookingId, participantId);
    setSuccess(`${participantName} removed successfully`);
    loadBookingDetails();
    
  } catch (err) {
    // Just show the error message from backend
    const errorMessage = err.response?.data?.message || err.message || 'Failed to remove participant';
    setError(errorMessage);
  } finally {
    setActionLoading(prev => ({ ...prev, [`remove_${participantId}`]: false }));
  }
};
    
   const isValidEmail = (email) => {
  const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
  };
  const getBookingStatusInfo = (booking) => {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);

    switch (booking.status) {
      case 'PENDING':
        return { 
          color: '#ffc107', 
          text: 'Pending Approval', 
          icon: 'fa-clock',
          canEdit: true,
          canCheckIn: false,
          canCancel: true
        };
      case 'CONFIRMED':
        if (endTime < now) {
          return { 
            color: '#6c757d', 
            text: 'Completed', 
            icon: 'fa-check-circle',
            canEdit: false,
            canCheckIn: false,
            canCancel: false
          };
        } else if (startTime <= now && endTime > now) {
          return { 
            color: '#28a745', 
            text: 'In Progress', 
            icon: 'fa-play-circle',
            canEdit: false,
            canCheckIn: !booking.checkedInAt,
            canCancel: false
          };
        } else {
          return { 
            color: '#007bff', 
            text: 'Confirmed', 
            icon: 'fa-calendar-check',
            canEdit: true,
            canCheckIn: false,
            canCancel: true
          };
        }
      case 'CHECKED_IN':
        return { 
          color: '#28a745', 
          text: 'Checked In', 
          icon: 'fa-user-check',
          canEdit: false,
          canCheckIn: false,
          canCancel: false
        };
      case 'CANCELLED':
        return { 
          color: '#dc3545', 
          text: 'Cancelled', 
          icon: 'fa-times-circle',
          canEdit: false,
          canCheckIn: false,
          canCancel: false
        };
      case 'REJECTED':
        return { 
          color: '#dc3545', 
          text: 'Rejected', 
          icon: 'fa-ban',
          canEdit: false,
          canCheckIn: false,
          canCancel: false
        };
      default:
        return { 
          color: '#6c757d', 
          text: booking.status, 
          icon: 'fa-question-circle',
          canEdit: false,
          canCheckIn: false,
          canCancel: false
        };
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end - start) / (1000 * 60 * 60);
    return hours < 1 ? `${Math.round(hours * 60)} minutes` : `${hours} hours`;
  };

  if (loading) {
    return (
      <div className="booking-details-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="booking-details-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => navigate('/room-bookings')} className="btn btn-primary">
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getBookingStatusInfo(booking);
  const startDateTime = formatDateTime(booking.startTime);
  const endDateTime = formatDateTime(booking.endTime);
  const duration = getDuration(booking.startTime, booking.endTime);
   
  
  return (
    <div className="booking-details-container">
      {/* Header */}
      <div className="booking-details-header">
        <button 
          onClick={() => navigate('/room-bookings')} 
          className="back-button"
        >
          <i className="fas fa-arrow-left"></i> Back to My Bookings
        </button>
        
        <div className="header-content">
          <div className="title-section">
            {isEditing ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="edit-title-input"
              />
            ) : (
              <h1>{booking.title}</h1>
            )}
            <span 
              className="status-badge"
              style={{ backgroundColor: statusInfo.color }}
            >
              <i className={`fas ${statusInfo.icon}`}></i>
              {statusInfo.text}
            </span>
          </div>
          
          <div className="header-actions">
            {statusInfo.canEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-outline"
              >
                <i className="fas fa-edit"></i>
                {isEditing ? 'Cancel Edit' : 'Edit Booking'}
              </button>
            )}
            
            {statusInfo.canCancel && (
              <button
                onClick={handleCancelBooking}
                className="btn btn-danger"
                disabled={actionLoading.cancel}
              >
                {actionLoading.cancel ? (
                  <><i className="fas fa-spinner fa-spin"></i> Cancelling...</>
                ) : (
                  <><i className="fas fa-times"></i> Cancel Booking</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      {/* Main Content */}
      <div className="booking-details-content">
        {/* Booking Information */}
        <div className="booking-info-card">
          <h2>Booking Information</h2>
          
          <div className="info-grid">
            <div className="info-item">
              <label>Room</label>
              <div className="info-value">
                <strong>{booking.room?.name}</strong> ({booking.room?.roomNumber})
                <span className="room-location">
                  <i className="fas fa-map-marker-alt"></i>
                  {booking.room?.building} - {booking.room?.floor}
                </span>
              </div>
            </div>
            
            <div className="info-item">
              <label>Date & Time</label>
              <div className="info-value">
                <div>{startDateTime.date}</div>
                <div className="time-range">
                  {startDateTime.time} - {endDateTime.time} ({duration})
                </div>
              </div>
            </div>
            
            <div className="info-item">
              <label>Participants</label>
              <div className="info-value">
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.maxParticipants}
                    onChange={(e) => setEditData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                    min="1"
                    max={booking.room?.capacity}
                    className="edit-input"
                  />
                ) : (
                  <span>{booking.participants?.length + 1 || 1} / {booking.maxParticipants}</span>
                )}
              </div>
            </div>
            
            <div className="info-item">
              <label>Description</label>
              <div className="info-value">
                {isEditing ? (
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    className="edit-textarea"
                    rows="3"
                  />
                ) : (
                  <span>{booking.description || 'No description provided'}</span>
                )}
              </div>
            </div>
          </div>
          
          {isEditing && (
            <div className="edit-actions">
              <button
                onClick={handleUpdateBooking}
                className="btn btn-primary"
                disabled={actionLoading.update}
              >
                {actionLoading.update ? (
                  <><i className="fas fa-spinner fa-spin"></i> Updating...</>
                ) : (
                  <><i className="fas fa-save"></i> Save Changes</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Room Details */}
        <div className="room-details-card">
          <h2>Room Details</h2>
          <div className="room-info">
            <div className="room-basic-info">
              <span><strong>Category:</strong> {booking.room?.category}</span>
              <span><strong>Capacity:</strong> {booking.room?.capacity} people</span>
              <span><strong>Floor:</strong> {booking.room?.floor}</span>
            </div>
            
            {booking.room?.equipment && booking.room.equipment.length > 0 && (
              <div className="room-equipment">
                <h3>Available Equipment</h3>
                <div className="equipment-list">
                  {booking.room.equipment.map(equip => (
                    <span key={equip.id} className="equipment-tag">
                      {equip.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {booking.room?.description && (
              <div className="room-description">
                <h3>Room Description</h3>
                <p>{booking.room.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Participants */}
        <div className="participants-card">
          <div className="participants-header">
            <h2>Participants ({(booking.participants?.length || 0) + 1})</h2>
            {booking.allowJoining && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="btn btn-primary btn-sm"
              >
                <i className="fas fa-user-plus"></i> Invite Users
              </button>
            )}
          </div>
          
          <div className="participants-list">
            {/* Organizer */}
            <div className="participant-item organizer">
              <div className="participant-info">
                <i className="fas fa-crown"></i>
                <span className="participant-name">{booking.user?.fullName}</span>
                <span className="participant-role">Organizer</span>
              </div>
            </div>
            
            {/* Other participants */}
            {booking.participants?.map(participant => (
              <div key={participant.id} className="participant-item">
    <div className="participant-info">
      <i className="fas fa-user"></i>
      <span className="participant-name">{participant.user?.fullName || 'Unknown User'}</span>
      <span className="participant-email">{participant.user?.email || 'No email'}</span>
      <span className={`participant-status status-${participant.status?.toLowerCase()}`}>
        {participant.status || 'UNKNOWN'}
      </span>
    </div>
    
    {/* Only show remove button for organizer and if participant is not the organizer */}

      <button
        onClick={() => handleRemoveParticipant(participant.id, participant.user?.fullName)}
        className="btn btn-danger btn-sm"
        disabled={actionLoading[`remove_${participant.id}`]}
        title={`Remove ${participant.user?.fullName}`}
      >
        {actionLoading[`remove_${participant.id}`] ? (
          <i className="fas fa-spinner fa-spin"></i>
        ) : (
          <i className="fas fa-times"></i>
        )}
      </button>
  </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="settings-card">
          <h2>Booking Settings</h2>
          <div className="settings-list">
            <div className="setting-item">
              <i className={`fas ${booking.isPublic ? 'fa-globe text-success' : 'fa-lock text-muted'}`}></i>
              <span>{booking.isPublic ? 'Public booking' : 'Private booking'}</span>
            </div>
            
            <div className="setting-item">
              <i className={`fas ${booking.allowJoining ? 'fa-user-plus text-success' : 'fa-user-slash text-muted'}`}></i>
              <span>{booking.allowJoining ? 'Others can join' : 'Join requests disabled'}</span>
            </div>
            
            <div className="setting-item">
              <i className={`fas ${booking.requiresCheckIn ? 'fa-user-check text-success' : 'fa-user-times text-muted'}`}></i>
              <span>{booking.requiresCheckIn ? 'Check-in required' : 'No check-in required'}</span>
            </div>
            
            <div className="setting-item">
              <i className={`fas ${booking.reminderEnabled ? 'fa-bell text-success' : 'fa-bell-slash text-muted'}`}></i>
              <span>{booking.reminderEnabled ? 'Reminders enabled' : 'Reminders disabled'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal with Identifier Support */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Invite Users to Booking</h3>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {/* Email Invitations */}
              <div className="invite-section">
                <label htmlFor="invite-emails">
                  <i className="fas fa-envelope"></i> Invite by Email
                </label>
                <textarea
                  id="invite-emails"
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                  rows="3"
                  className="invite-textarea"
                />
              </div>

              {/* Identifier Invitations */}
              <div className="invite-section">
                <label htmlFor="invite-identifiers">
                  <i className="fas fa-id-card"></i> Invite by StudentID
                </label>
                <textarea
                  id="invite-identifiers"
                  value={inviteIdentifiers}
                  onChange={(e) => setInviteIdentifiers(e.target.value)}
                  placeholder="24604*,24601*"
                  rows="3"
                  className="invite-textarea"
                />
                <small>Separate multiple IDs/emails with commas</small>
              </div>

              {/* Help Text */}
              <div className="invite-help">
                <i className="fas fa-info-circle"></i>
                <span>You can invite users by email address or their StudentID. At least one field must be filled.</span>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={() => setShowInviteModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteUsers}
                className="btn btn-primary"
                disabled={actionLoading.invite || (!inviteEmails.trim() && !inviteIdentifiers.trim())}
              >
                {actionLoading.invite ? (
                  <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                ) : (
                  <><i className="fas fa-paper-plane"></i> Send Invitations</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
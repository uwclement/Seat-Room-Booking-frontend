import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../context/RoomBookingContext';
import { 
  cancelRoomBooking, 
  checkInToRoomBooking, 
  getUserBookingStats,
  getMyPendingInvitations,
  respondToInvitation
} from '../../api/roomBooking';
import './MyRoomBookings.css';

const MyRoomBookings = () => {
  const navigate = useNavigate();
  const { 
    myBookings, 
    loadingBookings, 
    loadMyBookings, 
    removeBooking, 
    updateBooking,
    getBookingStats,
    error,
    clearError 
  } = useRoom();

  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, pending, invitations
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  
  // NEW: Invitation state
  const [invitations, setInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  useEffect(() => {
    loadMyBookings();
    loadMyInvitations(); // NEW: Load invitations
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const statsData = await getUserBookingStats(4); // Last 4 weeks
      setStats(statsData);
    } catch (err) {
      console.error('Error loading user stats:', err);
    }
  };

  // NEW: Load invitations function
  const loadMyInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const invitationsData = await getMyPendingInvitations();
      setInvitations(invitationsData);
    } catch (err) {
      console.error('Error loading invitations:', err);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [bookingId]: 'cancelling' }));
    
    try {
      await cancelRoomBooking(bookingId);
      removeBooking(bookingId);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('User cannot cancel this booking');
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const handleCheckIn = async (bookingId) => {
    setActionLoading(prev => ({ ...prev, [bookingId]: 'checking-in' }));
    
    try {
      await checkInToRoomBooking(bookingId);
      updateBooking(bookingId, { 
        status: 'CHECKED_IN', 
        checkedInAt: new Date().toISOString() 
      });
    } catch (err) {
      console.error('Error checking in:', err);
      alert('Failed to check in');
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  // NEW: Accept invitation function
  const handleAcceptInvitation = async (bookingId, participantId) => {
    setActionLoading(prev => ({ ...prev, [`accept_${participantId}`]: true }));
    
    try {
      await respondToInvitation(bookingId, participantId, true);
      // Remove from invitations list
      setInvitations(prev => prev.filter(inv => inv.participantId !== participantId));
      // Reload bookings to show newly accepted booking
      loadMyBookings();
    } catch (err) {
      console.error('Error accepting invitation:', err);
      alert('Failed to accept invitation');
    } finally {
      setActionLoading(prev => ({ ...prev, [`accept_${participantId}`]: false }));
    }
  };

  // NEW: Decline invitation function
  const handleDeclineInvitation = async (bookingId, participantId) => {
    setActionLoading(prev => ({ ...prev, [`decline_${participantId}`]: true }));
    
    try {
      await respondToInvitation(bookingId, participantId, false);
      // Remove from invitations list
      setInvitations(prev => prev.filter(inv => inv.participantId !== participantId));
    } catch (err) {
      console.error('Error declining invitation:', err);
      alert('Failed to decline invitation');
    } finally {
      setActionLoading(prev => ({ ...prev, [`decline_${participantId}`]: false }));
    }
  };

  // UPDATED: Get filtered items (bookings or invitations)
  const getFilteredItems = () => {
    let filtered = [];

    if (filter === 'invitations') {
      // Show invitations
      filtered = invitations;
    } else {
      // Show bookings with existing filter logic
      filtered = myBookings;
      
      const now = new Date();
      switch (filter) {
        case 'upcoming':
          filtered = filtered.filter(booking => 
            new Date(booking.startTime) > now && 
            ['PENDING', 'CONFIRMED'].includes(booking.status)
          );
          break;
        case 'past':
          filtered = filtered.filter(booking => 
            new Date(booking.endTime) < now || 
            ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(booking.status)
          );
          break;
        case 'pending':
          filtered = filtered.filter(booking => booking.status === 'PENDING');
          break;
        // 'all' shows everything
      }
    }

    // Apply search filter
    if (searchTerm && filter !== 'invitations') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.title.toLowerCase().includes(term) ||
        booking.room?.name.toLowerCase().includes(term) ||
        booking.room?.roomNumber.toLowerCase().includes(term) ||
        booking.room?.building.toLowerCase().includes(term)
      );
    } else if (searchTerm && filter === 'invitations') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(invitation =>
        invitation.booking.title.toLowerCase().includes(term) ||
        invitation.booking.room?.name.toLowerCase().includes(term) ||
        invitation.booking.room?.roomNumber.toLowerCase().includes(term) ||
        invitation.booking.room?.building.toLowerCase().includes(term)
      );
    }

    // Sort by start time (upcoming first)
    if (filter === 'invitations') {
      return filtered.sort((a, b) => new Date(a.booking.startTime) - new Date(b.booking.startTime));
    } else {
      return filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    }
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
          canCheckIn: false,
          canCancel: true
        };
      case 'CONFIRMED':
        if (endTime < now) {
          return { 
            color: '#6c757d', 
            text: 'Completed', 
            icon: 'fa-check-circle',
            canCheckIn: false,
            canCancel: false
          };
        } else if (startTime <= now && endTime > now) {
          return { 
            color: '#28a745', 
            text: 'In Progress', 
            icon: 'fa-play-circle',
            canCheckIn: !booking.checkedInAt,
            canCancel: false
          };
        } else {
          return { 
            color: '#007bff', 
            text: 'Confirmed', 
            icon: 'fa-calendar-check',
            canCheckIn: false,
            canCancel: true
          };
        }
      case 'CHECKED_IN':
        return { 
          color: '#28a745', 
          text: 'Checked In', 
          icon: 'fa-user-check',
          canCheckIn: false,
          canCancel: false
        };
      case 'CANCELLED':
        return { 
          color: '#dc3545', 
          text: 'Cancelled', 
          icon: 'fa-times-circle',
          canCheckIn: false,
          canCancel: false
        };
      case 'REJECTED':
        return { 
          color: '#dc3545', 
          text: 'Rejected', 
          icon: 'fa-ban',
          canCheckIn: false,
          canCancel: false
        };
      case 'NO_SHOW':
        return { 
          color: '#dc3545', 
          text: 'No Show', 
          icon: 'fa-user-times',
          canCheckIn: false,
          canCancel: false
        };
      default:
        return { 
          color: '#6c757d', 
          text: booking.status, 
          icon: 'fa-question-circle',
          canCheckIn: false,
          canCancel: false
        };
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end - start) / (1000 * 60 * 60);
    return hours < 1 ? `${Math.round(hours * 60)} min` : `${hours} hr`;
  };

  // NEW: Get invitation stats
  const getInvitationStats = () => {
    return {
      pending: invitations.length,
      total: invitations.length
    };
  };

  // UPDATED: Render booking or invitation card
  const renderCard = (item) => {
    const isInvitation = filter === 'invitations';
    const booking = isInvitation ? item.booking : item;
    const participantId = isInvitation ? item.participantId : null;
    const cardKey = isInvitation ? `inv_${item.participantId}` : booking.id;

    const statusInfo = isInvitation ? null : getBookingStatusInfo(booking);
    const startDateTime = formatDateTime(booking.startTime);
    const endDateTime = formatDateTime(booking.endTime);
    const duration = getDuration(booking.startTime, booking.endTime);
    const isLoading = actionLoading[booking.id] || actionLoading[`accept_${participantId}`] || actionLoading[`decline_${participantId}`];

    return (
      <div key={cardKey} className="booking-card">
        <div className="booking-header">
          <div className="booking-title">
            <h3>{booking.title}</h3>
            {isInvitation ? (
              <span className="status-badge invitation-badge" style={{ backgroundColor: '#17a2b8' }}>
                <i className="fas fa-envelope"></i>
                Invitation
              </span>
            ) : (
              <span 
                className="status-badge"
                style={{ backgroundColor: statusInfo.color }}
              >
                <i className={`fas ${statusInfo.icon}`}></i>
                {statusInfo.text}
              </span>
            )}
          </div>
          
          <div className="booking-actions">
            {isInvitation ? (
              // NEW: Invitation action buttons
              <>
                <button
                  onClick={() => handleAcceptInvitation(booking.id, participantId)}
                  className="btn btn-success btn-sm"
                  disabled={isLoading}
                >
                  {actionLoading[`accept_${participantId}`] ? (
                    <><i className="fas fa-spinner fa-spin"></i> Accepting...</>
                  ) : (
                    <><i className="fas fa-check"></i> Accept</>
                  )}
                </button>
                
                <button
                  onClick={() => handleDeclineInvitation(booking.id, participantId)}
                  className="btn btn-danger btn-sm"
                  disabled={isLoading}
                >
                  {actionLoading[`decline_${participantId}`] ? (
                    <><i className="fas fa-spinner fa-spin"></i> Declining...</>
                  ) : (
                    <><i className="fas fa-times"></i> Decline</>
                  )}
                </button>
              </>
            ) : (
              // Existing booking action buttons
              <>
                {statusInfo.canCheckIn && (
                  <button
                    onClick={() => handleCheckIn(booking.id)}
                    className="btn btn-success btn-sm"
                    disabled={isLoading}
                  >
                    {actionLoading[booking.id] === 'checking-in' ? (
                      <><i className="fas fa-spinner fa-spin"></i> Checking In...</>
                    ) : (
                      <><i className="fas fa-user-check"></i> Check In</>
                    )}
                  </button>
                )}
                
                {statusInfo.canCancel && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="btn btn-danger btn-sm"
                    disabled={isLoading}
                  >
                    {actionLoading[booking.id] === 'cancelling' ? (
                      <><i className="fas fa-spinner fa-spin"></i> Cancelling...</>
                    ) : (
                      <><i className="fas fa-times"></i> Cancel</>
                    )}
                  </button>
                )}
              </>
            )}
            
            <button
              onClick={() => navigate(`/room-booking/${booking.id}`)}
              className="btn btn-outline btn-sm"
            >
              <i className="fas fa-eye"></i>
              Details
            </button>
          </div>
        </div>

        <div className="booking-details">
          <div className="booking-info">
            <div className="info-item">
              <i className="fas fa-door-open"></i>
              <span>
                <strong>{booking.room?.name}</strong> ({booking.room?.roomNumber})
              </span>
            </div>
            
            <div className="info-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>{booking.room?.building} - {booking.room?.floor}</span>
            </div>
            
            <div className="info-item">
              <i className="fas fa-calendar"></i>
              <span>{startDateTime.date}</span>
            </div>
            
            <div className="info-item">
              <i className="fas fa-clock"></i>
              <span>
                {startDateTime.time} - {endDateTime.time} ({duration})
              </span>
            </div>
            
            <div className="info-item">
              <i className="fas fa-users"></i>
              <span>
                {booking.participants?.length + 1 || 1} / {booking.maxParticipants} participants
              </span>
            </div>

            {isInvitation && (
              <div className="info-item">
                <i className="fas fa-user-crown"></i>
                <span>
                  Invited by <strong>{booking.user?.fullName}</strong>
                </span>
              </div>
            )}
          </div>

          {booking.description && (
            <div className="booking-description">
              <p>{booking.description}</p>
            </div>
          )}

          {booking.participants && booking.participants.length > 0 && (
            <div className="booking-participants">
              <span className="participants-label">Participants:</span>
              <div className="participants-list">
                {booking.participants.slice(0, 3).map(participant => (
                  <span key={participant.id} className="participant-tag">
                    {participant.user?.fullName}
                  </span>
                ))}
                {booking.participants.length > 3 && (
                  <span className="participants-more">
                    +{booking.participants.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {booking.isPublic && (
            <div className="booking-badges">
              <span className="badge badge-info">
                <i className="fas fa-globe"></i>
                Public
              </span>
              {booking.allowJoining && (
                <span className="badge badge-success">
                  <i className="fas fa-user-plus"></i>
                  Joinable
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="my-bookings-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={clearError} className="btn btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();
  const bookingStats = getBookingStats();
  const invitationStats = getInvitationStats();

  return (
    <div className="my-bookings-container">
      {/* Header */}
      <div className="my-bookings-header">
        <h1>My Room Bookings</h1>
        <button 
          onClick={() => navigate('/rooms')} 
          className="btn btn-primary"
        >
          <i className="fas fa-plus"></i>
          Book New Room
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-calendar"></i>
          </div>
          <div className="stat-content">
            <h3>{bookingStats.total}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{bookingStats.upcoming}</h3>
            <p>Upcoming</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-calendar-day"></i>
          </div>
          <div className="stat-content">
            <h3>{bookingStats.today}</h3>
            <p>Today</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <div className="stat-content">
            <h3>{invitationStats.pending}</h3>
            <p>Invitations</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bookings-controls">
        <div className="filter-tabs">
          {[
            { key: 'all', label: 'All Bookings', count: bookingStats.total },
            { key: 'upcoming', label: 'Upcoming', count: bookingStats.upcoming },
            { key: 'pending', label: 'Pending', count: bookingStats.pending },
            { key: 'invitations', label: 'Invitations', count: invitationStats.pending }, // NEW
            { key: 'past', label: 'Past', count: null }
          ].map(tab => (
            <button
              key={tab.key}
              className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className="count-badge">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Items List */}
      {(loadingBookings || loadingInvitations) ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your {filter === 'invitations' ? 'invitations' : 'bookings'}...</p>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => renderCard(item))
          ) : (
            <div className="no-bookings">
              <div className="no-bookings-content">
                <i className={`fas ${filter === 'invitations' ? 'fa-envelope-open' : 'fa-calendar-times'}`}></i>
                <h3>
                  {filter === 'invitations' ? 'No pending invitations' : 'No bookings found'}
                </h3>
                <p>
                  {filter === 'invitations' ? 
                    'You don\'t have any pending room booking invitations.' :
                    searchTerm ? 
                      'No bookings match your search criteria.' : 
                      'You haven\'t made any room bookings yet.'
                  }
                </p>
                <button 
                  onClick={() => navigate('/rooms')} 
                  className="btn btn-primary"
                >
                  Browse Rooms
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyRoomBookings;
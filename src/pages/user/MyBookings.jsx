import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserActiveBookings, getUserPastBookings, checkInBooking, checkOutBooking, cancelBooking } from '../../api/booking';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import '../../assets/css/dashboard.css';

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [activeBookings, setActiveBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const [activeData, pastData] = await Promise.all([
          getUserActiveBookings(),
          getUserPastBookings()
        ]);
        setActiveBookings(activeData);
        setPastBookings(pastData);
      } catch (err) {
        setError('Failed to fetch bookings. Please try again later.');
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Format time for display
  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'RESERVED':
        return 'pending';
      case 'CHECKED_IN':
        return 'active';
      case 'COMPLETED':
        return 'verified';
      case 'CANCELLED':
        return 'danger';
      case 'NO_SHOW':
        return 'danger';
      default:
        return '';
    }
  };

  // Handle check-in
  const handleCheckIn = async (bookingId) => {
    try {
      setActionInProgress(bookingId);
      await checkInBooking(bookingId);
      
      // Update bookings after action
      const updatedBookings = await getUserActiveBookings();
      setActiveBookings(updatedBookings);
      
      setAlert({
        type: 'success',
        message: 'Successfully checked in'
      });
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to check in. Please try again.'
      });
      console.error('Error checking in:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle check-out
  const handleCheckOut = async (bookingId) => {
    try {
      setActionInProgress(bookingId);
      await checkOutBooking(bookingId);
      
      // Update bookings after action
      const [activeData, pastData] = await Promise.all([
        getUserActiveBookings(),
        getUserPastBookings()
      ]);
      setActiveBookings(activeData);
      setPastBookings(pastData);
      
      setAlert({
        type: 'success',
        message: 'Successfully checked out'
      });
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to check out. Please try again.'
      });
      console.error('Error checking out:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle cancel booking
  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      setActionInProgress(bookingId);
      await cancelBooking(bookingId);
      
      // Update bookings after action
      const [activeData, pastData] = await Promise.all([
        getUserActiveBookings(),
        getUserPastBookings()
      ]);
      setActiveBookings(activeData);
      setPastBookings(pastData);
      
      setAlert({
        type: 'success',
        message: 'Booking cancelled successfully'
      });
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to cancel booking. Please try again.'
      });
      console.error('Error cancelling booking:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Safe data access function to handle potential undefined values
  const getSafeValue = (booking, path) => {
    if (!booking) return null;
    
    // Handle nested path safely (e.g., "seat.seatNumber")
    const parts = path.split('.');
    let value = booking;
    
    for (const part of parts) {
      if (!value || typeof value !== 'object') return null;
      value = value[part];
    }
    
    return value;
  };

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">My Bookings</h1>
          <p className="dashboard-subtitle">
            Manage your seat bookings and reservations
          </p>
        </div>

        {alert.message && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: '', message: '' })}
          />
        )}

        {error && (
          <Alert
            type="danger"
            message={error}
            onClose={() => setError('')}
          />
        )}

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Active Bookings</h2>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : activeBookings.length === 0 ? (
            <div className="empty-state">
              <p>You don't have any active bookings.</p>
              <Link to="/seats" className="btn btn-primary">
                Book a Seat
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Seat</th>
                    <th>Zone</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{getSafeValue(booking, 'seatNumber')}</td>
                      <td>{getSafeValue(booking, 'zoneType')}</td>
                      <td>{formatDate(booking.startTime)}</td>
                      <td>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status === 'RESERVED' && 'Reserved'}
                          {booking.status === 'CHECKED_IN' && 'Checked In'}
                        </span>
                      </td>
                      <td>
                        {booking.status === 'RESERVED' && (
                          <Button
                            variant="secondary"
                            onClick={() => handleCheckIn(booking.id)}
                            disabled={actionInProgress === booking.id}
                            className="action-btn"
                          >
                            {actionInProgress === booking.id ? 'Processing...' : 'Check In'}
                          </Button>
                        )}
                        
                        {booking.status === 'CHECKED_IN' && (
                          <Button
                            variant="secondary"
                            onClick={() => handleCheckOut(booking.id)}
                            disabled={actionInProgress === booking.id}
                            className="action-btn"
                          >
                            {actionInProgress === booking.id ? 'Processing...' : 'Check Out'}
                          </Button>
                        )}
                        
                        {(booking.status === 'RESERVED' || booking.status === 'CHECKED_IN') && (
                          <Button
                            variant="danger"
                            onClick={() => handleCancel(booking.id)}
                            disabled={actionInProgress === booking.id}
                            className="action-btn"
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Past Bookings</h2>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : pastBookings.length === 0 ? (
            <div className="empty-state">
              <p>You don't have any past bookings.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Seat</th>
                    <th>Zone</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastBookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{getSafeValue(booking, 'seatNumber')}</td>
                      <td>{getSafeValue(booking, 'zoneType')}</td>
                      <td>{formatDate(booking.startTime)}</td>
                      <td>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status === 'COMPLETED' && 'Completed'}
                          {booking.status === 'CANCELLED' && 'Cancelled'}
                          {booking.status === 'NO_SHOW' && 'No Show'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserWaitlistItems, cancelWaitlistRequest } from '../../api/waitlist';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import '../../assets/css/dashboard.css';

const MyWaitlistPage = () => {
  const { user } = useAuth();
  const [waitlistItems, setWaitlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchWaitlistItems = async () => {
      try {
        setLoading(true);
        const data = await getUserWaitlistItems();
        setWaitlistItems(data);
      } catch (err) {
        setError('Failed to fetch waitlist items. Please try again later.');
        console.error('Error fetching waitlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWaitlistItems();
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
      case 'WAITING':
        return 'pending';
      case 'NOTIFIED':
        return 'active';
      case 'FULFILLED':
        return 'verified';
      case 'EXPIRED':
        return 'danger';
      case 'CANCELLED':
        return 'danger';
      default:
        return '';
    }
  };

  // Handle cancel waitlist
  const handleCancel = async (waitlistId) => {
    if (!window.confirm('Are you sure you want to cancel this waitlist request?')) {
      return;
    }
    
    try {
      setActionInProgress(waitlistId);
      await cancelWaitlistRequest(waitlistId);
      
      // Update waitlist items after cancel
      const updatedItems = await getUserWaitlistItems();
      setWaitlistItems(updatedItems);
      
      setAlert({
        type: 'success',
        message: 'Waitlist request cancelled successfully'
      });
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to cancel request. Please try again.'
      });
      console.error('Error cancelling waitlist request:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">My Waitlist</h1>
          <p className="dashboard-subtitle">
            View and manage your seat waitlist requests
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
            <h2 className="dashboard-section-title">Waitlist Requests</h2>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : waitlistItems.length === 0 ? (
            <div className="empty-state">
              <p>You don't have any active waitlist requests.</p>
              <Link to="/seats" className="btn btn-primary">
                Browse Available Seats
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
                    <th>Queue Position</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlistItems.map(item => (
                    <tr key={item.id}>
                      {/* <td>{item.seat.seatNumber}</td> */}
                      <td>{item.seat.zoneType}</td>
                      <td>{formatDate(item.requestedStartTime)}</td>
                      <td>
                        {formatTime(item.requestedStartTime)} - {formatTime(item.requestedEndTime)}
                      </td>
                      <td className="queue-position">
                        {item.queuePosition}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                          {item.status === 'WAITING' && 'Waiting'}
                          {item.status === 'NOTIFIED' && 'Available'}
                          {item.status === 'FULFILLED' && 'Fulfilled'}
                          {item.status === 'EXPIRED' && 'Expired'}
                          {item.status === 'CANCELLED' && 'Cancelled'}
                        </span>
                      </td>
                      <td>
                        {(item.status === 'WAITING' || item.status === 'NOTIFIED') && (
                          <Button
                            variant="danger"
                            onClick={() => handleCancel(item.id)}
                            disabled={actionInProgress === item.id}
                            className="action-btn"
                          >
                            {actionInProgress === item.id ? 'Processing...' : 'Cancel'}
                          </Button>
                        )}
                        
                        {item.status === 'NOTIFIED' && (
                          <Link 
                            to="/seats" 
                            className="btn btn-primary action-btn"
                          >
                            Book Now
                          </Link>
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
            <h2 className="dashboard-section-title">About the Waitlist</h2>
          </div>
          
          <div className="info-card">
            <h3 className="info-card-title">How the waitlist works:</h3>
            <ul className="info-list">
              <li>
                <strong>Queue Position:</strong> Indicates your place in line for the requested seat
              </li>
              <li>
                <strong>Notifications:</strong> You'll receive an email when a seat becomes available
              </li>
              <li>
                <strong>Expiration:</strong> Waitlist requests expire after 24 hours if not fulfilled
              </li>
              <li>
                <strong>First Come, First Served:</strong> Seats are offered based on queue position
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyWaitlistPage;
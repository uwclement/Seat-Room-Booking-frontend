import React, { useState } from 'react';
import { useAdminSeatBooking } from '../../../hooks/useAdminSeatBooking';

const BookingList = () => {
  const {
    selectedBookings,
    toggleBookingSelection,
    getFilteredBookings,
    handleManualCheckIn,
    handleManualCancel,
    loading
  } = useAdminSeatBooking();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const filteredBookings = getFilteredBookings();

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'RESERVED':
        return 'yellow';
      case 'CHECKED_IN':
        return 'green';
      case 'COMPLETED':
        return 'blue';
      case 'CANCELLED':
        return 'red';
      case 'NO_SHOW':
        return 'red';
      default:
        return 'gray';
    }
  };

  const canCheckIn = (booking) => {
    return booking.status === 'RESERVED';
  };

  const canCancel = (booking) => {
    return booking.status === 'RESERVED' || booking.status === 'CHECKED_IN';
  };

  const handleCancelClick = (booking) => {
    setSelectedBookingForCancel(booking);
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async () => {
    if (selectedBookingForCancel) {
      await handleManualCancel(selectedBookingForCancel.id, cancelReason);
      setShowCancelModal(false);
      setSelectedBookingForCancel(null);
      setCancelReason('');
    }
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="booking-list">
      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-calendar-alt"></i>
          <h3>No Bookings Found</h3>
          <p>No bookings match the current filters.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selectedBookings.length === filteredBookings.length && 
                      filteredBookings.length > 0
                    }
                    onChange={() => {
                      if (selectedBookings.length === filteredBookings.length) {
                        // If all are selected, clear selection
                        filteredBookings.forEach(booking => {
                          if (selectedBookings.includes(booking.id)) {
                            toggleBookingSelection(booking.id);
                          }
                        });
                      } else {
                        // Select all
                        filteredBookings.forEach(booking => {
                          if (!selectedBookings.includes(booking.id)) {
                            toggleBookingSelection(booking.id);
                          }
                        });
                      }
                    }}
                  />
                </th>
                <th>User</th>
                <th>Seat</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Check-in/out</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr 
                  key={booking.id}
                  className={selectedBookings.includes(booking.id) ? 'selected-row' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedBookings.includes(booking.id)}
                      onChange={() => toggleBookingSelection(booking.id)}
                    />
                  </td>
                  <td>
                    <div className="user-info">
                      <strong>{booking.identifier}</strong>
                      {/* <div className="user-id">ID: {booking.userId}</div> */}
                    </div>
                  </td>
                  <td>
                    <div className="seat-info">
                      <strong>{booking.seatNumber}</strong>
                      {/* <div className="seat-id">ID: {booking.seatId}</div> */}
                    </div>
                  </td>
                  <td>
                    <div className="datetime-info">
                      <div className="date">
                        {new Date(booking.startTime).toLocaleDateString()}
                      </div>
                      <div className="time-range">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="duration">
                      {Math.round(
                        (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60)
                      )}h
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                      <span className="status-dot"></span>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="checkin-info">
                      {booking.checkinTime && (
                        <div className="checkin-time">
                          <i className="fas fa-sign-in-alt text-green"></i>
                          {formatTime(booking.checkinTime)}
                        </div>
                      )}
                      {booking.checkoutTime && (
                        <div className="checkout-time">
                          <i className="fas fa-sign-out-alt text-red"></i>
                          {formatTime(booking.checkoutTime)}
                        </div>
                      )}
                      {!booking.checkinTime && !booking.checkoutTime && (
                        <span className="text-muted">-</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {canCheckIn(booking) && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleManualCheckIn(booking.id)}
                          title="Manual Check-in"
                        >
                          <i className="fas fa-sign-in-alt"></i>
                          Check In
                        </button>
                      )}
                      
                      {canCancel(booking) && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCancelClick(booking)}
                          title="Cancel Booking"
                        >
                          <i className="fas fa-times"></i>
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedBookingForCancel && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Cancel Booking</h3>
              <button 
                className="close-button" 
                onClick={() => setShowCancelModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="booking-summary">
                <p>
                  <strong>User:</strong> {selectedBookingForCancel.userName} <br/>
                  <strong>Seat:</strong> {selectedBookingForCancel.seatNumber} <br/>
                  <strong>Time:</strong> {formatDateTime(selectedBookingForCancel.startTime)} - {formatTime(selectedBookingForCancel.endTime)}
                </p>
              </div>

              <div className="form-group">
                <label>Cancellation Reason (Optional)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="form-control"
                  rows="3"
                  placeholder="Enter reason for cancellation (e.g., Emergency, Maintenance, User request, etc.)"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowCancelModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleCancelSubmit}
              >
                <i className="fas fa-times"></i>
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
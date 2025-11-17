import React, { useState, useEffect } from 'react';
import { getAvailableSeats } from '../../api/seat';
import Button from '../common/Button';
import './EditBookingModal.css';

const EditBookingModal = ({ show, onClose, booking, onUpdate }) => {
  const [formData, setFormData] = useState({
    seatId: '',
    startTime: '',
    endTime: '',
    notes: ''
  });
  const [availableSeats, setAvailableSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && booking) {
      // Initialize form with current booking data
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      
      setFormData({
        seatId: booking.seatId,
        startTime: formatDateTimeLocal(startTime),
        endTime: formatDateTimeLocal(endTime),
        notes: booking.notes || ''
      });

      // Set current seat as the only option initially
      setAvailableSeats([{
        id: booking.seatId,
        seatNumber: booking.seatNumber,
        zoneType: booking.zoneType,
        isCurrent: true
      }]);

      fetchAvailableSeats();
    }
  }, [show, booking]);

  const formatDateTimeLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const fetchAvailableSeats = async () => {
    try {
      setLoading(true);
      const seats = await getAvailableSeats();
      
      // Ensure current seat is included even if not in available list
      const currentSeat = {
        id: booking.seatId,
        seatNumber: booking.seatNumber,
        zoneType: booking.zoneType,
        isCurrent: true
      };
      
      // Check if current seat is already in the list
      const currentSeatExists = seats.some(seat => seat.id === booking.seatId);
      
      if (!currentSeatExists) {
        // Add current seat to the beginning of the list
        setAvailableSeats([currentSeat, ...seats]);
      } else {
        // Mark current seat in existing list
        const updatedSeats = seats.map(seat => 
          seat.id === booking.seatId 
            ? { ...seat, isCurrent: true }
            : seat
        );
        setAvailableSeats(updatedSeats);
      }
    } catch (err) {
      // If API fails, at least show current seat
      setAvailableSeats([{
        id: booking.seatId,
        seatNumber: booking.seatNumber,
        zoneType: booking.zoneType,
        isCurrent: true
      }]);
      setError('Failed to fetch available seats. You can still edit time and notes.');
      console.error('Error fetching seats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!formData.seatId || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields');
      return;
    }

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);

    if (endTime <= startTime) {
      setError('End time must be after start time');
      return;
    }

    // Check if update is within allowed time (10 minutes before start)
    const now = new Date();
    const tenMinutesBeforeStart = new Date(startTime.getTime() - 10 * 60 * 1000);

    if (now > tenMinutesBeforeStart) {
      setError('Cannot edit booking within 10 minutes of start time');
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        seatId: parseInt(formData.seatId),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: formData.notes
      };

      await onUpdate(booking.id, updateData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = () => {
    if (!booking) return false;
    
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const tenMinutesBeforeStart = new Date(startTime.getTime() - 10 * 60 * 1000);
    
    return now <= tenMinutesBeforeStart && booking.status === 'RESERVED';
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="edit-booking-modal">
        <div className="modal-header">
          <h3>Edit Booking</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {!canEdit() ? (
          <div className="modal-body">
            <div className="error-message">
              This booking cannot be edited. Bookings can only be edited when in "Reserved" 
              status and at least 10 minutes before the start time.
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="error-message">{error}</div>
              )}

              <div className="form-group">
                <label htmlFor="seatId">Seat *</label>
                <select
                  id="seatId"
                  name="seatId"
                  value={formData.seatId}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select a seat</option>
                  {availableSeats.map(seat => (
                    <option key={seat.id} value={seat.id}>
                      {seat.seatNumber} - {seat.zoneType}
                      {seat.isCurrent && ' (Current Seat)'}
                    </option>
                  ))}
                </select>
                {booking && (
                  <small className="current-seat-info">
                    Currently booked: Seat {booking.seatNumber} - {booking.zoneType}
                  </small>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startTime">Start Time *</label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endTime">End Time *</label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Add any notes for your booking..."
                  disabled={loading}
                />
              </div>

              <div className="booking-info">
                <small>
                  Note: You can only edit bookings up to 10 minutes before the start time.
                  Maximum booking duration is 6 hours.
                </small>
              </div>
            </div>

            <div className="modal-footer">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Booking'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditBookingModal;
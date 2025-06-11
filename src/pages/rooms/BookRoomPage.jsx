import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useRoom } from '../../context/RoomBookingContext';
import { createRoomBooking, getRoomById } from '../../api/roomBooking'; // Removed getRoomAvailability
import './BookRoom.css';

const BookRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addBooking } = useRoom();
  
  const [room, setRoom] = useState(null);
  // Removed availability state since we're not using it
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    maxParticipants: 1,
    isPublic: false,
    allowJoining: false,
    requiresCheckIn: true,
    reminderEnabled: true,
    invitedUserEmails: '',
    requestedEquipmentIds: [],
    isRecurring: false,
    recurringDetails: {
      recurrenceType: 'WEEKLY',
      recurrenceInterval: 1,
      daysOfWeek: [],
      seriesEndDate: ''
    }
  });

  useEffect(() => {
    loadRoomData();
  }, [roomId]);

  useEffect(() => {
    // Set default times if quick booking
    if (searchParams.get('quick') === 'true') {
      const now = new Date();
      const startTime = new Date(now.getTime() + 15 * 60000); // 15 minutes from now
      const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour duration
      
      setFormData(prev => ({
        ...prev,
        title: 'Quick Booking',
        startTime: formatDateTimeLocal(startTime),
        endTime: formatDateTimeLocal(endTime)
      }));
    }
  }, [searchParams]);

  const loadRoomData = async () => {
    try {
      setLoading(true);
      // Only load room data, removed availability call
      const roomData = await getRoomById(roomId);
      
      setRoom(roomData);
      
      // Set max participants to room capacity
      setFormData(prev => ({
        ...prev,
        maxParticipants: Math.min(prev.maxParticipants, roomData.capacity)
      }));
      
    } catch (err) {
      console.error('Error loading room data:', err);
      setError('Failed to load room information');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('recurring.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        recurringDetails: {
          ...prev.recurringDetails,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleEquipmentChange = (equipmentId, checked) => {
    setFormData(prev => ({
      ...prev,
      requestedEquipmentIds: checked
        ? [...prev.requestedEquipmentIds, equipmentId]
        : prev.requestedEquipmentIds.filter(id => id !== equipmentId)
    }));
  };

  const handleDayOfWeekChange = (day, checked) => {
    setFormData(prev => ({
      ...prev,
      recurringDetails: {
        ...prev.recurringDetails,
        daysOfWeek: checked
          ? [...prev.recurringDetails.daysOfWeek, day]
          : prev.recurringDetails.daysOfWeek.filter(d => d !== day)
      }
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!formData.startTime || !formData.endTime) {
      setError('Start time and end time are required');
      return false;
    }
    
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    const now = new Date();
    
    if (startDate <= now) {
      setError('Start time must be in the future');
      return false;
    }
    
    if (endDate <= startDate) {
      setError('End time must be after start time');
      return false;
    }
    
    const durationHours = (endDate - startDate) / (1000 * 60 * 60);
    if (room && durationHours > room.maxBookingHours) {
      setError(`Maximum booking duration is ${room.maxBookingHours} hours`);
      return false;
    }
    
    if (formData.maxParticipants > room.capacity) {
      setError(`Maximum participants cannot exceed room capacity (${room.capacity})`);
      return false;
    }
    
    if (formData.isRecurring && !formData.recurringDetails.seriesEndDate) {
      setError('End date is required for recurring bookings');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // Prepare booking data
      const bookingData = {
        roomId: parseInt(roomId),
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxParticipants: parseInt(formData.maxParticipants),
        isPublic: formData.isPublic,
        allowJoining: formData.allowJoining,
        requiresCheckIn: formData.requiresCheckIn,
        reminderEnabled: formData.reminderEnabled,
        requestedEquipmentIds: formData.requestedEquipmentIds,
        invitedUserEmails: formData.invitedUserEmails
          ? formData.invitedUserEmails.split(',').map(email => email.trim()).filter(Boolean)
          : null,
        isRecurring: formData.isRecurring,
        recurringDetails: formData.isRecurring ? formData.recurringDetails : null
      };
      
      const result = await createRoomBooking(bookingData);
      
      // Add to local state
      addBooking(result);
      
      // Navigate to booking details or my bookings
      navigate(`/room-booking/${result.id}`, {
        state: { message: 'Booking created successfully!' }
      });
      
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="book-room-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading room information...</p>
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="book-room-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => navigate('/rooms')} className="btn btn-primary">
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-room-container">
      {/* Header */}
      <div className="book-room-header">
        <button 
          onClick={() => navigate('/rooms')} 
          className="back-button"
        >
          <i className="fas fa-arrow-left"></i> Back to Rooms
        </button>
        <h1>Book Room: {room?.name}</h1>
        <div className="room-info-summary">
          <span><i className="fas fa-map-marker-alt"></i> {room?.building} - {room?.floor}</span>
          <span><i className="fas fa-users"></i> Capacity: {room?.capacity}</span>
          <span><i className="fas fa-clock"></i> Max Duration: {room?.maxBookingHours}h</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="book-room-content">
        {/* Room Details Sidebar */}
        <div className="room-details-sidebar">
          <div className="room-card">
            <h3>Room Details</h3>
            <div className="room-info">
              <p><strong>Room Number:</strong> {room?.roomNumber}</p>
              <p><strong>Category:</strong> {room?.category}</p>
              <p><strong>Capacity:</strong> {room?.capacity} people</p>
              <p><strong>Max Booking Hours:</strong> {room?.maxBookingHours}h</p>
              {room?.requiresApproval && (
                <p className="requires-approval">
                  <i className="fas fa-exclamation-circle"></i>
                  Requires admin approval
                </p>
              )}
            </div>
            
            {room?.equipment && room.equipment.length > 0 && (
              <div className="available-equipment">
                <h4>Available Equipment</h4>
                <div className="equipment-list">
                  {room.equipment.map(equip => (
                    <label key={equip.id} className="equipment-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.requestedEquipmentIds.includes(equip.id)}
                        onChange={(e) => handleEquipmentChange(equip.id, e.target.checked)}
                      />
                      <span>{equip.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {room?.description && (
              <div className="room-description">
                <h4>Description</h4>
                <p>{room.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Rest of the component remains the same - booking form, etc. */}
        <div className="booking-form-container">
          <form onSubmit={handleSubmit} className="booking-form">
            {error && (
              <div className="form-error">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="form-section">
              <h3>Booking Information</h3>
              
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Team Meeting, Study Session"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description of your booking"
                  rows="3"
                />
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
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="maxParticipants">Number of Participants</label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  min="1"
                  max={room?.capacity}
                />
                <small>Maximum: {room?.capacity} people</small>
              </div>
            </div>

            {/* Sharing Options */}
            <div className="form-section">
              <h3>Sharing & Collaboration</h3>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                  />
                  <span>Make this booking public</span>
                  <small>Other users can see this booking</small>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="allowJoining"
                    checked={formData.allowJoining}
                    onChange={handleInputChange}
                  />
                  <span>Allow others to join</span>
                  <small>Other users can request to join this booking</small>
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="invitedUserEmails">Invite Users (Email)</label>
                <input
                  type="text"
                  id="invitedUserEmails"
                  name="invitedUserEmails"
                  value={formData.invitedUserEmails}
                  onChange={handleInputChange}
                  placeholder="email1@example.com, email2@example.com"
                />
                <small>Separate multiple emails with commas</small>
              </div>
            </div>

            {/* Settings */}
            <div className="form-section">
              <h3>Booking Settings</h3>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="requiresCheckIn"
                    checked={formData.requiresCheckIn}
                    onChange={handleInputChange}
                  />
                  <span>Require check-in</span>
                  <small>Participants must check in when they arrive</small>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="reminderEnabled"
                    checked={formData.reminderEnabled}
                    onChange={handleInputChange}
                  />
                  <span>Send reminders</span>
                  <small>Get notified before the booking starts</small>
                </label>
              </div>
            </div>

            {/* Recurring Options */}
            <div className="form-section">
              <h3>Recurring Booking</h3>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                  />
                  <span>Make this a recurring booking</span>
                  <small>Repeat this booking automatically</small>
                </label>
              </div>

              {formData.isRecurring && (
                <div className="recurring-options">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="recurring.recurrenceType">Repeat</label>
                      <select
                        id="recurring.recurrenceType"
                        name="recurring.recurrenceType"
                        value={formData.recurringDetails.recurrenceType}
                        onChange={handleInputChange}
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="recurring.recurrenceInterval">Every</label>
                      <input
                        type="number"
                        id="recurring.recurrenceInterval"
                        name="recurring.recurrenceInterval"
                        value={formData.recurringDetails.recurrenceInterval}
                        onChange={handleInputChange}
                        min="1"
                        max="4"
                      />
                    </div>
                  </div>

                  {formData.recurringDetails.recurrenceType === 'WEEKLY' && (
                    <div className="form-group">
                      <label>Days of Week</label>
                      <div className="days-of-week">
                        {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                          <label key={day} className="day-checkbox">
                            <input
                              type="checkbox"
                              checked={formData.recurringDetails.daysOfWeek.includes(day)}
                              onChange={(e) => handleDayOfWeekChange(day, e.target.checked)}
                            />
                            <span>{day.slice(0, 3)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="recurring.seriesEndDate">End Date</label>
                    <input
                      type="date"
                      id="recurring.seriesEndDate"
                      name="recurring.seriesEndDate"
                      value={formData.recurringDetails.seriesEndDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/rooms')}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Creating Booking...
                  </>
                ) : (
                  <>
                    <i className="fas fa-calendar-plus"></i>
                    Create Booking
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookRoom;
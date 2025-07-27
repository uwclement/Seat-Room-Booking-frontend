import React, { useState, useEffect } from 'react';
import { useSchedule } from '../../../hooks/useSchedule';
import TimePicker from '../../common/TimePicker';
import LocationSwitcher from './LocationSwitcher';
import { Clock, Calendar, AlertCircle, Check, X } from 'lucide-react';

const dayNameMap = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};

const commonTimes = [
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '20:00', label: '8:00 PM' },
];

// Helper component for form sections
const FormSection = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`form-section ${className}`}>
    <div className="form-section-header">
      {Icon && <Icon className="form-section-icon" size={20} />}
      <h4 className="form-section-title">{title}</h4>
    </div>
    <div className="form-section-content">
      {children}
    </div>
  </div>
);

// Toggle Switch Component
const ToggleSwitch = ({ id, checked, onChange, disabled, label, description }) => (
  <div className="toggle-group">
    <div className="toggle-switch-container">
      <label className="toggle-switch" htmlFor={id}>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="toggle-input"
        />
        <span className="toggle-slider"></span>
        <span className="toggle-label">{label}</span>
      </label>
    </div>
    {description && (
      <p className="toggle-description">{description}</p>
    )}
  </div>
);

// Day Selector Component
const DaySelector = ({ schedules, selectedDay, onDaySelect, disabled }) => (
  <div className="day-selector">
    {Array.isArray(schedules) && schedules.map(schedule => (
      <button
        key={schedule.id}
        type="button"
        className={`day-button ${selectedDay === schedule.dayOfWeek ? 'active' : ''} ${!schedule.isOpen ? 'closed' : ''}`}
        onClick={() => onDaySelect(schedule.dayOfWeek)}
        disabled={disabled}
        aria-pressed={selectedDay === schedule.dayOfWeek}
      >
        <span className="day-name">
          {dayNameMap[schedule.dayOfWeek] || schedule.dayOfWeek}
        </span>
        <span className="day-status">
          {schedule.isOpen ? (
            schedule.specialCloseTime ? 'Special Hours' : 'Open'
          ) : 'Closed'}
        </span>
      </button>
    ))}
  </div>
);

// Quick Time Selector
const QuickTimeSelector = ({ onTimeSelect, disabled, label }) => (
  <div className="quick-time-selector">
    <label className="quick-time-label">{label}</label>
    <div className="quick-time-buttons">
      {commonTimes.map(time => (
        <button
          key={time.value}
          type="button"
          className="quick-time-button"
          onClick={() => onTimeSelect(time.value)}
          disabled={disabled}
        >
          {time.label}
        </button>
      ))}
    </div>
  </div>
);

// Notification Component
const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const icons = {
    success: Check,
    error: AlertCircle,
    info: AlertCircle
  };

  const Icon = icons[type] || AlertCircle;

  return (
    <div className={`notification notification-${type}`} role="alert">
      <Icon size={20} className="notification-icon" />
      <span className="notification-message">{message}</span>
      <button 
        className="notification-close" 
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const ScheduleForm = () => {
  const { 
    schedules = [],
    handleUpdateSchedule, 
    handleSetDayClosed, 
    handleSetSpecialClosingTime,
    handleRemoveSpecialClosingTime,
    loading,
    // NEW: Location context
    selectedLocation,
    setSelectedLocation,
    isAdmin,
    isLibrarian,
    userLocation
  } = useSchedule();

  const [selectedDay, setSelectedDay] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [specialCloseTime, setSpecialCloseTime] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState('');
  const [showSpecialClose, setShowSpecialClose] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track form changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [openTime, closeTime, specialCloseTime, isOpen, message, showSpecialClose]);

  // Reset selected day when location changes (for admins)
  useEffect(() => {
    if (isAdmin) {
      setSelectedDay('');
      setHasUnsavedChanges(false);
    }
  }, [selectedLocation, isAdmin]);

  // Format time to 12-hour format for display
  const formatTimeDisplay = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (isOpen) {
      if (!openTime) {
        newErrors.openTime = 'Opening time is required when library is open';
      }
      if (!closeTime) {
        newErrors.closeTime = 'Closing time is required when library is open';
      }
      if (openTime && closeTime && openTime >= closeTime) {
        newErrors.closeTime = 'Closing time must be after opening time';
      }
      if (showSpecialClose && !specialCloseTime) {
        newErrors.specialCloseTime = 'Special closing time is required';
      }
      if (showSpecialClose && specialCloseTime && openTime && specialCloseTime <= openTime) {
        newErrors.specialCloseTime = 'Special closing time must be after opening time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  // Sync form fields when day changes
  useEffect(() => {
    if (!selectedDay) return;

    const schedule = schedules.find(s => s.dayOfWeek === selectedDay);
    if (schedule) {
      const formattedOpenTime = schedule.openTime ? formatTimeString(schedule.openTime) : '';
      const formattedCloseTime = schedule.closeTime ? formatTimeString(schedule.closeTime) : '';
      const formattedSpecialCloseTime = schedule.specialCloseTime ? formatTimeString(schedule.specialCloseTime) : '';
      
      setOpenTime(formattedOpenTime);
      setCloseTime(formattedCloseTime);
      setIsOpen(schedule.isOpen !== false);
      setMessage(schedule.message || '');
      setSpecialCloseTime(formattedSpecialCloseTime);
      setShowSpecialClose(!!schedule.specialCloseTime);
      setErrors({});
      setHasUnsavedChanges(false);
    }
  }, [selectedDay, schedules]);

  // Format time string to ensure consistent format (HH:MM format)
  const formatTimeString = (timeString) => {
    if (!timeString) return '';
    
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      if (parts.length === 3) {
        return `${parts[0]}:${parts[1]}`;
      }
    }
    
    return timeString;
  };

  // Format time for API submission (ensure HH:MM:SS format)
  const formatTimeForSubmission = (timeString) => {
    if (!timeString) return '';
    
    if (timeString.split(':').length === 3) {
      return timeString;
    }
    
    return `${timeString}:00`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDay || isSubmitting || loading) return;
    
    if (!validateForm()) {
      showNotification('error', 'Please fix the errors before saving');
      return;
    }
    
    setIsSubmitting(true);
    
    const schedule = schedules.find(s => s.dayOfWeek === selectedDay);
    if (!schedule?.id) {
      setIsSubmitting(false);
      return;
    }

    try {
      const formattedOpenTime = formatTimeForSubmission(openTime);
      const formattedCloseTime = formatTimeForSubmission(closeTime);
      const formattedSpecialCloseTime = showSpecialClose ? formatTimeForSubmission(specialCloseTime) : null;
      
      if (!isOpen) {
        await handleSetDayClosed(schedule.id, message);
        showNotification('success', `${dayNameMap[selectedDay]} marked as closed`);
      } else if (showSpecialClose && specialCloseTime) {
        await handleSetSpecialClosingTime(schedule.id, formattedSpecialCloseTime, message);
        showNotification('success', `Special closing time set for ${dayNameMap[selectedDay]}`);
      } else {
        const updatedSchedule = {
          id: schedule.id,
          dayOfWeek: selectedDay,
          openTime: formattedOpenTime,
          closeTime: formattedCloseTime,
          isOpen: true,
          message,
          specialCloseTime: null
        };
        
        await handleUpdateSchedule(schedule.id, updatedSchedule);
        showNotification('success', `Schedule updated for ${dayNameMap[selectedDay]}`);
      }
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error updating schedule:", error);
      showNotification('error', 'Failed to update schedule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSpecial = async () => {
    if (!selectedDay || isSubmitting || loading) return;
    
    if (!window.confirm('Are you sure you want to remove the special closing time?')) {
      return;
    }
    
    setIsSubmitting(true);
    
    const schedule = schedules.find(s => s.dayOfWeek === selectedDay);
    if (!schedule?.id) {
      setIsSubmitting(false);
      return;
    }

    try {
      await handleRemoveSpecialClosingTime(schedule.id);
      setSpecialCloseTime('');
      setShowSpecialClose(false);
      setHasUnsavedChanges(false);
      showNotification('success', 'Special closing time removed');
    } catch (error) {
      console.error("Error removing special closing time:", error);
      showNotification('error', 'Failed to remove special closing time');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="schedule-form">
      <Notification 
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: '', message: '' })}
      />

      {/* NEW: Location Switcher */}
      <LocationSwitcher 
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        isAdmin={isAdmin}
        userLocation={userLocation}
      />

      <form onSubmit={handleSubmit} noValidate>
        {/* Day Selection Section */}
        <FormSection title="Select Day" icon={Calendar}>
          <DaySelector
            schedules={schedules}
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
            disabled={isSubmitting || loading}
          />
        </FormSection>

        {selectedDay && (
          <>
            {/* Library Status Section */}
            <FormSection title={`${dayNameMap[selectedDay]} Settings`} icon={Clock}>
              <ToggleSwitch
                id="isOpen"
                checked={isOpen}
                onChange={(e) => {
                  setIsOpen(e.target.checked);
                  if (!e.target.checked) {
                    setShowSpecialClose(false);
                  }
                }}
                disabled={isSubmitting || loading}
                label={`Library is open on ${dayNameMap[selectedDay]}`}
                description={isOpen ? "Library will operate with regular or special hours" : "Library will be closed for the entire day"}
              />
            </FormSection>

            {isOpen && (
              <>
                {/* Operating Hours Section */}
                <FormSection title="Operating Hours" icon={Clock}>
                  <div className="time-inputs-container">
                    <div className="time-input-group">
                      <label htmlFor="openTime" className="time-label">
                        Opening Time
                        {openTime && (
                          <span className="time-display">({formatTimeDisplay(openTime)})</span>
                        )}
                      </label>
                      <TimePicker 
                        id="openTime"
                        value={openTime} 
                        onChange={setOpenTime}
                        disabled={isSubmitting || loading}
                        className={errors.openTime ? 'error' : ''}
                        aria-describedby={errors.openTime ? 'openTime-error' : undefined}
                      />
                      {errors.openTime && (
                        <div id="openTime-error" className="error-message" role="alert">
                          <AlertCircle size={16} />
                          {errors.openTime}
                        </div>
                      )}
                    </div>

                    <div className="time-input-group">
                      <label htmlFor="closeTime" className="time-label">
                        Closing Time
                        {closeTime && (
                          <span className="time-display">({formatTimeDisplay(closeTime)})</span>
                        )}
                      </label>
                      <TimePicker 
                        id="closeTime"
                        value={closeTime} 
                        onChange={setCloseTime}
                        disabled={isSubmitting || loading}
                        className={errors.closeTime ? 'error' : ''}
                        aria-describedby={errors.closeTime ? 'closeTime-error' : undefined}
                      />
                      {errors.closeTime && (
                        <div id="closeTime-error" className="error-message" role="alert">
                          <AlertCircle size={16} />
                          {errors.closeTime}
                        </div>
                      )}
                    </div>
                  </div>

                  <QuickTimeSelector
                    onTimeSelect={(time) => {
                      if (!openTime) setOpenTime(time);
                      else if (!closeTime) setCloseTime(time);
                    }}
                    disabled={isSubmitting || loading}
                    label="Quick Select Common Times"
                  />
                </FormSection>

                {/* Special Hours Section */}
                <FormSection title="Special Hours" icon={AlertCircle}>
                  <ToggleSwitch
                    id="specialClose"
                    checked={showSpecialClose}
                    onChange={(e) => setShowSpecialClose(e.target.checked)}
                    disabled={isSubmitting || loading}
                    label="Set special closing time for today"
                    description="Override the regular closing time with a special time for today only"
                  />

                  {showSpecialClose && (
                    <div className="special-time-container">
                      <div className="time-input-group">
                        <label htmlFor="specialCloseTime" className="time-label">
                          Special Closing Time
                          {specialCloseTime && (
                            <span className="time-display">({formatTimeDisplay(specialCloseTime)})</span>
                          )}
                        </label>
                        <div className="special-time-input">
                          <TimePicker 
                            id="specialCloseTime"
                            value={specialCloseTime}
                            onChange={setSpecialCloseTime}
                            disabled={isSubmitting || loading}
                            className={errors.specialCloseTime ? 'error' : ''}
                            aria-describedby={errors.specialCloseTime ? 'specialCloseTime-error' : undefined}
                          />
                          <button 
                            type="button" 
                            className="btn btn-danger btn-remove"
                            onClick={handleRemoveSpecial}
                            disabled={isSubmitting || loading}
                            title="Remove special closing time"
                          >
                            <X size={16} />
                            Remove
                          </button>
                        </div>
                        {errors.specialCloseTime && (
                          <div id="specialCloseTime-error" className="error-message" role="alert">
                            <AlertCircle size={16} />
                            {errors.specialCloseTime}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </FormSection>
              </>
            )}

            {/* Message Section */}
            <FormSection title="Additional Information">
              <div className="form-group">
                <label htmlFor="message" className="message-label">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  className="form-control message-textarea"
                  rows="3"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting || loading}
                  placeholder={
                    isOpen 
                      ? "E.g., Closing early for staff meeting, Limited services available today"
                      : "E.g., Closed due to public holiday, Closed for maintenance"
                  }
                  maxLength={200}
                />
                <div className="character-count">
                  {message.length}/200 characters
                </div>
              </div>
            </FormSection>

            {/* Action Buttons */}
            <div className="form-actions">
              <div className="save-status">
                {hasUnsavedChanges && (
                  <span className="unsaved-changes">
                    <AlertCircle size={16} />
                    Unsaved changes
                  </span>
                )}
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-save"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Updating schedule...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save Schedule
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </form>

      <style jsx>{`
        .schedule-form {
          max-width: 800px;
          margin: 0 auto;
          padding: 1.5rem;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .form-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .form-section-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          gap: 0.5rem;
        }

        .form-section-icon {
          color: #495057;
        }

        .form-section-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #212529;
        }

        .day-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .day-button {
          padding: 1rem;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          position: relative;
        }

        .day-button:hover {
          border-color: #0d6efd;
          background: #f8f9ff;
        }

        .day-button.active {
          border-color: #0d6efd;
          background: #0d6efd;
          color: white;
        }

        .day-button.closed {
          background: #f8f9fa;
          color: #6c757d;
        }

        .day-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .day-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .day-status {
          font-size: 0.75rem;
          opacity: 0.8;
        }


        .toggle-group {
          margin-bottom: 1rem;
        }

        .toggle-switch-container {
          display: flex;
          align-items: center;
        }

        .toggle-switch {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          user-select: none;
        }

        .toggle-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: relative;
          width: 50px;
          height: 24px;
          background: #ccc;
          border-radius: 24px;
          transition: 0.3s;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.3s;
        }

        .toggle-input:checked + .toggle-slider {
          background: #0d6efd;
        }

        .toggle-input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .toggle-label {
          font-weight: 500;
          color: #212529;
        }

        .toggle-description {
          margin: 0.5rem 0 0 0;
          font-size: 0.875rem;
          color: #6c757d;
        }

        .time-inputs-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .time-inputs-container {
            grid-template-columns: 1fr;
          }
        }

        .time-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .time-label {
          font-weight: 500;
          color: #212529;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .time-display {
          font-weight: 400;
          color: #0d6efd;
          font-size: 0.875rem;
        }

        .quick-time-selector {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #dee2e6;
        }

        .quick-time-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #495057;
          margin-bottom: 0.5rem;
        }

        .quick-time-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .quick-time-button {
          padding: 0.375rem 0.75rem;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          background: #fff;
          color: #495057;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .quick-time-button:hover {
          border-color: #0d6efd;
          color: #0d6efd;
        }

        .special-time-container {
          margin-top: 1rem;
          padding: 1rem;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
        }

        .special-time-input {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .btn-remove {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid #dc3545;
          background: #fff;
          color: #dc3545;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .btn-remove:hover {
          background: #dc3545;
          color: white;
        }

        .message-label {
          font-weight: 500;
          color: #212529;
          margin-bottom: 0.5rem;
        }

        .message-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .character-count {
          text-align: right;
          font-size: 0.75rem;
          color: #6c757d;
          margin-top: 0.25rem;
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid #dee2e6;
        }

        .save-status {
          display: flex;
          align-items: center;
        }

        .unsaved-changes {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #fd7e14;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .btn-save {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          background: #0d6efd;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 150px;
          justify-content: center;
        }

        .btn-save:hover:not(:disabled) {
          background: #0b5ed7;
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .form-control.error {
          border-color: #dc3545;
        }

        .notification {
          position: fixed;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          max-width: 400px;
          animation: slideInRight 0.3s ease;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .notification-success {
          background: #d1edff;
          border: 1px solid #0d6efd;
          color: #0d47a1;
        }

        .notification-error {
          background: #f8d7da;
          border: 1px solid #dc3545;
          color: #721c24;
        }

        .notification-message {
          flex: 1;
          font-weight: 500;
        }

        .notification-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          color: currentColor;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .notification-close:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default ScheduleForm;
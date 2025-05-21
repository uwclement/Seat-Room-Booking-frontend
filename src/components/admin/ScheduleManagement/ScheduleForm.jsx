import React, { useState, useEffect } from 'react';
import { useSchedule } from '../../../hooks/useSchedule';
import TimePicker from '../../common/TimePicker';

const dayNameMap = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};

const ScheduleForm = () => {
  const { 
    schedules = [], // Add default empty array to handle undefined
    handleUpdateSchedule, 
    handleSetDayClosed, 
    handleSetSpecialClosingTime,
    handleRemoveSpecialClosingTime,
    loading
  } = useSchedule();

  const [selectedDay, setSelectedDay] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [specialCloseTime, setSpecialCloseTime] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState('');
  const [showSpecialClose, setShowSpecialClose] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form fields when day changes
  useEffect(() => {
    if (!selectedDay) return;

    const schedule = schedules.find(s => s.dayOfWeek === selectedDay);
    if (schedule) {
      // Format times if needed (remove seconds if present)
      const formattedOpenTime = schedule.openTime ? formatTimeString(schedule.openTime) : '';
      const formattedCloseTime = schedule.closeTime ? formatTimeString(schedule.closeTime) : '';
      const formattedSpecialCloseTime = schedule.specialCloseTime ? formatTimeString(schedule.specialCloseTime) : '';
      
      setOpenTime(formattedOpenTime);
      setCloseTime(formattedCloseTime);
      setIsOpen(schedule.isOpen !== false);
      setMessage(schedule.message || '');
      setSpecialCloseTime(formattedSpecialCloseTime);
      setShowSpecialClose(!!schedule.specialCloseTime);
      
      console.log("Loaded schedule:", {
        id: schedule.id,
        day: schedule.dayOfWeek,
        openTime: formattedOpenTime,
        closeTime: formattedCloseTime,
        isOpen: schedule.isOpen,
        specialCloseTime: formattedSpecialCloseTime
      });
    }
  }, [selectedDay, schedules]);

  // Format time string to ensure consistent format (HH:MM format)
  const formatTimeString = (timeString) => {
    if (!timeString) return '';
    
    // If time includes seconds (HH:MM:SS), remove the seconds part
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      if (parts.length === 3) {
        return `${parts[0]}:${parts[1]}`; // Return HH:MM format
      }
    }
    
    return timeString;
  };

  // Format time for API submission (ensure HH:MM:SS format)
  const formatTimeForSubmission = (timeString) => {
    if (!timeString) return '';
    
    // If time is already in HH:MM:SS format, return as is
    if (timeString.split(':').length === 3) {
      return timeString;
    }
    
    // If time is in HH:MM format, add seconds
    return `${timeString}:00`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDay || isSubmitting || loading) return;
    
    setIsSubmitting(true);
    
    const schedule = schedules.find(s => s.dayOfWeek === selectedDay);
    if (!schedule?.id) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Format times for API submission
      const formattedOpenTime = formatTimeForSubmission(openTime);
      const formattedCloseTime = formatTimeForSubmission(closeTime);
      const formattedSpecialCloseTime = showSpecialClose ? formatTimeForSubmission(specialCloseTime) : null;
      
      if (!isOpen) {
        await handleSetDayClosed(schedule.id, message);
        console.log("Day marked as closed:", schedule.id);
      } else if (showSpecialClose && specialCloseTime) {
        await handleSetSpecialClosingTime(schedule.id, formattedSpecialCloseTime, message);
        console.log("Special closing time set:", {
          id: schedule.id,
          specialCloseTime: formattedSpecialCloseTime,
          message
        });
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
        
        console.log("Updating schedule with:", updatedSchedule);
        
        await handleUpdateSchedule(schedule.id, updatedSchedule);
        console.log("Schedule updated successfully");
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSpecial = async () => {
    if (!selectedDay || isSubmitting || loading) return;
    
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
      console.log("Special closing time removed");
    } catch (error) {
      console.error("Error removing special closing time:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="schedule-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Day:</label>
          <select 
            className="form-control"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            disabled={isSubmitting || loading}
          >
            <option value="">Select a day</option>
            {Array.isArray(schedules) && schedules.map(schedule => (
              <option key={schedule.id} value={schedule.dayOfWeek}>
                {dayNameMap[schedule.dayOfWeek] || schedule.dayOfWeek}
              </option>
            ))}
          </select>
        </div>

        {selectedDay && (
          <>
            <div className="form-group form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isOpen"
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
                disabled={isSubmitting || loading}
              />
              <label className="form-check-label" htmlFor="isOpen">
                Library is open on this day
              </label>
            </div>

            {isOpen && (
              <>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Opening Time:</label>
                      <TimePicker 
                        value={openTime} 
                        onChange={setOpenTime}
                        disabled={isSubmitting || loading} 
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Closing Time:</label>
                      <TimePicker 
                        value={closeTime} 
                        onChange={setCloseTime}
                        disabled={isSubmitting || loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="specialClose"
                    checked={showSpecialClose}
                    onChange={(e) => setShowSpecialClose(e.target.checked)}
                    disabled={isSubmitting || loading}
                  />
                  <label className="form-check-label" htmlFor="specialClose">
                    Set special closing time for today
                  </label>
                </div>

                {showSpecialClose && (
                  <div className="form-group">
                    <label>Special Closing Time:</label>
                    <div className="d-flex align-items-center">
                      <TimePicker 
                        value={specialCloseTime}
                        onChange={setSpecialCloseTime}
                        disabled={isSubmitting || loading}
                      />
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-danger ml-2"
                        onClick={handleRemoveSpecial}
                        disabled={isSubmitting || loading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="form-group">
              <label>Message (Optional):</label>
              <textarea
                className="form-control"
                rows="2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting || loading}
                placeholder={
                  isOpen 
                    ? "E.g., Closing early for staff meeting"
                    : "E.g., Closed due to public holiday"
                }
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default ScheduleForm;
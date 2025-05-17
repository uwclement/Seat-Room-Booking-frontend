import React, { useState, useEffect } from 'react';
import { useSchedule } from '../../../hooks/useSchedule';
import { format } from 'date-fns';
import TimePicker from '../../common/TimePicker';

const ScheduleForm = () => {
  const { 
    schedules, 
    handleUpdateSchedule, 
    handleSetDayClosed, 
    handleSetSpecialClosingTime,
    handleRemoveSpecialClosingTime 
  } = useSchedule();

  const [selectedDay, setSelectedDay] = useState(null);
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [specialCloseTime, setSpecialCloseTime] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState('');
  const [showSpecialClose, setShowSpecialClose] = useState(false);

  // Helper to get day name
  const getDayName = (day) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[day - 1];
  };

  // Load schedule data when a day is selected
  useEffect(() => {
    if (selectedDay) {
      const schedule = schedules.find(s => s.dayOfWeek === selectedDay);
      if (schedule) {
        setOpenTime(schedule.openTime);
        setCloseTime(schedule.closeTime);
        setIsOpen(schedule.isOpen !== false); // Handle null case
        setMessage(schedule.message || '');
        setSpecialCloseTime(schedule.specialCloseTime || '');
        setShowSpecialClose(!!schedule.specialCloseTime);
      }
    }
  }, [selectedDay, schedules]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedDay) return;
    
    const scheduleId = schedules.find(s => s.dayOfWeek === selectedDay)?.id;
    if (!scheduleId) return;

    if (!isOpen) {
      // Set day as closed
      handleSetDayClosed(scheduleId, message);
    } else if (showSpecialClose && specialCloseTime) {
      // Set special closing time
      handleSetSpecialClosingTime(scheduleId, specialCloseTime, message);
    } else {
      // Update regular schedule
      const updatedSchedule = {
        dayOfWeek: selectedDay,
        openTime,
        closeTime,
        isOpen,
        message,
        specialCloseTime: null
      };
      
      handleUpdateSchedule(scheduleId, updatedSchedule);
    }
  };

  const handleRemoveSpecial = () => {
    if (!selectedDay) return;
    
    const scheduleId = schedules.find(s => s.dayOfWeek === selectedDay)?.id;
    if (!scheduleId) return;
    
    handleRemoveSpecialClosingTime(scheduleId);
    setSpecialCloseTime('');
    setShowSpecialClose(false);
  };

  return (
    <div className="schedule-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Day:</label>
          <select 
            className="form-control"
            value={selectedDay || ''}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            <option value="">Select a day</option>
            {schedules.map(schedule => (
              <option key={schedule.id} value={schedule.dayOfWeek}>
                {getDayName(parseInt(schedule.dayOfWeek.replace('MONDAY', '1')
                                                  .replace('TUESDAY', '2')
                                                  .replace('WEDNESDAY', '3')
                                                  .replace('THURSDAY', '4')
                                                  .replace('FRIDAY', '5')
                                                  .replace('SATURDAY', '6')
                                                  .replace('SUNDAY', '7')))}
              </option>
            ))}
          </select>
        </div>

        {selectedDay && (
          <>
            <div className="form-group">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isOpen"
                  checked={isOpen}
                  onChange={(e) => setIsOpen(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="isOpen">
                  Library is open on this day
                </label>
              </div>
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
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Closing Time:</label>
                      <TimePicker 
                        value={closeTime}
                        onChange={setCloseTime}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="specialClose"
                      checked={showSpecialClose}
                      onChange={(e) => setShowSpecialClose(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="specialClose">
                      Set special closing time for today
                    </label>
                  </div>
                </div>

                {showSpecialClose && (
                  <div className="form-group">
                    <label>Special Closing Time:</label>
                    <div className="d-flex">
                      <TimePicker 
                        value={specialCloseTime}
                        onChange={setSpecialCloseTime}
                      />
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-danger ml-2"
                        onClick={handleRemoveSpecial}
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
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isOpen ? "E.g., Closing early for staff training" : "E.g., Closed for holiday"}
                rows="2"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default ScheduleForm;
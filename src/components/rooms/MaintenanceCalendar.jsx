import React, { useState } from 'react';

const MaintenanceCalendar = ({ room, onSetMaintenance, onClearMaintenance }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isMaintenanceDay = (day) => {
    if (!room.maintenanceStart || !room.maintenanceEnd) return false;
    
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const maintenanceStart = new Date(room.maintenanceStart);
    const maintenanceEnd = new Date(room.maintenanceEnd);
    
    return checkDate >= maintenanceStart && checkDate <= maintenanceEnd;
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setShowTimeSlots(true);
  };

  const handleTimeSlotSelect = (startHour, endHour) => {
    if (!selectedDate) return;
    
    const startTime = new Date(selectedDate);
    startTime.setHours(startHour, 0, 0, 0);
    
    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, 0, 0, 0);
    
    onSetMaintenance(room.id, startTime.toISOString(), endTime.toISOString(), 'Scheduled maintenance');
    setShowTimeSlots(false);
    setSelectedDate(null);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      const isMaintenance = isMaintenanceDay(day);
      const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date().setHours(0, 0, 0, 0);

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isMaintenance ? 'maintenance' : ''} ${isPast ? 'past' : 'clickable'}`}
          onClick={() => !isPast && handleDateClick(day)}
        >
          <span className="day-number">{day}</span>
          {isMaintenance && (
            <div className="maintenance-indicator">
              <i className="fas fa-tools"></i>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const timeSlots = [
    { label: '8:00 AM - 10:00 AM', start: 8, end: 10 },
    { label: '10:00 AM - 12:00 PM', start: 10, end: 12 },
    { label: '12:00 PM - 2:00 PM', start: 12, end: 14 },
    { label: '2:00 PM - 4:00 PM', start: 14, end: 16 },
    { label: '4:00 PM - 6:00 PM', start: 16, end: 18 },
    { label: '6:00 PM - 8:00 PM', start: 18, end: 20 }
  ];

  return (
    <div className="maintenance-calendar">
      <div className="calendar-header">
        <button className="btn btn-sm btn-outline" onClick={() => navigateMonth(-1)}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <h4>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h4>
        <button className="btn btn-sm btn-outline" onClick={() => navigateMonth(1)}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot today"></span>
          <span>Today</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot maintenance"></span>
          <span>Maintenance</span>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {renderCalendarDays()}
        </div>
      </div>

      {room.maintenanceStart && room.maintenanceEnd && (
        <div className="current-maintenance-info">
          <h5>Current Maintenance Window</h5>
          <div className="maintenance-details">
            <div className="maintenance-period">
              <i className="fas fa-calendar"></i>
              <span>
                {new Date(room.maintenanceStart).toLocaleDateString()} - 
                {new Date(room.maintenanceEnd).toLocaleDateString()}
              </span>
            </div>
            <button 
              className="btn btn-sm btn-warning"
              onClick={() => onClearMaintenance(room.id)}
            >
              <i className="fas fa-times"></i>
              Clear Maintenance
            </button>
          </div>
        </div>
      )}

      {showTimeSlots && selectedDate && (
        <div className="time-slot-modal">
          <div className="time-slot-content">
            <div className="time-slot-header">
              <h4>Select Time Slot for {selectedDate.toLocaleDateString()}</h4>
              <button 
                className="close-button"
                onClick={() => setShowTimeSlots(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="time-slots">
              {timeSlots.map(slot => (
                <button
                  key={slot.label}
                  className="time-slot-button"
                  onClick={() => handleTimeSlotSelect(slot.start, slot.end)}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceCalendar;
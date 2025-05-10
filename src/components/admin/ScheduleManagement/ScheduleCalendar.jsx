import React, { useState, useEffect } from 'react';
import { useSchedule } from '../../../hooks/useSchedule';

const ScheduleCalendar = () => {
  const { closureExceptions, regularSchedule } = useSchedule();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Generate calendar days for current month
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and how many days in month
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get day of week of first day (0 = Sunday, 6 = Saturday)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayWeekday;
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    const days = [];
    
    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
        events: []
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        events: []
      });
    }
    
    // Calculate how many days needed from next month to complete grid
    const totalDaysShown = Math.ceil(days.length / 7) * 7;
    const daysFromNextMonth = totalDaysShown - days.length;
    
    // Add days from next month
    for (let i = 1; i <= daysFromNextMonth; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        events: []
      });
    }
    
    // Add closure exceptions as events
    if (closureExceptions && closureExceptions.length > 0) {
      days.forEach(day => {
        const dayStart = new Date(day.date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(day.date.setHours(23, 59, 59, 999));
        
        // Find closures on this day
        const dayClosures = closureExceptions.filter(closure => {
          const closureDate = new Date(closure.date);
          return closureDate >= dayStart && closureDate <= dayEnd;
        });
        
        if (dayClosures.length > 0) {
          day.events.push(...dayClosures.map(closure => ({
            type: 'closure',
            title: closure.reason || 'Library Closed',
            fullDay: closure.closedAllDay,
            startTime: closure.openTime,
            endTime: closure.closeTime
          })));
        }
      });
    }
    
    // Add regular schedule info
    if (regularSchedule && regularSchedule.length > 0) {
      days.forEach(day => {
        const dayOfWeek = day.date.getDay();
        const scheduleForDay = regularSchedule.find(s => s.dayOfWeek === dayOfWeek);
        
        if (scheduleForDay) {
          // If there's a schedule for this day, mark it as open with the specified hours
          day.regularHours = {
            open: scheduleForDay.openTime,
            close: scheduleForDay.closeTime,
            isClosed: false
          };
        } else {
          // If there's no schedule for this day, mark it as closed
          day.regularHours = { 
            isClosed: true 
          };
        }
      });
    } else {
      // If no regular schedule is defined, default all days to open
      days.forEach(day => {
        day.regularHours = {
          open: '9:00 AM',
          close: '5:00 PM',
          isClosed: false
        };
      });
    }
    
    setCalendarDays(days);
  }, [currentDate, closureExceptions, regularSchedule]);
  
  // Go to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  // Go to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // Go to current month
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Format month and year
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };
  
      // Get CSS class for day
  const getDayClass = (day) => {
    let classes = ['calendar-day'];
    
    if (!day.isCurrentMonth) {
      classes.push('other-month');
    }
    
    if (day.events.length > 0) {
      classes.push('has-events');
    }
    
    // Add open-day class for days that are open
    if (day.regularHours && !day.regularHours.isClosed) {
      classes.push('open-day');
    }
    
    const today = new Date();
    if (day.date.toDateString() === today.toDateString()) {
      classes.push('today');
    }
    
    // Check if it's a weekend
    const dayOfWeek = day.date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      classes.push('weekend');
    }
    
    return classes.join(' ');
  };
  
  return (
    <div className="schedule-calendar">
      <div className="calendar-header">
        <h3>Library Schedule Calendar</h3>
        <div className="calendar-controls">
          <button className="btn btn-sm btn-outline-secondary" onClick={prevMonth}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="current-month">{formatMonthYear(currentDate)}</span>
          <button className="btn btn-sm btn-outline-secondary" onClick={nextMonth}>
            <i className="fas fa-chevron-right"></i>
          </button>
          <button className="btn btn-sm btn-outline-primary" onClick={goToToday}>
            Today
          </button>
        </div>
      </div>
      
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          <div className="weekday">Sun</div>
          <div className="weekday">Mon</div>
          <div className="weekday">Tue</div>
          <div className="weekday">Wed</div>
          <div className="weekday">Thu</div>
          <div className="weekday">Fri</div>
          <div className="weekday">Sat</div>
        </div>
        
        <div className="calendar-days">
          {calendarDays.map((day, index) => (
            <div key={index} className={getDayClass(day)}>
              <div className="day-number">{day.date.getDate()}</div>
              
              {day.regularHours && !day.regularHours.isClosed && (
                <div className="regular-hours open-status">
                  <span className="open-indicator">Open</span> {day.regularHours.open} - {day.regularHours.close}
                </div>
              )}
              
              {/* {day.regularHours && day.regularHours.isClosed && (
                <div className="day-closed">Closed</div>
              )} */}
              
              {day.events.map((event, eventIndex) => (
                <div 
                  key={eventIndex} 
                  className={`day-event ${event.fullDay ? 'full-day' : ''}`}
                  title={event.title}
                >
                  {event.fullDay ? (
                    <span>Closed: {event.title}</span>
                  ) : (
                    <span>
                      {event.startTime}-{event.endTime}: {event.title}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Today</span>
        </div>
        <div className="legend-item">
          <div className="legend-color open-day"></div>
          <span>Open</span>
        </div>
        <div className="legend-item">
          <div className="legend-color has-events"></div>
          <span>Special Schedule / Closure</span>
        </div>
        <div className="legend-item">
          <div className="legend-color weekend"></div>
          <span>Weekend</span>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
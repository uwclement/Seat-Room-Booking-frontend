import React, { useState, useEffect } from 'react';
import { useSchedule } from '../../../hooks/useSchedule';
import { format, parseISO } from 'date-fns';

const ScheduleCalendar = () => {
  const { closureExceptions, schedules, fetchClosureExceptions } = useSchedule();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Fetch closure exceptions when component mounts
  useEffect(() => {
    fetchClosureExceptions();
  }, [fetchClosureExceptions]);
  
  // Generate calendar days for current month
  useEffect(() => {
    if (!schedules || !closureExceptions) return;
    
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
      const date = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        date,
        isCurrentMonth: false,
        events: []
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        events: []
      });
    }
    
    // Calculate how many days needed from next month to complete grid
    const totalDaysShown = Math.ceil(days.length / 7) * 7;
    const daysFromNextMonth = totalDaysShown - days.length;
    
    // Add days from next month
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        events: []
      });
    }
    
    // Map day of week integers to DayOfWeek enum values
    const dayOfWeekMap = {
      0: 'SUNDAY',
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY'
    };
    
    // Check schedule and closures for each day
    days.forEach(day => {
      const dayOfWeek = day.date.getDay();
      const dayOfWeekStr = dayOfWeekMap[dayOfWeek];
      const formattedDate = format(day.date, 'yyyy-MM-dd');
      
      // STEP 1: First check for closure exceptions (highest priority)
      const exceptionForDay = closureExceptions.find(ex => {
        // Check if the dates match (ignoring time)
        return ex.date && ex.date.startsWith(formattedDate);
      });
      
      if (exceptionForDay) {
        console.log('Found exception for day:', formattedDate, exceptionForDay);
        
        if (exceptionForDay.closedAllDay) {
          // Full-day closure from exception
          day.status = { 
            isClosed: true,
            isException: true,
            reason: exceptionForDay.reason || 'Closed for the day',
            source: 'exception'
          };
          
          // Add to events for highlighting in the calendar
          day.events.push({
            type: 'closure',
            title: exceptionForDay.reason || 'Library Closed',
            fullDay: true
          });
        } else {
          // Modified hours from exception
          let openTime = exceptionForDay.openTime;
          let closeTime = exceptionForDay.closeTime;
          
          // Format times for display
          try {
            if (openTime) openTime = format(parseISO(openTime), 'h:mm a');
            if (closeTime) closeTime = format(parseISO(closeTime), 'h:mm a');
          } catch (e) {
            console.warn('Exception time parsing error:', e);
          }
          
          day.status = {
            isClosed: false,
            isException: true,
            hasSpecialHours: true,
            open: openTime,
            close: closeTime,
            message: exceptionForDay.reason || 'Modified hours',
            source: 'exception'
          };
          
          // Add to events for highlighting
          day.events.push({
            type: 'modified',
            title: exceptionForDay.reason || 'Modified Hours',
            fullDay: false,
            startTime: openTime,
            endTime: closeTime
          });
        }
      } else {
        // STEP 2: If no exception, check regular schedule
        const scheduleForDay = schedules.find(s => s.dayOfWeek === dayOfWeekStr);
        
        if (scheduleForDay) {
          console.log('Found schedule for day:', dayOfWeekStr, scheduleForDay);
          
          // Check if the day is marked as closed in regular schedule
          if (scheduleForDay.isOpen === false) {
            day.status = { 
              isClosed: true,
              isException: false,
              reason: scheduleForDay.message || 'Closed (Regular Schedule)',
              source: 'schedule'
            };
          } else {
            // Day is open according to regular schedule
            let openTime = scheduleForDay.openTime;
            let closeTime = scheduleForDay.closeTime;
            let hasSpecialHours = false;
            let message = scheduleForDay.message || '';
            
            // Check if there's a special closing time
            if (scheduleForDay.specialCloseTime) {
              closeTime = scheduleForDay.specialCloseTime;
              hasSpecialHours = true;
              message = message || 'Special closing time';
              
              // Add special closing as an event
              day.events.push({
                type: 'special-closing',
                title: message,
                fullDay: false,
                startTime: openTime,
                endTime: closeTime
              });
            }
            
            // Format times for display
            try {
              openTime = format(parseISO(openTime), 'h:mm a');
              closeTime = format(parseISO(closeTime), 'h:mm a');
            } catch (e) {
              // If time parsing fails, use the original string formats
              console.warn('Time parsing error:', e);
            }
            
            day.status = {
              isClosed: false,
              isException: false,
              hasSpecialHours,
              open: openTime,
              close: closeTime,
              message,
              source: 'schedule'
            };
          }
        } else {
          // If no schedule exists for this day, mark as closed
          day.status = { 
            isClosed: true,
            isException: false,
            reason: 'No schedule defined',
            source: 'default'
          };
        }
      }
    });
    
    setCalendarDays(days);
  }, [currentDate, closureExceptions, schedules]);
  
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
    
    // Mark days with different statuses
    if (day.status) {
      if (day.status.isClosed) {
        classes.push('closed-day');
        if (day.status.isException) {
          classes.push('exception-closure');
        }
      } else if (day.status.hasSpecialHours) {
        classes.push('special-hours-day');
        if (day.status.isException) {
          classes.push('exception-hours');
        }
      } else {
        classes.push('open-day');
      }
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
            <i className="fas fa-chevron-left"></i> Prev
          </button>
          <span className="current-month">{formatMonthYear(currentDate)}</span>
          <button className="btn btn-sm btn-outline-secondary" onClick={nextMonth}>
            Next <i className="fas fa-chevron-right"></i>
          </button>
          <button className="btn btn-sm btn-outline-primary ml-2" onClick={goToToday}>
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
              
              {day.status && !day.status.isClosed && (
                <div className={`day-status ${day.status.hasSpecialHours ? 'special-hours' : 'open-status'} ${day.status.isException ? 'exception' : ''}`}>
                  <span className="status-indicator">Open</span>
                  <div className="hours-time">{day.status.open} - {day.status.close}</div>
                  {day.status.message && (
                    <div className="hours-message" title={day.status.message}>
                      {day.status.message.length > 20 
                        ? day.status.message.substring(0, 20) + '...' 
                        : day.status.message}
                    </div>
                  )}
                </div>
              )}
              
              {day.status && day.status.isClosed && (
                <div className={`day-closed ${day.status.isException ? 'exception' : ''}`}>
                  <span className="closed-indicator">Closed</span>
                  {day.status.reason && (
                    <div className="closed-reason" title={day.status.reason}>
                      {day.status.reason.length > 20 
                        ? day.status.reason.substring(0, 20) + '...' 
                        : day.status.reason}
                    </div>
                  )}
                </div>
              )}
              
              {/* Visual indicator for source of schedule status */}
              {day.status && day.status.isException && (
                <div className="status-badge exception-badge" title="Special exception for this date">
                  E
                </div>
              )}
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
          <span>Open (Regular Schedule)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color special-hours-day"></div>
          <span>Special Hours (Regular Schedule)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color closed-day"></div>
          <span>Closed (Regular Schedule)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color exception-closure"></div>
          <span>Closed (Exception)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color exception-hours"></div>
          <span>Modified Hours (Exception)</span>
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
import React, { useState, useEffect } from 'react';
import { useSchedule } from '../../../hooks/useSchedule';
import LocationSwitcher from './LocationSwitcher';
import { format, parseISO } from 'date-fns';

const PublicScheduleCalendar = () => {
  const { 
    closureExceptions, 
    schedules, 
    fetchClosureExceptions,
    selectedLocation,
    setSelectedLocation,
    isAdmin,
    isLibrarian,
    userLocation,
    isAuthenticated // Add this if available, or remove if not needed
  } = useSchedule();
  
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

    // UPDATED: Get current location context - now available to all authenticated users
    // Priority: selectedLocation > userLocation > first available location
    const currentLocation = selectedLocation || userLocation || (schedules.length > 0 ? schedules[0].location : null);
    
    // Check schedule and closures for each day
    days.forEach(day => {
      const dayOfWeek = day.date.getDay();
      const dayOfWeekStr = dayOfWeekMap[dayOfWeek];
      const formattedDate = format(day.date, 'yyyy-MM-dd');
      
      // STEP 1: First check for closure exceptions (highest priority)
      const exceptionForDay = closureExceptions.find(ex => {
        // Check if the dates match (ignoring time)
        const matchesDate = ex.date && ex.date.startsWith(formattedDate);
        // UPDATED: Also match location if specified, or show if no location filter
        const matchesLocation = !currentLocation || !ex.location || ex.location === currentLocation;
        return matchesDate && matchesLocation;
      });
      
      if (exceptionForDay) {
        console.log('Found exception for day:', formattedDate, exceptionForDay);
        
        if (exceptionForDay.closedAllDay) {
          // Full-day closure from exception
          day.status = { 
            isClosed: true,
            isException: true,
            reason: exceptionForDay.reason || 'Closed for the day',
            source: 'exception',
            location: exceptionForDay.location
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
            source: 'exception',
            location: exceptionForDay.location
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
        // UPDATED: Filter schedules by current location (available to all users)
        const scheduleForDay = schedules.find(s => 
          s.dayOfWeek === dayOfWeekStr && 
          (!currentLocation || s.location === currentLocation)
        );
        
        if (scheduleForDay) {
          console.log('Found schedule for day:', dayOfWeekStr, scheduleForDay);
          
          // Check if the day is marked as closed in regular schedule
          if (scheduleForDay.isOpen === false) {
            day.status = { 
              isClosed: true,
              isException: false,
              reason: scheduleForDay.message || 'Closed (Regular Schedule)',
              source: 'schedule',
              location: scheduleForDay.location
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
              source: 'schedule',
              location: scheduleForDay.location
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
  }, [currentDate, closureExceptions, schedules, selectedLocation, userLocation]);
  
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

  // Get location display name
  const getLocationDisplayName = (location) => {
    const names = {
      'GISHUSHU': 'Gishushu Campus',
      'MASORO': 'Masoro Campus'
    };
    return names[location] || location;
  };

  // UPDATED: Get current location for display - available to all users
  const getCurrentLocationDisplay = () => {
    const currentLocation = selectedLocation || userLocation;
    return currentLocation ? getLocationDisplayName(currentLocation) : 'All Locations';
  };

  // UPDATED: Show available locations from schedules to all users
  const getAvailableLocations = () => {
    const locations = [...new Set(schedules.map(s => s.location).filter(Boolean))];
    return locations;
  };
  
  return (
    <div className="schedule-calendar">
      {/* UPDATED: Location Switcher now available to all authenticated users */}
      <LocationSwitcher 
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        isAdmin={true} // Always allow location switching for authenticated users
        userLocation={userLocation}
        availableLocations={getAvailableLocations()} // Pass available locations
      />

      <div className="calendar-header">
        <h3>Library Schedule Calendar - {getCurrentLocationDisplay()}</h3>
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
                  {/* UPDATED: Show location info for all users */}
                  {day.status.location && (
                    <div className="location-info" title={`Location: ${getLocationDisplayName(day.status.location)}`}>
                      <small>{getLocationDisplayName(day.status.location)}</small>
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
                  {/* UPDATED: Show location info for all users */}
                  {day.status.location && (
                    <div className="location-info" title={`Location: ${getLocationDisplayName(day.status.location)}`}>
                      <small>{getLocationDisplayName(day.status.location)}</small>
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

      <style jsx>{`
        .schedule-calendar {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e9ecef;
        }

        .calendar-header h3 {
          margin: 0;
          color: #212529;
          font-weight: 600;
        }

        .calendar-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          background: #fff;
          color: #495057;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .btn:hover {
          border-color: #0d6efd;
          color: #0d6efd;
        }

        .btn-outline-primary {
          border-color: #0d6efd;
          color: #0d6efd;
        }

        .btn-outline-primary:hover {
          background: #0d6efd;
          color: white;
        }

        .current-month {
          font-weight: 600;
          font-size: 1.1rem;
          color: #495057;
          min-width: 180px;
          text-align: center;
        }

        .calendar-grid {
          margin-bottom: 2rem;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: #dee2e6;
          border-radius: 8px 8px 0 0;
          overflow: hidden;
        }

        .weekday {
          background: #f8f9fa;
          padding: 1rem;
          text-align: center;
          font-weight: 600;
          color: #495057;
          font-size: 0.875rem;
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: #dee2e6;
          border-radius: 0 0 8px 8px;
          overflow: hidden;
        }

        .calendar-day {
          background: #fff;
          min-height: 130px;
          padding: 0.75rem;
          position: relative;
          transition: background-color 0.2s ease;
        }

        .calendar-day:hover {
          background: #f8f9fa;
        }

        .calendar-day.other-month {
          background: #f8f9fa;
          color: #6c757d;
        }

        .calendar-day.today {
          background: #fff3cd;
          border: 2px solid #ffc107;
        }

        .calendar-day.open-day {
          border-left: 4px solid #198754;
        }

        .calendar-day.closed-day {
          border-left: 4px solid #dc3545;
        }

        .calendar-day.special-hours-day {
          border-left: 4px solid #fd7e14;
        }

        .calendar-day.exception-closure {
          border-left: 4px solid #6f42c1;
        }

        .calendar-day.exception-hours {
          border-left: 4px solid #d63384;
        }

        .calendar-day.weekend {
          background: #f1f3f4;
        }

        .day-number {
          font-weight: 600;
          font-size: 1rem;
          color: #212529;
          margin-bottom: 0.5rem;
        }

        .day-status {
          font-size: 0.75rem;
          line-height: 1.2;
        }

        .status-indicator {
          font-weight: 600;
          color: #198754;
          display: block;
          margin-bottom: 0.25rem;
        }

        .hours-time {
          color: #495057;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .hours-message {
          color: #6c757d;
          font-style: italic;
          margin-bottom: 0.25rem;
        }

        .location-info {
          color: #007bff;
          font-size: 0.65rem;
          font-weight: 500;
          margin-top: 0.25rem;
        }

        .day-closed .closed-indicator {
          font-weight: 600;
          color: #dc3545;
          display: block;
          margin-bottom: 0.25rem;
        }

        .closed-reason {
          color: #6c757d;
          font-style: italic;
          margin-bottom: 0.25rem;
        }

        .special-hours .status-indicator {
          color: #fd7e14;
        }

        .exception .status-indicator,
        .exception .closed-indicator {
          color: #6f42c1;
        }

        .status-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.625rem;
          font-weight: 600;
          color: white;
        }

        .exception-badge {
          background: #6f42c1;
        }

        .calendar-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 3px;
        }

        .legend-color.today {
          background: #ffc107;
        }

        .legend-color.open-day {
          background: #198754;
        }

        .legend-color.closed-day {
          background: #dc3545;
        }

        .legend-color.special-hours-day {
          background: #fd7e14;
        }

        .legend-color.exception-closure {
          background: #6f42c1;
        }

        .legend-color.exception-hours {
          background: #d63384;
        }

        .legend-color.weekend {
          background: #6c757d;
        }

        @media (max-width: 768px) {
          .calendar-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .calendar-controls {
            justify-content: center;
          }

          .calendar-day {
            min-height: 100px;
            padding: 0.5rem;
          }

          .legend-item {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicScheduleCalendar;
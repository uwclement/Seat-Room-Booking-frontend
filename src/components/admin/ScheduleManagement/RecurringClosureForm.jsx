import React, { useState } from 'react';
import { useSchedule } from '../../../hooks/useSchedule';
import DatePicker from '../../common/DatePicker';
import TimePicker from '../../common/TimePicker';

const RecurringClosureForm = ({ onPreview }) => {
  const { handleCreateRecurringClosures } = useSchedule();
  
  const [recurrenceType, setRecurrenceType] = useState('weekly');
  const [dayOfWeek, setDayOfWeek] = useState('MONDAY');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 1)));
  const [closedAllDay, setClosedAllDay] = useState(true);
  const [openTime, setOpenTime] = useState('09:00:00');
  const [closeTime, setCloseTime] = useState('17:00:00');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const recurringClosureData = {
      startDate,
      endDate,
      closedAllDay,
      reason
    };
    
    if (recurrenceType === 'weekly') {
      recurringClosureData.dayOfWeek = dayOfWeek;
    } else if (recurrenceType === 'monthly') {
      recurringClosureData.dayOfMonth = parseInt(dayOfMonth);
    }
    
    if (!closedAllDay) {
      recurringClosureData.openTime = openTime;
      recurringClosureData.closeTime = closeTime;
    }
    
    handleCreateRecurringClosures(recurringClosureData);
  };

  const handlePreviewClick = () => {
    if (onPreview) {
      const previewData = {
        recurrenceType,
        dayOfWeek: recurrenceType === 'weekly' ? dayOfWeek : null,
        dayOfMonth: recurrenceType === 'monthly' ? dayOfMonth : null,
        startDate,
        endDate,
        closedAllDay,
        openTime: !closedAllDay ? openTime : null,
        closeTime: !closedAllDay ? closeTime : null,
        reason
      };
      
      onPreview(previewData);
    }
  };

  return (
    <div className="recurring-closure-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Recurrence Type:</label>
          <div className="form-check">
            <input
              type="radio"
              className="form-check-input"
              id="recurrenceWeekly"
              checked={recurrenceType === 'weekly'}
              onChange={() => setRecurrenceType('weekly')}
            />
            <label className="form-check-label" htmlFor="recurrenceWeekly">
              Weekly (e.g., every Monday)
            </label>
          </div>
          <div className="form-check">
            <input
              type="radio"
              className="form-check-input"
              id="recurrenceMonthly"
              checked={recurrenceType === 'monthly'}
              onChange={() => setRecurrenceType('monthly')}
            />
            <label className="form-check-label" htmlFor="recurrenceMonthly">
              Monthly (e.g., 15th of each month)
            </label>
          </div>
        </div>

        {recurrenceType === 'weekly' && (
          <div className="form-group">
            <label>Day of Week:</label>
            <select 
              className="form-control"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
            >
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
              <option value="SATURDAY">Saturday</option>
              <option value="SUNDAY">Sunday</option>
            </select>
          </div>
        )}

        {recurrenceType === 'monthly' && (
          <div className="form-group">
            <label>Day of Month:</label>
            <select 
              className="form-control"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
            >
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Date Range:</label>
          <div className="row">
            <div className="col-md-6">
              <label>Start Date:</label>
              <DatePicker
                selectedDate={startDate}
                onChange={setStartDate}
              />
            </div>
            <div className="col-md-6">
              <label>End Date:</label>
              <DatePicker
                selectedDate={endDate}
                onChange={setEndDate}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="closedAllDay"
              checked={closedAllDay}
              onChange={(e) => setClosedAllDay(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="closedAllDay">
              Closed All Day
            </label>
          </div>
        </div>

        {!closedAllDay && (
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
        )}

        <div className="form-group">
          <label>Reason for Closure:</label>
          <textarea
            className="form-control"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="E.g., Holiday break, Maintenance period"
            rows="2"
          />
        </div>

        <div className="button-group">
          <button type="button" className="btn btn-secondary mr-2" onClick={handlePreviewClick}>
            Preview
          </button>
          <button type="submit" className="btn btn-primary">
            Create Recurring Closures
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecurringClosureForm;
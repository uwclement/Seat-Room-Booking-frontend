import React from 'react';
import { format } from 'date-fns';

const MessagePreview = ({ closureData }) => {
  if (!closureData) {
    return (
      <div className="message-preview">
        <h4>Preview</h4>
        <div className="empty-state">
          <p>Click "Preview" to see how your recurring closure will look.</p>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  const formatTime = (time) => {
    return time ? time.substring(0, 5) : '';
  };

  const getDayOfWeekString = (dayOfWeek) => {
    const days = {
      'MONDAY': 'Monday',
      'TUESDAY': 'Tuesday',
      'WEDNESDAY': 'Wednesday',
      'THURSDAY': 'Thursday',
      'FRIDAY': 'Friday',
      'SATURDAY': 'Saturday',
      'SUNDAY': 'Sunday'
    };
    return days[dayOfWeek] || dayOfWeek;
  };

  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Generate the summary message
  let summaryMessage = '';
  if (closureData.recurrenceType === 'weekly') {
    summaryMessage = `Every ${getDayOfWeekString(closureData.dayOfWeek)}`;
  } else if (closureData.recurrenceType === 'monthly') {
    summaryMessage = `The ${getOrdinal(closureData.dayOfMonth)} of each month`;
  }

  summaryMessage += ` from ${formatDate(closureData.startDate)} to ${formatDate(closureData.endDate)}`;

  // Generate the hours message
  let hoursMessage = '';
  if (closureData.closedAllDay) {
    hoursMessage = 'Library will be closed all day';
  } else {
    hoursMessage = `Library will be open from ${formatTime(closureData.openTime)} to ${formatTime(closureData.closeTime)}`;
  }

  return (
    <div className="message-preview card">
      <div className="card-header">
        <h4>Preview</h4>
      </div>
      <div className="card-body">
        <div className="preview-content">
          <h5>Recurring Closure</h5>
          <p><strong>Pattern:</strong> {summaryMessage}</p>
          <p><strong>Hours:</strong> {hoursMessage}</p>
          {closureData.reason && (
            <p><strong>Reason:</strong> {closureData.reason}</p>
          )}
          <hr />
          <p className="text-muted">This will create individual closure exceptions for each occurrence within the date range.</p>
        </div>
      </div>
    </div>
  );
};

export default MessagePreview;
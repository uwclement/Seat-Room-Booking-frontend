import React, { useState } from 'react';
import { useSchedule } from '../../../hooks/useSchedule';

const RecurringClosureForm = () => {
  const { handleCreateRecurringClosures, loading } = useSchedule();

  const [formData, setFormData] = useState({
    dayOfWeek: 6, // Saturday by default
    startDate: '',
    endDate: '',
    startTime: '17:00',
    endTime: '09:00',
    reason: 'Weekend Closure',
    isFullDay: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    handleCreateRecurringClosures({
      ...formData,
      endDayOfWeek: (formData.dayOfWeek === 6) ? 0 : parseInt(formData.dayOfWeek) + 1 // Next day by default
    });
    
    // Reset form to default values
    setFormData({
      dayOfWeek: 6,
      startDate: '',
      endDate: '',
      startTime: '17:00',
      endTime: '09:00',
      reason: 'Weekend Closure',
      isFullDay: false
    });
  };

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  // Calculate minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  return (
    <div className="recurring-closure-form">
      <div className="card">
        <div className="card-header">
          <h3>Create Recurring Closures</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="dayOfWeek">Day of Week:</label>
              <select
                id="dayOfWeek"
                name="dayOfWeek"
                className="form-control"
                value={formData.dayOfWeek}
                onChange={handleChange}
              >
                {daysOfWeek.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
              <small className="form-text text-muted">
                The day when the closure begins. For overnight closures, the end will be the next day.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-control"
                value={formData.startDate}
                onChange={handleChange}
                min={minDate}
                required
              />
              <small className="form-text text-muted">
                First occurrence of this recurring closure
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-control"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || minDate}
              />
              <small className="form-text text-muted">
                Last occurrence of this recurring closure (leave blank for indefinite)
              </small>
            </div>

            <div className="form-check mb-3">
              <input
                type="checkbox"
                id="isFullDay"
                name="isFullDay"
                className="form-check-input"
                checked={formData.isFullDay}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="isFullDay">
                Full Day Closure
              </label>
            </div>

            {!formData.isFullDay && (
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="startTime">Closing Time:</label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      className="form-control"
                      value={formData.startTime}
                      onChange={handleChange}
                      required={!formData.isFullDay}
                    />
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="endTime">Reopening Time:</label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      className="form-control"
                      value={formData.endTime}
                      onChange={handleChange}
                      required={!formData.isFullDay}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="reason">Closure Reason:</label>
              <input
                type="text"
                id="reason"
                name="reason"
                className="form-control"
                value={formData.reason}
                onChange={handleChange}
                required
                placeholder="Why is the library closed during this time?"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Recurring Closures'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecurringClosureForm;
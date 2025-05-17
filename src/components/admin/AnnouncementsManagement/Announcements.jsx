import React, { useState } from 'react';
import { useSchedule } from '../../../hooks/useSchedule';
import DateTimePicker from '../../common/DateTimePicker';
import { format } from 'date-fns';

const AnnouncementsManagement = () => {
  const { announcements, handleCreateAnnouncement } = useSchedule();
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const announcementData = {
      title,
      message,
      startDateTime,
      endDateTime,
      isUIVisible,
      isNotificationEnabled
    };
    
    handleCreateAnnouncement(announcementData);
    
    // Reset form
    setTitle('');
    setMessage('');
    setStartDateTime(new Date());
    setEndDateTime(new Date(new Date().setDate(new Date().getDate() + 1)));
    setIsUIVisible(true);
    setIsNotificationEnabled(false);
  };

  return (
    <div className="announcements-management">
      <div className="row">
        <div className="col-md-6">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Announcement Title:</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Visitors Today"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Announcement Message:</label>
              <textarea
                className="form-control"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="E.g., Please remember to bring your ID cards as we have visitors on campus today."
                rows="3"
                required
              />
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Start Date & Time:</label>
                  <DateTimePicker
                    selectedDate={startDateTime}
                    onChange={setStartDateTime}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>End Date & Time:</label>
                  <DateTimePicker
                    selectedDate={endDateTime}
                    onChange={setEndDateTime}
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isUIVisible"
                  checked={isUIVisible}
                  onChange={(e) => setIsUIVisible(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="isUIVisible">
                  Display in User Interface
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isNotificationEnabled"
                  checked={isNotificationEnabled}
                  onChange={(e) => setIsNotificationEnabled(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="isNotificationEnabled">
                  Send as Notification
                </label>
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary">
              Create Announcement
            </button>
          </form>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Current Announcements</h5>
            </div>
            <div className="card-body">
              {announcements.length === 0 ? (
                <p className="text-muted">No active announcements</p>
              ) : (
                <div className="announcements-list">
                  {announcements.map(announcement => (
                    <div key={announcement.id} className="announcement-item">
                      <h5>{announcement.title}</h5>
                      <p>{announcement.message}</p>
                      <div className="announcement-meta">
                        <span className="badge badge-info mr-2">
                          {announcement.isUIVisible ? 'UI Visible' : 'UI Hidden'}
                        </span>
                        <span className="badge badge-warning mr-2">
                          {announcement.isNotificationEnabled ? 'Notification Enabled' : 'No Notification'}
                        </span>
                        <span className="text-muted">
                          {format(new Date(announcement.startDateTime), 'MMM d, h:mm a')} - 
                          {format(new Date(announcement.endDateTime), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsManagement;
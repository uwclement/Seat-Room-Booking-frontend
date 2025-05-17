import React, { useState } from 'react';
import { useSchedule } from '../../hooks/useSchedule';
import ScheduleForm from '../../components/admin/ScheduleManagement/ScheduleForm';
import RecurringClosureForm from '../../components/admin/ScheduleManagement/RecurringClosureForm';
import ScheduleStatusBanner from '../../components/admin/ScheduleManagement/ScheduleStatusBanner';
import MessagePreview from '../../components/admin/ScheduleManagement/MessagePreview';
import AnnouncementsManagement from '../../components/admin/AnnouncementsManagement/Announcements';
import ScheduleCalendar from '../../components/admin/ScheduleManagement/ScheduleCalendar';
import Alert from '../../components/common/Alert';
import AdminSidebar from '../../components/common/AdminSidebar';
import ActionButton from '../../components/common/ActionButton';
import '../../assets/css/admin.css';

const ScheduleManagement = () => {
  const { error, success, setError, handleSetScheduleMessage, scheduleMessage } = useSchedule();
  const [currentMessage, setCurrentMessage] = useState(scheduleMessage);
  const [previewData, setPreviewData] = useState(null);
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'calendar'
  const [activeSection, setActiveSection] = useState('schedule'); // 'schedule', 'closures', or 'announcements'

  const handleMessageChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  const saveMessage = () => {
    handleSetScheduleMessage(currentMessage);
  };

  // For the message preview
  const handlePreview = (data) => {
    setPreviewData(data);
  };

  return (
    <div className="admin-page-container">
      <AdminSidebar activePage="schedule" />
      
      <div className="admin-content">
        <div className="admin-header">
          <h1>Library Schedule Management</h1>
          <p className="admin-subtitle">
            Set library opening hours, manage closures, and communicate with users
          </p>
        </div>

        <ScheduleStatusBanner />

        {error && (
          <Alert
            type="danger"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => {}}
            autoClose={true}
          />
        )}
        
        <div className="section-tabs">
          <button 
            className={`section-tab ${activeSection === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveSection('schedule')}
          >
            Regular Schedule
          </button>
          <button 
            className={`section-tab ${activeSection === 'closures' ? 'active' : ''}`}
            onClick={() => setActiveSection('closures')}
          >
            Recurring Closures
          </button>
          <button 
            className={`section-tab ${activeSection === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveSection('announcements')}
          >
            Announcements
          </button>
        </div>

        {activeSection === 'schedule' && (
          <div className="admin-card">
            <div className="card-header">
              <div className="tab-navigation">
                <button 
                  className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
                  onClick={() => setActiveTab('form')}
                >
                  Form View
                </button>
                <button 
                  className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
                  onClick={() => setActiveTab('calendar')}
                >
                  Calendar View
                </button>
              </div>
            </div>
            <div className="card-body">
              {activeTab === 'form' ? (
                <ScheduleForm />
              ) : (
                <ScheduleCalendar />
              )}
            </div>
          </div>
        )}

        {activeSection === 'closures' && (
          <div className="admin-card">
            <div className="card-header">
              <h2>Recurring Closures</h2>
              <p className="text-muted">Set up recurring closures for holidays, breaks, or regular maintenance</p>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <RecurringClosureForm onPreview={handlePreview} />
                </div>
                <div className="col-md-4">
                  <MessagePreview closureData={previewData} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'announcements' && (
          <>
            <div className="admin-card">
              <div className="card-header">
                <h2>Library Announcements</h2>
                <p className="text-muted">Create time-sensitive announcements to display to users</p>
              </div>
              <div className="card-body">
                <AnnouncementsManagement />
              </div>
            </div>

            <div className="admin-card">
              <div className="card-header">
                <h2>Quick Message</h2>
                <p className="text-muted">Set a temporary message to show to all users</p>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="scheduleMessage">Current Message:</label>
                  <textarea
                    id="scheduleMessage"
                    className="form-control"
                    value={currentMessage}
                    onChange={handleMessageChange}
                    placeholder="Enter a message that will be displayed to all users (e.g., 'Library will be closing early today at 3PM for staff training.')"
                    rows="3"
                  ></textarea>
                  <small className="form-text text-muted">
                    This message will be shown to all users on the library homepage.
                  </small>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={saveMessage}
                >
                  Save Message
                </button>
              </div>
            </div>
          </>
        )}
        
        <ActionButton />
      </div>
    </div>
  );
};

export default ScheduleManagement;
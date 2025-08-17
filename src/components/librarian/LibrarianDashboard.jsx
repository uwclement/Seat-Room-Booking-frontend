import React, { useState, useEffect } from 'react';
import { librarianService } from '../../api/librarianService';

const LibrarianDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [colleagues, setColleagues] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchLibrarianData();
  }, []);

  const fetchLibrarianData = async () => {
    try {
      setLoading(true);
      const [profileData, colleaguesData, scheduleData] = await Promise.all([
        librarianService.getMyProfile(),
        librarianService.getMyColleagues(),
        librarianService.getMyWeeklySchedule()
      ]);
      
      setProfile(profileData);
      setColleagues(colleaguesData);
      setWeeklySchedule(scheduleData);
    } catch (err) {
      setError('Failed to load librarian data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActiveStatus = async () => {
    try {
      setUpdating(true);
      await librarianService.toggleLibrarianActiveStatus(profile.id);
      await fetchLibrarianData(); // Refresh data
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="librarian-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="librarian-dashboard">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchLibrarianData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="librarian-dashboard">
      <div className="dashboard-header">
        <h1><i className="fas fa-tachometer-alt"></i> Librarian Dashboard</h1>
        <p>Welcome back, {profile?.fullName}</p>
      </div>

      {/* Status Card */}
      <div className="status-card">
        <div className="status-info">
          <h3>Your Current Status</h3>
          <div className={`status-indicator ${profile?.activeThisWeek ? 'active' : 'inactive'}`}>
            <i className={`fas ${profile?.activeThisWeek ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            <span>{profile?.activeThisWeek ? 'Active This Week' : 'Inactive This Week'}</span>
          </div>
          
          {profile?.defaultLibrarian && (
            <div className="default-indicator">
              <i className="fas fa-star"></i>
              <span>Default Librarian for {profile.locationDisplayName}</span>
            </div>
          )}
        </div>
        
        <div className="status-actions">
          <button 
            className={`btn ${profile?.activeThisWeek ? 'btn-warning' : 'btn-success'}`}
            onClick={handleToggleActiveStatus}
            disabled={updating}
          >
            {updating ? (
              <>
                <div className="btn-spinner"></div>
                Updating...
              </>
            ) : (
              <>
                <i className={`fas ${profile?.activeThisWeek ? 'fa-pause' : 'fa-play'}`}></i>
                {profile?.activeThisWeek ? 'Mark Inactive' : 'Mark Active'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <h3><i className="fas fa-user"></i> My Profile</h3>
        <div className="profile-details">
          <div className="detail-row">
            <label>Name:</label>
            <span>{profile?.fullName}</span>
          </div>
          <div className="detail-row">
            <label>Email:</label>
            <span>{profile?.email}</span>
          </div>
          <div className="detail-row">
            <label>Employee ID:</label>
            <span>{profile?.employeeId}</span>
          </div>
          <div className="detail-row">
            <label>Location:</label>
            <span>{profile?.locationDisplayName}</span>
          </div>
          <div className="detail-row">
            <label>Working Days:</label>
            <span>{profile?.workingDaysString || 'Not set'}</span>
          </div>
        </div>
      </div>

      {/* Colleagues Card */}
      <div className="colleagues-card">
        <h3><i className="fas fa-users"></i> My Colleagues at {profile?.locationDisplayName}</h3>
        {colleagues.length > 0 ? (
          <div className="colleagues-list">
            {colleagues.map(colleague => (
              <div key={colleague.id} className="colleague-item">
                <div className="colleague-info">
                  <h4>{colleague.fullName}</h4>
                  <p>{colleague.email}</p>
                  <span className="working-days">{colleague.workingDaysString}</span>
                </div>
                <div className="colleague-status">
                  <span className={`status-badge ${colleague.activeThisWeek ? 'active' : 'inactive'}`}>
                    {colleague.activeThisWeek ? 'Active' : 'Inactive'}
                  </span>
                  {colleague.defaultLibrarian && (
                    <span className="default-badge">
                      <i className="fas fa-star"></i> Default
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-colleagues">
            <i className="fas fa-info-circle"></i>
            <p>No other librarians at your location</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn">
            <i className="fas fa-calendar-alt"></i>
            <span>Update Schedule</span>
          </button>
          <button className="action-btn">
            <i className="fas fa-chart-line"></i>
            <span>View Reports</span>
          </button>
          <button className="action-btn">
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibrarianDashboard;
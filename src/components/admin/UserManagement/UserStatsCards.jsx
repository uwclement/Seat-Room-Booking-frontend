import React from 'react';

const UserStatsCards = ({ stats }) => {
  if (!stats) {
    return (
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">-</div>
          <div className="stat-label">Loading...</div>
        </div>
      </div>
    );
  }

  const getLocationStats = () => {
    const gishushu = stats.byLocation?.GISHUSHU || 0;
    const masoro = stats.byLocation?.MASORO || 0;
    const other = stats.total - gishushu - masoro;
    
    return { gishushu, masoro, other };
  };

  const locationStats = getLocationStats();

  return (
    <div className="stats-grid">
      <div className="stat-item available">
        <div className="stat-value">{stats.total || 0}</div>
        <div className="stat-label">Total Users</div>
        <div className="stat-detail">
          <i className="fas fa-users"></i>
          All system users
        </div>
      </div>

      <div className="stat-item study">
        <div className="stat-value">{stats.byRole?.ROLE_USER || 0}</div>
        <div className="stat-label">Students</div>
        <div className="stat-detail">
          <i className="fas fa-graduation-cap"></i>
          Registered students
        </div>
      </div>

      <div className="stat-item maintenance">
        <div className="stat-value">{stats.staff || 0}</div>
        <div className="stat-label">Staff Members</div>
        <div className="stat-detail">
          <i className="fas fa-user-tie"></i>
          All staff users
        </div>
      </div>

      <div className="stat-item disabled">
        <div className="stat-value">{stats.byRole?.ROLE_LIBRARIAN || 0}</div>
        <div className="stat-label">Librarians</div>
        <div className="stat-detail">
          <i className="fas fa-book-reader"></i>
          G: {locationStats.gishushu} | M: {locationStats.masoro}
        </div>
      </div>

      <div className="stat-item occupied">
        <div className="stat-value">{stats.byRole?.ROLE_PROFESSOR || 0}</div>
        <div className="stat-label">Professors</div>
        <div className="stat-detail">
          <i className="fas fa-chalkboard-teacher"></i>
          Academic staff
        </div>
      </div>

      <div className="stat-item admin">
        <div className="stat-value">{stats.byRole?.ROLE_ADMIN || 0}</div>
        <div className="stat-label">Administrators</div>
        <div className="stat-detail">
          <i className="fas fa-user-shield"></i>
          System admins
        </div>
      </div>

      <div className="stat-item active">
        <div className="stat-value">{stats.activeUsers || 0}</div>
        <div className="stat-label">Active Users</div>
        <div className="stat-detail">
          <i className="fas fa-check-circle"></i>
          Enabled accounts
        </div>
      </div>

      <div className="stat-item inactive">
        <div className="stat-value">{stats.inactiveUsers || 0}</div>
        <div className="stat-label">Inactive Users</div>
        <div className="stat-detail">
          <i className="fas fa-ban"></i>
          Disabled accounts
        </div>
      </div>
    </div>
  );
};

export default UserStatsCards;
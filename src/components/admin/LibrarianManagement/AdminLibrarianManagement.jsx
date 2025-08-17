import React, { useState, useEffect } from 'react';
import { librarianService } from '../../../api/librarianService';

const AdminLibrarianManagement = () => {
  const [librarians, setLibrarians] = useState([]);
  const [filteredLibrarians, setFilteredLibrarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const locations = ['ALL', 'Gishushu', 'MASORO'];
  const daysOfWeek = ['ALL', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  useEffect(() => {
    fetchLibrarians();
  }, []);

  useEffect(() => {
    filterLibrarians();
  }, [librarians, selectedLocation, selectedDay]);

  const fetchLibrarians = async () => {
    try {
      setLoading(true);
      const data = await librarianService.getAllLibrarians();
      setLibrarians(data);
    } catch (err) {
      setError('Failed to fetch librarians');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterLibrarians = () => {
    let filtered = [...librarians];

    if (selectedLocation !== 'ALL') {
      filtered = filtered.filter(lib => lib.location === selectedLocation);
    }

    if (selectedDay !== 'ALL') {
      filtered = filtered.filter(lib => 
        lib.workingDays && lib.workingDays.includes(selectedDay)
      );
    }

    setFilteredLibrarians(filtered);
  };

  const handleToggleActive = async (librarianId) => {
    try {
      await librarianService.toggleLibrarianActiveStatus(librarianId);
      fetchLibrarians(); // Refresh the list
    } catch (err) {
      alert('Failed to update librarian status');
    }
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading librarian management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1><i className="fas fa-users-cog"></i> Librarian Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          <i className="fas fa-plus"></i> Add New Librarian
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Location:</label>
          <select 
            value={selectedLocation} 
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Working Day:</label>
          <select 
            value={selectedDay} 
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            {daysOfWeek.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        <div className="filter-stats">
          <span>Showing {filteredLibrarians.length} of {librarians.length} librarians</span>
        </div>
      </div>

      {/* Librarians Table */}
      <div className="librarians-table-container">
        <table className="librarians-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Location</th>
              <th>Working Days</th>
              <th>Status</th>
              <th>Default</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLibrarians.map(librarian => (
              <tr key={librarian.id}>
                <td>
                  <div className="librarian-name">
                    <i className="fas fa-user-circle"></i>
                    <span>{librarian.fullName}</span>
                  </div>
                </td>
                <td>{librarian.email}</td>
                <td>
                  <span className="location-badge">{librarian.locationDisplayName}</span>
                </td>
                <td>
                  <div className="working-days">
                    {librarian.workingDaysString || 'Not set'}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${librarian.activeThisWeek ? 'active' : 'inactive'}`}>
                    <i className={`fas ${librarian.activeThisWeek ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                    {librarian.activeThisWeek ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {librarian.defaultLibrarian && (
                    <span className="default-badge">
                      <i className="fas fa-star"></i> Default
                    </span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className={`btn btn-sm ${librarian.activeThisWeek ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleToggleActive(librarian.id)}
                      title={librarian.activeThisWeek ? 'Deactivate' : 'Activate'}
                    >
                      <i className={`fas ${librarian.activeThisWeek ? 'fa-pause' : 'fa-play'}`}></i>
                    </button>
                    
                    <button 
                      className="btn btn-sm btn-info"
                      title="Edit Schedule"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    
                    <button 
                      className="btn btn-sm btn-danger"
                      title="Remove"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLibrarians.length === 0 && (
          <div className="no-data">
            <i className="fas fa-users"></i>
            <h3>No librarians found</h3>
            <p>Try adjusting your filters or add a new librarian</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <h4>Active This Week</h4>
          <span className="stat-number">
            {librarians.filter(lib => lib.activeThisWeek).length}
          </span>
        </div>
        
        <div className="stat-card">
          <h4>Default Librarians</h4>
          <span className="stat-number">
            {librarians.filter(lib => lib.defaultLibrarian).length}
          </span>
        </div>
        
        <div className="stat-card">
          <h4>Total Librarians</h4>
          <span className="stat-number">{librarians.length}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLibrarianManagement;
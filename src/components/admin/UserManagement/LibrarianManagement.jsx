import React, { useState, useEffect } from 'react';
import { useUserManagement } from '../../../hooks/useUserManagement';
import Alert from '../../common/Alert';
import LoadingSpinner from '../../common/LoadingSpinner';

const LibrarianManagement = ({ show, onClose }) => {
  const {
    gishushuLibrarians,
    masoroLibrarians,
    loading,
    error,
    success,
    fetchGishushuLibrarians,
    fetchMasoroLibrarians,
    handleUpdateStaff
  } = useUserManagement();

  const [activeTab, setActiveTab] = useState('gishushu');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (show) {
      fetchGishushuLibrarians();
      fetchMasoroLibrarians();
    }
  }, [show]);

  const handleToggleActive = async (librarian) => {
    try {
      await handleUpdateStaff(librarian.id, {
        ...librarian,
        activeToday: !librarian.activeToday,
        workingDay: selectedDate
      });
      
      // Refresh both lists
      fetchGishushuLibrarians();
      fetchMasoroLibrarians();
    } catch (error) {
      console.error('Error updating librarian status:', error);
    }
  };

  const handleSetDefault = async (librarian) => {
    try {
      // First, remove default status from other librarians in the same location
      const currentLibrarians = librarian.location === 'GISHUSHU' ? gishushuLibrarians : masoroLibrarians;
      
      for (const lib of currentLibrarians) {
        if (lib.isDefault && lib.id !== librarian.id) {
          await handleUpdateStaff(lib.id, {
            ...lib,
            isDefault: false
          });
        }
      }
      
      // Set new default
      await handleUpdateStaff(librarian.id, {
        ...librarian,
        isDefault: !librarian.isDefault
      });
      
      // Refresh both lists
      fetchGishushuLibrarians();
      fetchMasoroLibrarians();
    } catch (error) {
      console.error('Error setting default librarian:', error);
    }
  };

  const getActiveLibrarians = (librarians) => {
    return librarians.filter(lib => lib.activeToday);
  };

  const getDefaultLibrarian = (librarians) => {
    return librarians.find(lib => lib.isDefault);
  };

  const LibrarianCard = ({ librarian, location }) => {
    const isActive = librarian.activeToday;
    const isDefault = librarian.isDefault;
    
    return (
      <div className={`librarian-card ${isActive ? 'active' : ''} ${isDefault ? 'default' : ''}`}>
        <div className="librarian-header">
          <div className="librarian-info">
            <h4>{librarian.fullName}</h4>
            <div className="librarian-details">
              <span className="employee-id">{librarian.employeeId}</span>
              <span className="email">{librarian.email}</span>
              {librarian.phone && <span className="phone">{librarian.phone}</span>}
            </div>
          </div>
          
          <div className="librarian-status">
            {isDefault && (
              <span className="status-badge status-default">
                <i className="fas fa-star"></i>
                Default
              </span>
            )}
            {isActive && (
              <span className="status-badge status-active">
                <i className="fas fa-check-circle"></i>
                Active Today
              </span>
            )}
          </div>
        </div>

        <div className="librarian-schedule">
          <div className="schedule-info">
            <strong>Working Day:</strong> {new Date(librarian.workingDay).toLocaleDateString()}
          </div>
        </div>

        <div className="librarian-actions">
          <button
            className={`btn btn-sm ${isActive ? 'btn-warning' : 'btn-success'}`}
            onClick={() => handleToggleActive(librarian)}
            title={isActive ? 'Deactivate for today' : 'Activate for today'}
          >
            <i className={`fas ${isActive ? 'fa-pause' : 'fa-play'}`}></i>
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
          
          <button
            className={`btn btn-sm ${isDefault ? 'btn-secondary' : 'btn-info'}`}
            onClick={() => handleSetDefault(librarian)}
            title={isDefault ? 'Remove default status' : 'Set as default'}
          >
            <i className={`fas ${isDefault ? 'fa-star-half-alt' : 'fa-star'}`}></i>
            {isDefault ? 'Remove Default' : 'Set Default'}
          </button>
        </div>
      </div>
    );
  };

  const LocationTab = ({ librarians, location, locationName }) => {
    const activeLibrarians = getActiveLibrarians(librarians);
    const defaultLibrarian = getDefaultLibrarian(librarians);
    
    return (
      <div className="location-tab">
        <div className="location-stats">
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-value">{librarians.length}</div>
              <div className="stat-label">Total Librarians</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{activeLibrarians.length}</div>
              <div className="stat-label">Active Today</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{defaultLibrarian ? 1 : 0}</div>
              <div className="stat-label">Default Set</div>
            </div>
          </div>
        </div>

        {defaultLibrarian && (
          <div className="default-librarian-section">
            <h4>Default Librarian for {locationName}</h4>
            <LibrarianCard librarian={defaultLibrarian} location={location} />
          </div>
        )}

        <div className="active-librarians-section">
          <h4>Active Librarians ({activeLibrarians.length}/2 max)</h4>
          {activeLibrarians.length >= 2 && (
            <Alert 
              type="warning" 
              message="Maximum active librarians reached for this location (2/2)" 
            />
          )}
          
          <div className="librarians-grid">
            {activeLibrarians.map(librarian => (
              <LibrarianCard 
                key={librarian.id} 
                librarian={librarian} 
                location={location}
              />
            ))}
          </div>
        </div>

        <div className="all-librarians-section">
          <h4>All {locationName} Librarians</h4>
          <div className="librarians-grid">
            {librarians.map(librarian => (
              <LibrarianCard 
                key={librarian.id} 
                librarian={librarian} 
                location={location}
              />
            ))}
          </div>
        </div>

        {librarians.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-book-reader"></i>
            <h4>No Librarians</h4>
            <p>No librarians assigned to {locationName} campus yet.</p>
          </div>
        )}
      </div>
    );
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container extra-large">
        <div className="modal-header">
          <h3>Librarian Management</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Date Selector */}
          <div className="date-selector">
            <label>Managing for Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-control"
            />
          </div>

          {/* Alerts */}
          {error && (
            <Alert type="danger" message={error} />
          )}
          {success && (
            <Alert type="success" message={success} />
          )}

          {loading && <LoadingSpinner />}

          {/* Location Tabs */}
          <div className="location-tabs">
            <div className="tab-buttons">
              <button 
                className={`tab-button ${activeTab === 'gishushu' ? 'active' : ''}`}
                onClick={() => setActiveTab('gishushu')}
              >
                <i className="fas fa-building"></i>
                Gishushu Campus ({gishushuLibrarians.length})
              </button>
              <button 
                className={`tab-button ${activeTab === 'masoro' ? 'active' : ''}`}
                onClick={() => setActiveTab('masoro')}
              >
                <i className="fas fa-building"></i>
                Masoro Campus ({masoroLibrarians.length})
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'gishushu' && (
                <LocationTab 
                  librarians={gishushuLibrarians}
                  location="GISHUSHU"
                  locationName="Gishushu"
                />
              )}
              
              {activeTab === 'masoro' && (
                <LocationTab 
                  librarians={masoroLibrarians}
                  location="MASORO"
                  locationName="Masoro"
                />
              )}
            </div>
          </div>

          {/* Management Rules */}
          <div className="management-rules">
            <h4>Librarian Management Rules</h4>
            <div className="rules-grid">
              <div className="rule-item">
                <i className="fas fa-users"></i>
                <strong>Active Limit:</strong> Maximum 2 librarians can be active per campus per day
              </div>
              <div className="rule-item">
                <i className="fas fa-star"></i>
                <strong>Default Librarian:</strong> Only one default librarian per campus
              </div>
              <div className="rule-item">
                <i className="fas fa-calendar"></i>
                <strong>Working Days:</strong> Each librarian has assigned working days
              </div>
              <div className="rule-item">
                <i className="fas fa-map-marker-alt"></i>
                <strong>Location-Based:</strong> Librarians are assigned to specific campuses
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibrarianManagement;
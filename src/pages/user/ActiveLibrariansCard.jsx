import React, { useState, useEffect } from 'react';
import { librarianService } from '../../api/librarianService';
import { useAuth } from '../../hooks/useAuth';

const ActiveLibrariansCard = ({ location = 'KIGALI' }) => {
  const [librarians, setLibrarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchActiveLibrarians();
  }, [location]);

  const fetchActiveLibrarians = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use user's location if available, otherwise use provided location
      const userLocation = user?.location || location;
      const data = await librarianService.getActiveLibrariansToday(userLocation);
      setLibrarians(data);
    } catch (err) {
      console.error('Error fetching active librarians:', err);
      setError('Unable to load librarian information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="active-librarians-card">
        <div className="card-header">
          <h3><i className="fas fa-user-friends"></i> Today's Librarians</h3>
        </div>
        <div className="card-body text-center">
          <div className="spinner"></div>
          <p>Loading librarian information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="active-librarians-card">
        <div className="card-header">
          <h3><i className="fas fa-user-friends"></i> Today's Librarians</h3>
        </div>
        <div className="card-body text-center">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button className="btn btn-sm btn-outline" onClick={fetchActiveLibrarians}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (librarians.length === 0) {
    return (
      <div className="active-librarians-card">
        <div className="card-header">
          <h3><i className="fas fa-user-friends"></i> Today's Librarians</h3>
        </div>
        <div className="card-body text-center">
          <div className="no-librarians">
            <i className="fas fa-info-circle"></i>
            <p>No librarians are scheduled for today</p>
            <small>Please contact the main desk for assistance</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="active-librarians-card">
      <div className="card-header">
        <h3><i className="fas fa-user-friends"></i> Today's Librarians</h3>
        <span className="location-badge">{user?.location || location}</span>
      </div>
      <div className="card-body">
        {librarians.map((librarian, index) => (
          <div key={index} className="librarian-info">
            <div className="librarian-avatar">
              <i className="fas fa-user-circle"></i>
              {librarian.defaultLibrarian && (
                <span className="default-badge" title="Default Librarian">
                </span>
              )}
            </div>
            <div className="librarian-details">
              <h4 className="librarian-name">{librarian.fullName}</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <a href={`mailto:${librarian.email}`}>{librarian.email}</a>
                </div>
                {librarian.phone && (
                  <div className="contact-item">
                    <i className="fas fa-phone"></i>
                    <a href={`tel:${librarian.phone}`}>{librarian.phone}</a>
                  </div>
                )}
              </div>
              <div className="location-info">
                <i className="fas fa-map-marker-alt"></i>
                <span>{librarian.locationDisplayName}</span>
              </div>
            </div>
          </div>
        ))}
        
        <div className="card-footer">
          <small className="help-text">
            <i className="fas fa-info-circle"></i>
            Click contact information to reach out directly
          </small>
        </div>
      </div>
    </div>
  );
};

export default ActiveLibrariansCard;
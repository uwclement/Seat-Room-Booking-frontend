import React, { useState, useEffect } from 'react';
import { useSchedule } from '../../../hooks/useSchedule';
import { useAuth } from '../../../hooks/useAuth';
import { format } from 'date-fns';
import '../../../assets/css/statusBanner.css';

const ScheduleStatusBanner = ({ location }) => {
  const { 
    libraryStatus,
    fetchLibraryStatusByLocation,
    Activeannouncements 
  } = useSchedule();
  const { getUserLocation, isAdmin } = useAuth();
  
  const [isVisible, setIsVisible] = useState(true);
  const [locationStatus, setLocationStatus] = useState(null);

  // Determine which location to use
  const targetLocation = location || getUserLocation();

  // Fetch status for specific location
  useEffect(() => {
    const fetchLocationStatus = async () => {
      if (targetLocation && fetchLibraryStatusByLocation) {
        try {
          const status = await fetchLibraryStatusByLocation(targetLocation);
          setLocationStatus(status);
        } catch (error) {
          console.error('Failed to fetch location status:', error);
          // Fallback to general library status
          setLocationStatus(libraryStatus);
        }
      } else {
        // Use general library status as fallback
        setLocationStatus(libraryStatus);
      }
    };

    fetchLocationStatus();
  }, [targetLocation, libraryStatus, fetchLibraryStatusByLocation]);

  // Handle visibility timing
  useEffect(() => {
    if (!locationStatus || locationStatus.open || !locationStatus.open) {
      return;
    }
    
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [locationStatus]);

  if (!locationStatus || !isVisible) {
    return null;
  }

  const statusClass = locationStatus.open ? 'success' : 'danger';
  const statusText = locationStatus.open ? 'Open Now' : 'Closed Now';

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return format(date, 'h:mm a');
  };

  const getLocationDisplayName = () => {
    const names = {
      'GISHUSHU': 'Gishushu Library',
      'MASORO': 'Masoro Library'
    };
    return names[targetLocation] || targetLocation;
  };

  return (
    <div className={`library-status-banner status-${statusClass}`}>
      {/* Location header */}
      <div className="location-header">
        <span className="location-name">{getLocationDisplayName()}</span>
      </div>

      <div className="status-indicator">
        <span className={`status-dot ${statusClass}`}></span>
        <span className="status-text">{statusText}</span>
      </div>
      
      <div className="status-details">
        {locationStatus.currentHours && (
          <span className="hours">
            Hours: {locationStatus.currentHours}
          </span>
        )}
        
        {locationStatus.message && (
          <span className="message">
            {locationStatus.message}
          </span>
        )}
        
        {locationStatus.nextStatusChange && (
          <span className="next-change">
            {locationStatus.open 
              ? `Closes: ${formatTime(locationStatus.nextStatusChange)}` 
              : `Opens: ${formatTime(locationStatus.nextStatusChange)}`}
          </span>
        )}
      </div>

      <div> 
        <div className="card-body">
          {Activeannouncements.length > 0 && (
            <div className="announcements-list"> Announcement:
              {Activeannouncements.map(announcement => (
                <div key={announcement.id} className="announcement-item">
                  <h5>{announcement.title}</h5>
                  <p>{announcement.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .location-header {
          background: rgba(0, 0, 0, 0.1);
          padding: 0.5rem 1rem;
          margin: -0.5rem -1rem 1rem -1rem;
          border-radius: 8px 8px 0 0;
        }

        .location-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
};

// Component to show both locations for admins
const DualLocationBanner = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    return <ScheduleStatusBanner />;
  }

  return (
    <div className="dual-location-banner">
      <ScheduleStatusBanner location="GISHUSHU" />
      <ScheduleStatusBanner location="MASORO" />
      
      <style jsx>{`
        .dual-location-banner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 760px) {
          .dual-location-banner {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ScheduleStatusBanner;
export { DualLocationBanner };
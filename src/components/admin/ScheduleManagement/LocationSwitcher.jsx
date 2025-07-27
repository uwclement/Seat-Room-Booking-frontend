import React from 'react';
import { MapPin } from 'lucide-react';

const LocationSwitcher = ({ selectedLocation, setSelectedLocation, isAdmin, userLocation }) => {
  const locations = [
    { value: 'GISHUSHU', label: 'Gishushu Campus' },
    { value: 'MASORO', label: 'Masoro Campus' }
  ];

  // Show location switcher only for admins
  if (!isAdmin) {
    // Show current location for non-admins
    const currentLocationLabel = locations.find(loc => loc.value === userLocation)?.label || userLocation;
    return (
      <div className="location-indicator">
        <MapPin size={16} />
        <span>Managing: {currentLocationLabel}</span>
      </div>
    );
  }

  return (
    <div className="location-switcher">
      <div className="location-switcher-label">
        <MapPin size={16} />
        <span>Library Location:</span>
      </div>
      <div className="location-buttons">
        {locations.map(location => (
          <button
            key={location.value}
            type="button"
            className={`location-btn ${selectedLocation === location.value ? 'active' : ''}`}
            onClick={() => setSelectedLocation(location.value)}
          >
            {location.label}
          </button>
        ))}
      </div>
      
      <style jsx>{`
        .location-switcher {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          margin-bottom: 1.5rem;
        }

        .location-switcher-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          color: #495057;
        }

        .location-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .location-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          background: #fff;
          color: #495057;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .location-btn:hover {
          border-color: #0d6efd;
          color: #0d6efd;
        }

        .location-btn.active {
          background: #0d6efd;
          border-color: #0d6efd;
          color: white;
        }

        .location-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #e3f2fd;
          border: 1px solid #bbdefb;
          border-radius: 6px;
          color: #1565c0;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default LocationSwitcher;
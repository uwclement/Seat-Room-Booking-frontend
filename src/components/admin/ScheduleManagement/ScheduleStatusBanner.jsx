import React from 'react';
import { useSchedule } from '../../../hooks/useSchedule';

const ScheduleStatusBanner = () => {
  const { libraryStatus } = useSchedule();
  
  // Format the next change time if it exists
  const formatChangeTime = (timeString) => {
    if (!timeString) return '';
    
    const changeTime = new Date(timeString);
    return changeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Determine banner styling based on status
  const getBannerClass = () => {
    if (!libraryStatus.isOpen) {
      return 'status-banner closed';
    }
    
    // Check if closing soon (within 2 hours)
    if (libraryStatus.nextChangeTime) {
      const nextChange = new Date(libraryStatus.nextChangeTime);
      const now = new Date();
      const hoursUntilChange = (nextChange - now) / (1000 * 60 * 60);
      
      if (hoursUntilChange <= 2) {
        return 'status-banner closing-soon';
      }
    }
    
    return 'status-banner open';
  };
  
  // Get appropriate text for the current status
  const getStatusText = () => {
    if (!libraryStatus.isOpen) {
      return 'Library is currently CLOSED';
    }
    
    if (libraryStatus.nextChangeTime) {
      const nextChange = new Date(libraryStatus.nextChangeTime);
      const now = new Date();
      const hoursUntilChange = (nextChange - now) / (1000 * 60 * 60);
      
      if (hoursUntilChange <= 2) {
        return `Library is CLOSING SOON: at ${formatChangeTime(libraryStatus.nextChangeTime)}`;
      }
    }
    
    return 'Library is currently OPEN';
  };
  
  return (
    <div className={getBannerClass()}>
      <div className="status-icon">
        {libraryStatus.isOpen ? (
          <i className="fas fa-door-open"></i>
        ) : (
          <i className="fas fa-door-closed"></i>
        )}
      </div>
      
      <div className="status-info">
        <div className="status-text">
          {getStatusText()}
        </div>
        
        {libraryStatus.message && (
          <div className="status-message">
            {libraryStatus.message}
          </div>
        )}
        
        {!libraryStatus.isOpen && libraryStatus.nextChangeTime && (
          <div className="reopening-info">
            Reopening at {formatChangeTime(libraryStatus.nextChangeTime)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleStatusBanner;
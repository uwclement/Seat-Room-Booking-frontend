import React from 'react';
import { useSchedule } from '../../../hooks/useSchedule';

const AdminHeader = ({ title, subtitle }) => {
  const { libraryStatus } = useSchedule();

  // Format the next change time if it exists
  const formatChangeTime = (timeString) => {
    if (!timeString) return '';
    
    const changeTime = new Date(timeString);
    return changeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determine the status indicator
  const getStatusIndicator = () => {
    if (!libraryStatus.isOpen) {
      return {
        color: 'red',
        text: 'CLOSED',
        icon: 'fa-door-closed'
      };
    }
    
    // Check if closing soon (within 2 hours)
    if (libraryStatus.nextChangeTime) {
      const nextChange = new Date(libraryStatus.nextChangeTime);
      const now = new Date();
      const hoursUntilChange = (nextChange - now) / (1000 * 60 * 60);
      
      if (hoursUntilChange <= 2) {
        return {
          color: 'orange',
          text: `CLOSING AT ${formatChangeTime(libraryStatus.nextChangeTime)}`,
          icon: 'fa-clock'
        };
      }
    }
    
    return {
      color: 'green',
      text: 'OPEN',
      icon: 'fa-door-open'
    };
  };

  const statusInfo = getStatusIndicator();

  return (
    <div className="admin-header">
      <div className="header-content">
        <div className="title-area">
          <h1>{title}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
        
        <div className="status-indicator" style={{ color: statusInfo.color }}>
          <i className={`fas ${statusInfo.icon}`}></i>
          <span className="status-text">{statusInfo.text}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
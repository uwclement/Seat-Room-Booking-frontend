import React, { useState, useEffect } from 'react';
import { useSchedule } from '../../../hooks/useSchedule';
import { format } from 'date-fns';
import '../../../assets/css/statusBanner.css';

const ScheduleStatusBanner = () => {
  const { libraryStatus } = useSchedule();
  const [isVisible, setIsVisible] = useState(true);
  const { Activeannouncements } = useSchedule();

  // Handle visibility timing
  useEffect(() => {
    // If no status or the library is open/closed, keep banner visible
    if (!libraryStatus || libraryStatus.open || !libraryStatus.open) {
      return;
    }
    
    // Only hide banner after 10 seconds for non-status notifications
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [libraryStatus]);

  if (!libraryStatus || !isVisible) {
    return null;
  }

  const statusClass = libraryStatus.open ? 'success' : 'danger';
  const statusText = libraryStatus.open ? 'Open Now' : 'Closed Now';

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return format(date, 'h:mm a');
  };

  return (
    <div className={`library-status-banner status-${statusClass}`}>
      <div className="status-indicator">
        <span className={`status-dot ${statusClass}`}></span>
        <span className="status-text">{statusText}</span>
      </div>
      
      <div className="status-details">
        {libraryStatus.currentHours && (
          <span className="hours">
            Hours: {libraryStatus.currentHours}
          </span>
        )}
        
        {libraryStatus.message && (
          <span className="message">
            {libraryStatus.message}
          </span>
        )}
        
        {libraryStatus.nextStatusChange && (
          <span className="next-change">
            {libraryStatus.open 
              ? `Closes: ${formatTime(libraryStatus.nextStatusChange)}` 
              : `Opens: ${formatTime(libraryStatus.nextStatusChange)}`}
          </span>
        )}
      </div>

      <div> 
       
                   <div className="card-body">
                     {Activeannouncements.length === 0 ? (
                       <p className="text-muted">No active announcements</p>
                     ) : (
                       <div className="announcements-list"> Announcement:
                         {Activeannouncements.map(announcement => (
                           <div key={announcement.id} className="announcement-item">
                             <h5>{announcement.title}</h5>
                             <p>{announcement.message}</p>
                             {/* <div className="announcement-meta">
                               <span className="badge badge-info mr-2">
                                 {announcement.isUIVisible ? 'UI Visible' : 'UI Hidden'}
                               </span>
                              
                             </div> */}
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 </div>
      
      

    </div>
  );
};

export default ScheduleStatusBanner;
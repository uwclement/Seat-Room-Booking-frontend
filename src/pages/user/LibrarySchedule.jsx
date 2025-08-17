import React, { useState } from 'react';
import { usePublicSchedule } from '../../hooks/usePublicSchedule';
import { DualLocationBanner } from '../../components/admin/ScheduleManagement/ScheduleStatusBanner';
import PublicScheduleCalendar from '../../components/admin/ScheduleManagement/PublicScheduleCalender';
import Alert from '../../components/common/Alert';
import '../../assets/css/admin.css';
import '../user/LibrarySchedule.css';  
import ActiveLibrariansCard from './ActiveLibrariansCard';

const LibrarySchedule = () => {
  const { error, success, setError, scheduleMessage } = usePublicSchedule();
  const [currentMessage, setCurrentMessage] = useState(scheduleMessage);
  const [previewData, setPreviewData] = useState(null);
  const [activeTab, setActiveTab] = useState('form'); // 
  const [activeSection, setActiveSection] = useState('schedule'); // 'schedule', 'closures', or 'announcements'



  return (
    <div className="card">
       <div className="card-header">
       </div>
         <div className="card-body">
           <PublicScheduleCalendar />
          </div>

          <div className="card-body">
           <ActiveLibrariansCard />
          </div>
      </div>
  );
};

export default LibrarySchedule;
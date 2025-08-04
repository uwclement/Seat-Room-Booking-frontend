import React, { useState } from 'react';
import { usePublicSchedule } from '../../hooks/usePublicSchedule';
import { DualLocationBanner } from '../../components/admin/ScheduleManagement/ScheduleStatusBanner';
import PublicScheduleCalendar from '../../components/admin/ScheduleManagement/PublicScheduleCalender';
import Alert from '../../components/common/Alert';
import '../../assets/css/admin.css';
import '../user/LibrarySchedule.css';  

const LibrarySchedule = () => {
  const { error, success, setError, scheduleMessage } = usePublicSchedule();
  const [currentMessage, setCurrentMessage] = useState(scheduleMessage);
  const [previewData, setPreviewData] = useState(null);
  const [activeTab, setActiveTab] = useState('form'); // 
  const [activeSection, setActiveSection] = useState('schedule'); // 'schedule', 'closures', or 'announcements'



  return (
    <div className="admin-page-container">
      <div className="admin-content">
        <div className="admin-header">
          <h1>Library Schedules</h1>
          <p className="admin-subtitle">
             Masoro and GIshushu Schedules
          </p>
        </div>

        {/* <DualLocationBanner /> */}

        {error && (
          <Alert
            type="danger"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => {}}
            autoClose={true}
          />
        )}
        

      <div className="card">
       <div className="card-header">
       </div>
         <div className="card-body">
          <PublicScheduleCalendar />
           </div>
      </div>

      </div>
    </div>
  );
};

export default LibrarySchedule;
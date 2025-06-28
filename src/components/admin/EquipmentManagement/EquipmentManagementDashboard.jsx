import React, { useState } from 'react';
import { useEquipmentAdmin } from '../../../context/EquipmentAdminContext';
import EnhancedEquipmentDashboard from './EnhancedEquipmentDashboard';
import CourseManagement from './CourseManagement';
import LabClassManagement from './LabClassManagement';
import EquipmentRequestManagement from './EquipmentRequestManagement';
import AdminSidebar from '../../common/AdminSidebar';

const EquipmentManagementDashboard = () => {
  const { viewMode, setViewMode, refreshAll } = useEquipmentAdmin();
  const [refreshing, setRefreshing] = useState(false);

  const handleTabChange = (newViewMode) => {
    setViewMode(newViewMode);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'courses':
        return <CourseManagement />;
      case 'labs':
        return <LabClassManagement />;
      case 'requests':
        return <EquipmentRequestManagement />;
      default:
        return <EnhancedEquipmentDashboard />;
    }
  };

  return (
    <div className="admin-page-container">
      <AdminSidebar activePage="equipment-management" />
      
      <div className="admin-main-content">

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default EquipmentManagementDashboard;
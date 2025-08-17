import React from 'react';
import { useAnalytics } from '../../../context/AnalyticsContext';

const AnalyticsTabNavigation = () => {
  const { activeTab, setActiveTab, permissions } = useAnalytics();

  const tabs = [
    {
      id: 'seats',
      label: 'Seats',
      icon: 'fa-chair',
      visible: permissions.canAccessSeats
    },
    {
      id: 'rooms',
      label: 'Rooms',
      icon: 'fa-door-open',
      visible: permissions.canAccessRooms
    },
    {
      id: 'equipment',
      label: 'Equipment',
      icon: 'fa-tools',
      visible: permissions.canAccessEquipment
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'fa-users',
      visible: permissions.canAccessUsers
    }
  ];

  const visibleTabs = tabs.filter(tab => tab.visible);

  return (
    <div className="analytics-tabs">
      <div className="tab-list">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`fas ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsTabNavigation;
import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useAnalytics } from '../../../context/AnalyticsContext';
import AnalyticsHeader from './AnalyticsHeader';
import AnalyticsTabNavigation from './AnalyticsTabNavigation';
import SummaryCards from './shared/SummaryCards';
import ChartsContainer from './shared/ChartsContainer';
import ReportDownload from './shared/ReportDownload';
import './analytics.css';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { activeTab, permissions } = useAnalytics();

  const getModuleData = () => {
    return activeTab; // activeTab is already 'seats', 'rooms', 'equipment', 'users'
  };

  const moduleKey = getModuleData();

  return (
    <div className="admin-content">
      <AnalyticsHeader />
      <AnalyticsTabNavigation />
      
      <SummaryCards module={moduleKey} />
      <ChartsContainer module={moduleKey} />
      <ReportDownload module={activeTab} />
    </div>
  );
};

export default AnalyticsDashboard;
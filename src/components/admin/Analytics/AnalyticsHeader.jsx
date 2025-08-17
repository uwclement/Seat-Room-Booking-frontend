import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useAnalytics } from '../../../context/AnalyticsContext';

const AnalyticsHeader = () => {
  const { user } = useAuth();
  const { filters, setFilters, permissions, refreshData } = useAnalytics();

  const handleFilterChange = (field, value) => {
    setFilters({ [field]: value });
  };

  const handleRefresh = () => {
    refreshData();
  };

  return (
    <div className="analytics-header">
      <div className="header-top">
        <div className="header-title">
          <h1>
            <i className="fas fa-chart-line"></i> Library Analytics Dashboard
          </h1>
          <p className="header-subtitle">
            Comprehensive insights and reporting for AUCA Library
          </p>
        </div>
      </div>

      <div className="filter-controls">
        <div className="filter-group">
          <label>
            <i className="fas fa-map-marker-alt"></i> Location:
          </label>
          <select
            className="filter-select"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          >
            {permissions.canViewAllLocations && (
              <option value="GISHUSHU">Gishushu</option>
            )}
            <option value="MASORO">Masoro</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <i className="fas fa-calendar"></i> Period:
          </label>
          <select
            className="filter-select"
            value={filters.period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
          >
            <option value="TODAY">Today</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">Last Month</option>
            <option value="QUARTER">Last Quarter</option>
            <option value="YEAR">Last Year</option>
          </select>
        </div>

        <button className="refresh-btn" onClick={handleRefresh}>
          <i className="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
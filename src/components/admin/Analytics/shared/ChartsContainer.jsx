import React from 'react';
import { useAnalytics } from '../../../../context/AnalyticsContext';
import ChartWrapper from './ChartWrapper';

const ChartsContainer = ({ module }) => {
  const { [module]: moduleData } = useAnalytics();

  if (moduleData.loading) {
    return (
      <div className="charts-container">
        {[1, 2, 3].map(i => (
          <div key={i} className="chart-card loading">
            <div className="chart-header">
              <div className="chart-title">Loading Chart {i}...</div>
            </div>
            <div className="chart-placeholder">
              <i className="fas fa-spinner fa-spin" style={{fontSize: '24px'}}></i>
              Loading...
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (moduleData.error) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-triangle"></i>
        Error loading charts: {moduleData.error}
      </div>
    );
  }

  if (!moduleData.charts) {
    return null;
  }

  const renderCharts = () => {
    const charts = moduleData.charts;
    const chartEntries = Object.entries(charts);

    return chartEntries.map(([chartKey, chartData], index) => (
      <ChartWrapper
        key={chartKey}
        chartData={chartData}
        title={chartData.title}
        subtitle={chartData.subtitle}
      />
    ));
  };

  return (
    <div className="charts-container">
      {renderCharts()}
    </div>
  );
};

export default ChartsContainer;
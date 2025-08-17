import React from 'react';
import { useAnalytics } from '../../../../context/AnalyticsContext';

const SummaryCards = ({ module }) => {
  const { [module]: moduleData } = useAnalytics();

  if (moduleData.loading) {
    return (
      <div className="summary-cards">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="summary-card loading">
            <div className="card-header">
              <div className="card-icon blue">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
            </div>
            <div className="card-value">-</div>
            <div className="card-label">Loading...</div>
          </div>
        ))}
      </div>
    );
  }

  if (moduleData.error) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-triangle"></i>
        Error loading summary data: {moduleData.error}
      </div>
    );
  }

  if (!moduleData.summary?.summaryCards) {
    return null;
  }

  const getCardIconClass = (index) => {
    const classes = ['blue', 'green', 'orange', 'red'];
    return classes[index % classes.length];
  };

  return (
    <div className="summary-cards">
      {moduleData.summary.summaryCards.map((card, index) => (
        <div key={index} className="summary-card">
          <div className="card-header">
            <div className={`card-icon ${getCardIconClass(index)}`}>
              <i className={card.icon || 'fas fa-chart-bar'}></i>
            </div>
          </div>
          <div className="card-value">{card.value}</div>
          <div className="card-label">{card.title}</div>
          {card.trend && (
            <div className={`card-trend ${card.trend === 'up' ? 'trend-up' : 'trend-down'}`}>
              <i className={`fas fa-arrow-${card.trend}`}></i>
              <span>{card.trendValue}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
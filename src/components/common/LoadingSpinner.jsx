import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner">
        <i className="fas fa-spinner fa-spin"></i>
      </div>
      <div className="loading-text">{text}</div>
    </div>
  );
};

export default LoadingSpinner;
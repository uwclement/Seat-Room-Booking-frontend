import React from 'react';

const Alert = ({ type = 'info', message, onClose }) => {
  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-content">
        <div className="alert-message">{message}</div>
        {onClose && (
          <button 
            type="button" 
            className="alert-close" 
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
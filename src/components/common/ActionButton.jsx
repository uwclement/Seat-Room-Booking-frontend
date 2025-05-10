import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`floating-action-button ${isOpen ? 'open' : ''}`}>
      <button className="fab-main" onClick={toggleOpen}>
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-plus'}`}></i>
      </button>
      
      {isOpen && (
        <div className="fab-menu">
          <Link to="/admin/seats" className="fab-item" title="Manage Seats">
            <i className="fas fa-chair"></i>
          </Link>
          <Link to="/admin/schedule" className="fab-item" title="Manage Schedule">
            <i className="fas fa-calendar-alt"></i>
          </Link>
          <Link to="/admin/bookings" className="fab-item" title="Manage Bookings">
            <i className="fas fa-bookmark"></i>
          </Link>
          <button className="fab-item export-button" title="Export Data">
            <i className="fas fa-file-export"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionButton;
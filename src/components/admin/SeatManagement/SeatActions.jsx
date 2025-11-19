// components/admin/SeatManagement/SeatActions.js
import React, { useState } from 'react';
import { useAdmin } from '../../../hooks/useAdmin';
import SeatModal from './SeatModal';
import BulkSeatModal from './BulkSeatModal';
import DisableSeatModal from './DisableSeatModal';
import BulkQRModal from '../qr/BulkQRModal';
import { useAuth } from '../../../hooks/useAuth';

const SeatActions = () => {
  const { 
    selectedSeats, 
    selectAllSeats, 
    clearSelection, 
    handleBulkToggleDesktop,
    handleEnableSeats,
    seats
  } = useAdmin();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const { user, isAdmin } = useAuth();

  const handleToggleDesktopBulk = () => {
    handleBulkToggleDesktop(); 
  };

  const handleBulkQRGeneration = () => {
    setShowQRModal(true);
  };

  return (
    <div className="seat-actions">
      {/* Primary Actions */}
      {/* Seat are onlu created by Librarians only  */}
       {!isAdmin() && (
      <div className="primary-actions">
        
        <button 
          className="btn btn-primary create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus"></i>
          Create Single Seat
        </button>
        
        <button 
          className="btn btn-success create-btn"
          onClick={() => setShowBulkCreateModal(true)}
        >
          <i className="fas fa-layer-group"></i>
          Bulk Create Seats
        </button>
      
      </div>
       )}

      {/* Selection Tools */}
      <div className="selection-tools">
        <button 
          className="btn btn-outline-primary" 
          onClick={selectAllSeats}
        >
          <i className="fas fa-check-square"></i>
          Select All
        </button>
        {selectedSeats.length > 0 && (
          <button 
            className="btn btn-outline-secondary" 
            onClick={clearSelection}
          >
            <i className="fas fa-times"></i>
            Clear Selection
          </button>
        )}
        <div className="selection-count">
          <i className="fas fa-info-circle"></i>
          {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSeats.length > 0 && (
        <div className="bulk-actions">
          <div className="action-group">
            <h4 className="action-group-title">
              <i className="fas fa-tools"></i>
              Bulk Operations
            </h4>
            <div className="action-buttons">
              <button 
                className="btn btn-info"
                onClick={() => setShowBulkUpdateModal(true)}
                title="Bulk update properties for selected seats"
              >
                <i className="fas fa-edit"></i>
                Bulk Update
              </button>

              <button 
                className="btn btn-primary"
                onClick={handleToggleDesktopBulk}
                title="Toggle desktop property for selected seats"
              >
                <i className="fas fa-desktop"></i>
                Toggle Desktop
              </button>
              
              <button 
                className="btn btn-primary"
                onClick={handleBulkQRGeneration}
                title="Generate QR codes for selected seats"
              >
                <i className="fas fa-qrcode"></i>
                Generate QR Codes
              </button>
              
              <button 
                className="btn btn-warning"
                onClick={() => setShowDisableModal(true)}
                title="Disable selected seats for maintenance"
              >
                <i className="fas fa-exclamation-triangle"></i>
                Disable for Maintenance
              </button>
              
              <button 
                className="btn btn-success"
                onClick={handleEnableSeats}
                title="Enable selected seats"
              >
                <i className="fas fa-check-circle"></i>
                Enable Seats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <SeatModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        seatToEdit={null}
      />

      <BulkSeatModal
        isOpen={showBulkCreateModal}
        onClose={() => setShowBulkCreateModal(false)}
        mode="create"
      />

      <BulkSeatModal
        isOpen={showBulkUpdateModal}
        onClose={() => setShowBulkUpdateModal(false)}
        mode="update"
      />

      <DisableSeatModal 
        isOpen={showDisableModal} 
        onClose={() => setShowDisableModal(false)} 
      />

      <BulkQRModal
        show={showQRModal}
        onClose={() => setShowQRModal(false)}
        type="seats"
        selectedIds={selectedSeats}
      />
    </div>
  );
};

export default SeatActions;
import React from 'react';
import QRScanner from './QRScanner';

const QRScannerModal = ({ show, onClose, expectedBookingId, onScanSuccess }) => {
  if (!show) return null;

  const handleSuccess = (result) => {
    if (onScanSuccess) {
      onScanSuccess(result);
    }
    // Auto-close modal on successful check-in
    if (result.action === 'CHECKED_IN') {
      setTimeout(() => onClose(), 2000);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container large-modal qr-scanner-modal">
        <div className="modal-header">
          <h3>
            <i className="fas fa-qrcode"></i>
            {expectedBookingId ? 'Scan QR Code to Check In' : 'Scan QR Code'}
          </h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body no-padding">
          <QRScanner 
            expectedBookingId={expectedBookingId}
            onSuccess={handleSuccess}
            isModal={true}
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
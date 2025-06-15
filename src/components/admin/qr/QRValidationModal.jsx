import React, { useState } from 'react';
import { useQRCode } from '../../../context/QRCodeContext';
import QRScanner from './QRScanner';

const QRValidationModal = ({ 
  show, 
  onClose, 
  expectedBookingId, 
  onValidationSuccess,
  onValidationError,
  title = "Validate QR Code" 
}) => {
  const { validateQR, loading } = useQRCode();
  const [validationResult, setValidationResult] = useState(null);
  const [showScanner, setShowScanner] = useState(true);

  if (!show) return null;

  const handleScanSuccess = async (scanResult) => {
    try {
      const validation = await validateQR(scanResult.qrContent, expectedBookingId);
      setValidationResult(validation);
      setShowScanner(false);
      
      if (validation.valid && onValidationSuccess) {
        onValidationSuccess(validation);
      } else if (!validation.valid && onValidationError) {
        onValidationError(validation);
      }
    } catch (error) {
      const errorResult = {
        valid: false,
        message: 'Failed to validate QR code',
        canCheckIn: false
      };
      setValidationResult(errorResult);
      setShowScanner(false);
      
      if (onValidationError) {
        onValidationError(errorResult);
      }
    }
  };

  const handleRetry = () => {
    setValidationResult(null);
    setShowScanner(true);
  };

  const handleClose = () => {
    setValidationResult(null);
    setShowScanner(true);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container large-modal qr-validation-modal">
        <div className="modal-header">
          <h3>
            <i className="fas fa-shield-alt"></i>
            {title}
          </h3>
          <button className="close-button" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {showScanner && !validationResult && (
            <div className="validation-scanner">
              <div className="validation-instructions">
                <p>
                  <i className="fas fa-info-circle"></i>
                  Scan the QR code to validate it matches your current booking
                </p>
                {expectedBookingId && (
                  <div className="booking-context">
                    <span className="booking-badge">
                      Booking ID: #{expectedBookingId}
                    </span>
                  </div>
                )}
              </div>
              
              <QRScanner 
                expectedBookingId={expectedBookingId}
                onSuccess={handleScanSuccess}
                isModal={true}
              />
            </div>
          )}

          {loading && (
            <div className="validation-loading">
              <div className="spinner"></div>
              <p>Validating QR code...</p>
            </div>
          )}

          {validationResult && !loading && (
            <div className="validation-result">
              <div className={`result-card ${validationResult.valid ? 'valid' : 'invalid'}`}>
                <div className="result-icon">
                  <i className={`fas ${validationResult.valid ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                </div>
                
                <h3>
                  {validationResult.valid ? 'QR Code Valid' : 'Validation Failed'}
                </h3>
                
                <p className="result-message">
                  {validationResult.message}
                </p>

                {validationResult.valid && validationResult.bookingId && (
                  <div className="validation-details">
                    <div className="detail-item">
                      <span className="label">Booking ID:</span>
                      <span className="value">#{validationResult.bookingId}</span>
                    </div>
                    {validationResult.canCheckIn && (
                      <div className="detail-item">
                        <span className="check-in-badge">
                          <i className="fas fa-check"></i>
                          Ready for Check-in
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="result-actions">
                  {!validationResult.valid && (
                    <button 
                      className="btn btn-outline"
                      onClick={handleRetry}
                    >
                      <i className="fas fa-redo"></i>
                      Try Again
                    </button>
                  )}
                  
                  <button 
                    className={`btn ${validationResult.valid ? 'btn-success' : 'btn-secondary'}`}
                    onClick={handleClose}
                  >
                    {validationResult.valid ? 'Continue' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRValidationModal;
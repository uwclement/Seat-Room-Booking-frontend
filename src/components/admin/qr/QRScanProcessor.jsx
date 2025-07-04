import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQRCode } from '../../../context/QRCodeContext';
import { useAuth } from '../../../hooks/useAuth';

const QRScanProcessor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    handleScan, 
    handleCheckIn: contextHandleCheckIn, // Rename to avoid conflict
    loading, 
    error 
  } = useQRCode();
  const { isAuthenticated } = useAuth();
  const [scanResult, setScanResult] = useState(null);
  const [processing, setProcessing] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false); // Local loading state for check-in

  useEffect(() => {
    const processQRScan = async () => {
      // Extract QR parameters from URL
      const params = new URLSearchParams(location.search);
      const type = params.get('type');
      const token = params.get('token');
      
      if (!type || !token) {
        setScanResult({
          success: false,
          message: 'Invalid QR code parameters',
          action: 'ERROR'
        });
        setProcessing(false);
        return;
      }

      try {
        // Call backend API to process scan
        const response = await handleScan(type, token);
        setScanResult(response);
        
        // Handle the response
        handleScanResponse(response, type, token);
        
      } catch (err) {
        setScanResult({
          success: false,
          message: 'Failed to process QR code',
          action: 'ERROR'
        });
      } finally {
        setProcessing(false);
      }
    };

    processQRScan();
  }, [location]);

  const handleScanResponse = (response, type, token) => {
    if (response.requiresAuthentication) {
      // Store QR context and redirect to login
      localStorage.setItem('pendingQRScan', JSON.stringify(response.qrScanContext));
      const returnUrl = `/scan?type=${type}&token=${token}`;
      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
    } else if (response.success && response.canCheckIn) {
      // Show check-in interface
      // This will be handled by the UI below
    } else if (response.alternativeAction === 'GO_TO_BOOKED_SEAT') {
      // Show navigation to correct seat
      // This will be handled by the UI below
    }
  };

  // ✅ FIXED: Use the context method instead of manual fetch
  const handleCheckInClick = async () => {
    if (scanResult && scanResult.bookingDetails) {
      setCheckingIn(true);
      try {
        // Use the context method which properly calls the API
        await contextHandleCheckIn(
          scanResult.resourceType.toLowerCase(),
          scanResult.bookingDetails.bookingId,
          scanResult.bookingDetails.participantId || null
        );
        
        // Update local state for immediate UI feedback
        setScanResult({
          ...scanResult,
          action: 'CHECKED_IN',
          message: 'Successfully checked in!',
          canCheckIn: false
        });
      } catch (error) {
        console.error('Check-in failed:', error);
        // Show error in UI
        setScanResult({
          ...scanResult,
          action: 'CHECK_IN_FAILED',
          message: error.response?.data?.message || 'Check-in failed. Please try again.'
        });
      } finally {
        setCheckingIn(false);
      }
    }
  };

  if (processing || loading) {
    return (
      <div className="qr-processing">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Processing QR code...</p>
        </div>
      </div>
    );
  }

  if (error || !scanResult) {
    return (
      <div className="qr-error">
        <div className="error-container">
          <h2>QR Code Error</h2>
          <p>{error || 'Failed to process QR code'}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-result-page">
      <div className="container">
        <div className="qr-result-card">
          {scanResult.success ? (
            <div className="success-result">
              <div className="resource-info">
                <h2>
                  <i className={`fas fa-${scanResult.resourceType === 'SEAT' ? 'chair' : 'door-open'}`}></i>
                  {scanResult.resourceIdentifier}
                </h2>
                
                {scanResult.resourceDetails && (
                  <div className="resource-details">
                    {scanResult.resourceType === 'SEAT' ? (
                      <>
                        <p><i className="fas fa-map-marker-alt"></i> {scanResult.resourceDetails.zoneType} Zone</p>
                        <p><i className="fas fa-desktop"></i> Desktop: {scanResult.resourceDetails.hasDesktop ? 'Yes' : 'No'}</p>
                      </>
                    ) : (
                      <>
                        <p><i className="fas fa-building"></i> {scanResult.resourceDetails.building}</p>
                        <p><i className="fas fa-users"></i> Capacity: {scanResult.resourceDetails.capacity}</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Handle different actions */}
              {scanResult.action === 'CHECK_IN' && scanResult.canCheckIn && (
                <div className="check-in-section">
                  <div className="booking-info">
                    <h3>Ready to Check In</h3>
                    <p>
                      <i className="fas fa-calendar"></i>
                      {new Date(scanResult.bookingStartTime).toLocaleTimeString()} - 
                      {new Date(scanResult.bookingEndTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <button 
                    onClick={handleCheckInClick}
                    className="btn btn-primary btn-lg check-in-btn"
                    disabled={checkingIn || loading}
                  >
                    <i className="fas fa-check-circle"></i>
                    {checkingIn ? 'Checking In...' : 'Check In Now'}
                  </button>
                </div>
              )}

              {/* No booking case - show book button */}
              {scanResult.action === 'NO_BOOKING' && scanResult.canBook && (
                <div className="no-booking-section">
                  <div className="info-message">
                    <i className="fas fa-info-circle"></i>
                    <h3>No Active Booking</h3>
                    <p>{scanResult.message}</p>
                  </div>
                  <button 
                    onClick={() => {
                      const bookingUrl = scanResult.resourceType === 'SEAT' 
                        ? `/seats?seat=${scanResult.resourceId}`
                        : `/book-room/${scanResult.resourceId}`;
                      navigate(bookingUrl);
                    }}
                    className="btn btn-primary btn-lg"
                  >
                    <i className="fas fa-calendar-plus"></i>
                    {scanResult.actionButtonText || 'Book This Seat'}
                  </button>
                </div>
              )}

              {scanResult.action === 'TOO_EARLY' && (
                <div className="timing-message warning">
                  <i className="fas fa-clock"></i>
                  <h3>Too Early</h3>
                  <p>{scanResult.message}</p>
                  {scanResult.checkInAvailableAt && (
                    <p>Check-in opens at {new Date(scanResult.checkInAvailableAt).toLocaleTimeString()}</p>
                  )}
                </div>
              )}

              {scanResult.action === 'TOO_LATE' && (
                <div className="timing-message error">
                  <i className="fas fa-exclamation-triangle"></i>
                  <h3>Too Late</h3>
                  <p>{scanResult.message}</p>
                  {scanResult.warning && <p className="warning">{scanResult.warning}</p>}
                </div>
              )}

              {scanResult.action === 'ALREADY_CHECKED_IN' && (
                <div className="status-message success">
                  <i className="fas fa-check-circle"></i>
                  <h3>Already Checked In</h3>
                  <p>You're already checked in to this {scanResult.resourceType.toLowerCase()}</p>
                </div>
              )}

              {scanResult.action === 'CHECKED_IN' && (
                <div className="status-message success">
                  <i className="fas fa-check-circle"></i>
                  <h3>Check-in Successful!</h3>
                  <p>You're now checked in</p>
                </div>
              )}

              {scanResult.action === 'CHECK_IN_FAILED' && (
                <div className="status-message error">
                  <i className="fas fa-exclamation-triangle"></i>
                  <h3>Check-in Failed</h3>
                  <p>{scanResult.message}</p>
                  <button 
                    onClick={handleCheckInClick}
                    className="btn btn-secondary"
                    disabled={checkingIn}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Show availability info */}
              {scanResult.availabilityInfo && (
                <div className="availability-info">
                  <p><i className="fas fa-info-circle"></i> {scanResult.availabilityInfo}</p>
                </div>
              )}

              {/* Show warnings */}
              {scanResult.warning && (
                <div className="warning-message">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>{scanResult.warning}</p>
                </div>
              )}

              {/* Alternative actions */}
              {scanResult.alternativeAction === 'GO_TO_BOOKED_SEAT' && (
                <div className="alternative-action">
                  <button 
                    onClick={() => navigate('/my-bookings')}
                    className="btn btn-secondary"
                  >
                    <i className="fas fa-arrow-right"></i>
                    Go to My Booking
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="error-result">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Scan Failed</h3>
              <p>{scanResult.message}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="action-buttons">
            <button 
              onClick={() => navigate('/qr-scanner')}
              className="btn btn-outline"
            >
              <i className="fas fa-qrcode"></i>
              Scan Another
            </button>
            
            <button 
              onClick={() => navigate('/my-bookings')}
              className="btn btn-secondary"
            >
              <i className="fas fa-calendar"></i>
              My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanProcessor;
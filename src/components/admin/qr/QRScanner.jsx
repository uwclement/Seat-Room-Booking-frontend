import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { useQRCode } from '../../../context/QRCodeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const QRScanner = ({ expectedBookingId = null, onSuccess = null, isModal = false }) => {
  const { handleScan, extractQRData, validateQR, handleCheckIn, loading, error } = useQRCode();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [manualType, setManualType] = useState('seat');
  const [cameraError, setCameraError] = useState('');
  const [cameraPermission, setCameraPermission] = useState('unknown');
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  
  const scannerRef = useRef(null);
  const html5QrCodeScannerRef = useRef(null);

  // Check camera permissions on component mount
  useEffect(() => {
    checkCameraPermissions();
    return () => {
      cleanupScanner();
    };
  }, []);

  // Initialize scanner when camera permission is granted
  useEffect(() => {
    if (isScanning && !manualEntry && cameraPermission === 'granted') {
      initializeScanner();
    }
  }, [isScanning, manualEntry, cameraPermission]);

  const checkCameraPermissions = async () => {
    try {
      // First, check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera not supported on this device/browser');
        setManualEntry(true);
        return;
      }

      // Check existing permissions
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'camera' });
        setCameraPermission(permission.state);
        
        if (permission.state === 'denied') {
          setCameraError('Camera permission denied. Please enable camera access in browser settings.');
          setManualEntry(true);
          return;
        }
      }

      // Get available cameras
      await getCameraDevices();
      
      // Auto-start scanning if permission is granted
      if (cameraPermission !== 'denied') {
        setIsScanning(true);
      }
      
    } catch (error) {
      console.error('Permission check failed:', error);
      setCameraError('Unable to access camera. Please try manual entry.');
      setManualEntry(true);
    }
  };

  const getCameraDevices = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      setAvailableCameras(devices);
      
      if (devices.length > 0) {
        // Prefer back camera for QR scanning
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
      }
    } catch (error) {
      console.error('Failed to get camera devices:', error);
      setCameraError('No cameras found on this device');
      setManualEntry(true);
    }
  };

  const requestCameraPermission = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Prefer back camera
        } 
      });
      
      // Permission granted, stop the test stream
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      setIsScanning(true);
      setManualEntry(false);
      
    } catch (error) {
      console.error('Camera permission denied:', error);
      setCameraPermission('denied');
      setCameraError('Camera permission denied. Using manual entry mode.');
      setManualEntry(true);
    }
  };

  const initializeScanner = () => {
    try {
      // Clear any existing scanner
      cleanupScanner();

      const config = {
        fps: 10,
        qrbox: isModal ? 250 : 300,
        aspectRatio: 1.0,
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanner.SCAN_TYPE_CAMERA],
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
        // Camera selection
        videoConstraints: selectedCamera ? {
          deviceId: { exact: selectedCamera }
        } : {
          facingMode: "environment" // Use back camera
        }
      };

      html5QrCodeScannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        config,
        false // verbose
      );

      html5QrCodeScannerRef.current.render(onScanSuccess, onScanError);
      
    } catch (err) {
      console.error('Failed to initialize scanner:', err);
      setCameraError('Failed to start camera. Please try manual entry.');
      setManualEntry(true);
    }
  };

  const cleanupScanner = () => {
    if (html5QrCodeScannerRef.current) {
      try {
        html5QrCodeScannerRef.current.clear();
        html5QrCodeScannerRef.current = null;
      } catch (err) {
        console.error('Error cleaning up scanner:', err);
      }
    }
  };

  const onScanSuccess = async (decodedText) => {
    setIsScanning(false);
    cleanupScanner();
    await processScan(decodedText);
  };

  const onScanError = (error) => {
    // Only handle specific errors that require user action
    if (error.includes('Permission') || error.includes('NotAllowed')) {
      setCameraError('Camera permission denied. Please enable camera access.');
      setManualEntry(true);
      setIsScanning(false);
      cleanupScanner();
    } else if (error.includes('NotFound') || error.includes('DevicesNotFound')) {
      setCameraError('No camera found on this device.');
      setManualEntry(true);
      setIsScanning(false);
      cleanupScanner();
    }
    // Ignore continuous scan errors (QR not found, etc.)
  };

  const processScan = async (qrContent) => {
    try {
      // If we have an expected booking ID, validate the QR against it
      if (expectedBookingId) {
        const validationResult = await validateQR(qrContent, expectedBookingId);
        
        if (validationResult.valid && validationResult.canCheckIn) {
          // Attempt check-in
          const checkInResult = await handleCheckIn(
            validationResult.bookingId === expectedBookingId ? 'seat' : 'room',
            expectedBookingId
          );
          
          setScanResult({
            success: true,
            action: 'CHECKED_IN',
            message: checkInResult.message,
            bookingId: expectedBookingId
          });
          
          if (onSuccess) {
            onSuccess(validationResult);
          }
        } else {
          setScanResult({
            success: false,
            message: validationResult.message || 'QR code does not match your booking',
            action: 'VALIDATION_FAILED'
          });
        }
        return;
      }

      // Regular QR scan (not booking-specific)
      const qrData = extractQRData(qrContent);
      
      if (!qrData) {
        setScanResult({
          success: false,
          message: 'Invalid QR code format',
          action: 'INVALID_FORMAT'
        });
        return;
      }

      const response = await handleScan(qrData.type, qrData.token);
      setScanResult(response);
      
      // Handle different scan results
      handleScanResult(response, qrData);
      
    } catch (err) {
      setScanResult({
        success: false,
        message: err.response?.data?.message || 'Failed to process QR code',
        action: 'ERROR'
      });
    }
  };

  const handleScanResult = (response, qrData) => {
    if (response.requiresAuthentication) {
      const returnUrl = `/scan?type=${qrData.type}&token=${qrData.token}`;
      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
    } else if (response.canBook && !response.hasBookingDetails) {
      const bookingUrl = response.resourceType === 'SEAT' 
        ? `/seats?seat=${response.resourceId}`
        : `/book-room/${response.resourceId}`;
      setTimeout(() => navigate(bookingUrl), 3000);
    }
  };

  const handleManualScan = async () => {
    if (!manualToken.trim()) {
      setScanResult({
        success: false,
        message: 'Please enter a QR code token',
        action: 'VALIDATION_ERROR'
      });
      return;
    }

    // Construct QR URL and process
    const qrContent = `/scan?type=${manualType}&token=${manualToken.trim()}`;
    await processScan(qrContent);
  };

  const handleCheckInAction = async () => {
    if (!scanResult || !scanResult.bookingDetails) return;
    
    try {
      const response = await handleCheckIn(
        scanResult.resourceType.toLowerCase(),
        scanResult.bookingDetails.bookingId,
        scanResult.participantId
      );
      
      setScanResult({
        ...scanResult,
        action: 'CHECKED_IN',
        message: response.message,
        checkInTime: new Date().toISOString()
      });
    } catch (err) {
      setScanResult({
        ...scanResult,
        action: 'CHECK_IN_FAILED',
        message: err.response?.data?.message || 'Check-in failed'
      });
    }
  };

  const handleRescan = () => {
    setScanResult(null);
    setCameraError('');
    if (cameraPermission === 'granted') {
      setIsScanning(true);
      setManualEntry(false);
    } else {
      checkCameraPermissions();
    }
    setManualToken('');
  };

  const toggleManualEntry = () => {
    setManualEntry(!manualEntry);
    if (!manualEntry) {
      setIsScanning(false);
      cleanupScanner();
    } else {
      setScanResult(null);
      setCameraError('');
      if (cameraPermission === 'granted') {
        setIsScanning(true);
      }
    }
  };

  return (
    <div className={`qr-scanner-container ${isModal ? 'modal-scanner' : 'full-scanner'}`}>
      {!isModal && (
        <div className="scanner-header">
          <h2>Scan QR Code</h2>
          <p>Point your camera at a seat or room QR code</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {cameraError && (
        <div className="alert alert-warning">
          <i className="fas fa-camera"></i> {cameraError}
          {cameraPermission === 'denied' && (
            <div className="camera-help">
              <p>To enable camera:</p>
              <ul>
                <li>Click the camera icon in your browser's address bar</li>
                <li>Select "Always allow" for camera access</li>
                <li>Refresh this page</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Camera Permission Request */}
      {cameraPermission === 'prompt' && !manualEntry && (
        <div className="camera-permission-request">
          <div className="permission-card">
            <i className="fas fa-camera permission-icon"></i>
            <h3>Camera Access Required</h3>
            <p>To scan QR codes, we need access to your camera.</p>
            <button className="btn btn-primary" onClick={requestCameraPermission}>
              <i className="fas fa-camera"></i> Enable Camera
            </button>
            <button className="btn btn-outline" onClick={() => setManualEntry(true)}>
              Use Manual Entry Instead
            </button>
          </div>
        </div>
      )}

      {/* Scanner Controls */}
      <div className="scanner-controls">
        <button
          className={`btn btn-sm ${!manualEntry && isScanning ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => !manualEntry && cameraPermission === 'granted' ? null : requestCameraPermission()}
          disabled={cameraPermission === 'denied'}
        >
          <i className="fas fa-camera"></i> Camera Scan
        </button>
        <button
          className={`btn btn-sm ${manualEntry ? 'btn-primary' : 'btn-outline'}`}
          onClick={toggleManualEntry}
        >
          <i className="fas fa-keyboard"></i> Manual Entry
        </button>
      </div>

      {/* Camera Scanner */}
      {isScanning && !manualEntry && !scanResult && cameraPermission === 'granted' && (
        <div className="camera-scanner">
          <div id="qr-reader" className="qr-reader"></div>
          <div className="scanner-instructions">
            <p>Position the QR code within the scanning area</p>
            <div className="scanner-tips">
              <span><i className="fas fa-lightbulb"></i> Ensure good lighting</span>
              <span><i className="fas fa-mobile-alt"></i> Hold device steady</span>
              <span><i className="fas fa-expand"></i> Move closer to QR code</span>
            </div>
          </div>
          
          {/* Camera Selection */}
          {availableCameras.length > 1 && (
            <div className="camera-selection">
              <label>Camera:</label>
              <select 
                value={selectedCamera} 
                onChange={(e) => {
                  setSelectedCamera(e.target.value);
                  // Reinitialize scanner with new camera
                  if (isScanning) {
                    cleanupScanner();
                    setTimeout(initializeScanner, 100);
                  }
                }}
                className="form-control"
              >
                {availableCameras.map(camera => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `Camera ${camera.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Manual Entry */}
      {manualEntry && !scanResult && (
        <div className="manual-entry">
          <div className="manual-form">
            <h3>Manual QR Code Entry</h3>
            <div className="form-group">
              <label>QR Code Type</label>
              <select
                className="form-control"
                value={manualType}
                onChange={(e) => setManualType(e.target.value)}
              >
                <option value="seat">Seat</option>
                <option value="room">Room</option>
              </select>
            </div>
            <div className="form-group">
              <label>QR Code Token</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter the token from QR code URL"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
              />
              <small className="form-text text-muted">
                Example: abc123-def456-ghi789
              </small>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleManualScan}
              disabled={loading || !manualToken.trim()}
            >
              {loading ? 'Processing...' : 'Submit'}
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing QR code...</p>
        </div>
      )}

      {/* Scan Result */}
      {scanResult && (
        <div className="scan-result">
          <div className={`result-card ${scanResult.success ? 'success' : 'error'}`}>
            {scanResult.success ? (
              <div className="success-result">
                <div className="result-icon">
                  <i className={`fas fa-${scanResult.resourceType === 'SEAT' ? 'chair' : 'door-open'}`}></i>
                </div>
                
                <h3>{scanResult.resourceIdentifier}</h3>
                
                {/* Resource Details */}
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

                {/* Action-specific content */}
                {scanResult.action === 'CHECK_IN' && scanResult.canCheckIn && (
                  <div className="check-in-section">
                    <p className="booking-info">
                      Booking: {new Date(scanResult.bookingDetails.startTime).toLocaleTimeString()} - 
                      {new Date(scanResult.bookingDetails.endTime).toLocaleTimeString()}
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={handleCheckInAction}>
                      <i className="fas fa-check-circle"></i> Check In Now
                    </button>
                  </div>
                )}

                {scanResult.action === 'ALREADY_CHECKED_IN' && (
                  <div className="status-message success">
                    <i className="fas fa-check-circle"></i>
                    <p>You are already checked in</p>
                    <p className="check-in-time">
                      Checked in at: {new Date(scanResult.checkInTime).toLocaleTimeString()}
                    </p>
                  </div>
                )}

                {scanResult.action === 'CHECKED_IN' && (
                  <div className="status-message success">
                    <i className="fas fa-check-circle"></i>
                    <p>Successfully checked in!</p>
                    <p className="check-in-time">
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                )}

                {scanResult.action === 'TOO_EARLY' && (
                  <div className="status-message warning">
                    <i className="fas fa-clock"></i>
                    <p>{scanResult.message}</p>
                    {scanResult.warning && <p className="warning-text">{scanResult.warning}</p>}
                  </div>
                )}

                {scanResult.action === 'TOO_LATE' && (
                  <div className="status-message error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>{scanResult.message}</p>
                    {scanResult.warning && <p className="warning-text">{scanResult.warning}</p>}
                  </div>
                )}

                {scanResult.action === 'VIEW_AVAILABILITY' && (
                  <div className="availability-section">
                    <p className="availability-info">{scanResult.availabilityInfo}</p>
                    {scanResult.canBook && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          const bookingUrl = scanResult.resourceType === 'SEAT' 
                            ? `/seats?seat=${scanResult.resourceId}`
                            : `/book-room/${scanResult.resourceId}`;
                          navigate(bookingUrl);
                        }}
                      >
                        <i className="fas fa-calendar-plus"></i> Book Now
                      </button>
                    )}
                  </div>
                )}

                {scanResult.requiresAuthentication && (
                  <div className="auth-required">
                    <p>{scanResult.message}</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/login')}
                    >
                      <i className="fas fa-sign-in-alt"></i> Log In
                    </button>
                  </div>
                )}

                {scanResult.info && (
                  <div className="info-message">
                    <i className="fas fa-info-circle"></i>
                    <p>{scanResult.info}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="error-result">
                <div className="result-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Scan Failed</h3>
                <p>{scanResult.message}</p>
              </div>
            )}

            <div className="result-actions">
              <button className="btn btn-outline btn-lg" onClick={handleRescan}>
                <i className="fas fa-redo"></i> Scan Another
              </button>
              
              {!isModal && (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => navigate(-1)}
                >
                  <i className="fas fa-arrow-left"></i> Go Back
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
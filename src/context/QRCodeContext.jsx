import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  generateSeatQR,
  generateRoomQR,
  bulkGenerateSeatQRs,
  bulkGenerateRoomQRs,
  downloadQRCode,
  downloadBulkQRCodes,
  getQRStatistics,
  getQRHistory,
  generateAllMissingQRs,
  scanQRCode,
  processQRCheckIn,
  validateQRCode,
  processStoredQRScan 
} from '../api/qrcode';

const QRCodeContext = createContext();

export const useQRCode = () => {
  const context = useContext(QRCodeContext);
  if (!context) {
    throw new Error('useQRCode must be used within a QRCodeProvider');
  }
  return context;
};

export const QRCodeProvider = ({ children }) => {
  const { getToken } = useAuth(); // FIXED: Only get what we need
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [history, setHistory] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  
  // Enhanced states for our implementation
  const [scanContext, setScanContext] = useState(null);
  const [lastScanResult, setLastScanResult] = useState(null);
  
  // Modal states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  
  // Clear messages after timeout
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 5000);
  }, []);

  // Clear all scan-related state
  const clearScanState = useCallback(() => {
    setScanResult(null);
    setScanContext(null);
    setLastScanResult(null);
    setError('');
  }, []);

  // ========== QR GENERATION ==========
  
  const generateQR = async (type, resourceId) => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (type === 'seat') {
        response = await generateSeatQR(resourceId);
      } else {
        response = await generateRoomQR(resourceId);
      }
      setSuccess(`QR code generated successfully for ${type} ${response.resourceIdentifier}`);
      clearMessages();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to generate QR code`);
      clearMessages();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkGenerateQR = async (type, request) => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (type === 'seats') {
        response = await bulkGenerateSeatQRs(request);
      } else {
        response = await bulkGenerateRoomQRs(request);
      }
      
      setSuccess(`Generated ${response.successCount} QR codes successfully`);
      if (response.failureCount > 0) {
        setError(`Failed to generate ${response.failureCount} QR codes`);
      }
      clearMessages();
      
      // If generateAndDownload is true, download the ZIP
      if (request.generateAndDownload && response.generatedQRCodes) {
        await handleBulkDownload(type, response.successfulResourceIds);
      }
      
      return response;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to generate QR codes`);
      clearMessages();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateMissingQRs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await generateAllMissingQRs();
      setSuccess(`Generated ${response.totalGenerated} missing QR codes`);
      if (response.totalFailed > 0) {
        setError(`Failed to generate ${response.totalFailed} QR codes`);
      }
      clearMessages();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate missing QR codes');
      clearMessages();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========== QR DOWNLOAD ==========
  
  const handleSingleDownload = async (type, resourceId) => {
    setLoading(true);
    try {
      const response = await downloadQRCode(type, resourceId);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `QR_${type.toUpperCase()}_${resourceId}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess('QR code downloaded successfully');
      clearMessages();
    } catch (err) {
      setError('Failed to download QR code');
      clearMessages();
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDownload = async (type, resourceIds = [], downloadAll = false) => {
    setLoading(true);
    try {
      const response = await downloadBulkQRCodes(type, resourceIds, downloadAll);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `QR_${type.toUpperCase()}_BULK_${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess('QR codes downloaded successfully');
      clearMessages();
    } catch (err) {
      setError('Failed to download QR codes');
      clearMessages();
    } finally {
      setLoading(false);
    }
  };

  // ========== QR STATISTICS ==========
  
  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const data = await getQRStatistics();
      setStatistics(data);
      return data;
    } catch (err) {
      setError('Failed to fetch QR statistics');
      clearMessages();
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (type = null, resourceId = null) => {
    setLoading(true);
    try {
      const data = await getQRHistory(type, resourceId);
      setHistory(data);
      return data;
    } catch (err) {
      setError('Failed to fetch QR history');
      clearMessages();
    } finally {
      setLoading(false);
    }
  };



  // ========== ENHANCED QR SCANNING ==========
  
  const handleScan = async (type, token) => {
    setLoading(true);
    setError('');
    try {
      // Enhanced scan with authentication check
      const response = await scanQRCode(type, token);
      setScanResult(response);
      setLastScanResult(response);
      
      // Store scan context if authentication is required
      if (response.requiresAuthentication && response.qrScanContext) {
        setScanContext(response.qrScanContext);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to scan QR code';
      setError(errorMessage);
      
      // Create error scan result for better UX
      const errorResult = {
        success: false,
        message: errorMessage,
        action: 'ERROR',
        errorCode: err.response?.data?.errorCode || 'SCAN_FAILED'
      };
      setScanResult(errorResult);
      clearMessages();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Use the API function instead of manual fetch
  const handleStoredScan = async (qrContext) => {
    setLoading(true);
    setError('');
    try {
      const result = await processStoredQRScan(qrContext);
      setScanResult(result);
      setLastScanResult(result);
      setScanContext(qrContext);
      
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to process stored scan';
      setError(errorMessage);
      
      const errorResult = {
        success: false,
        message: errorMessage,
        action: 'ERROR',
        errorCode: 'STORED_SCAN_ERROR'
      };
      setScanResult(errorResult);
      clearMessages();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (type, bookingId, participantId = null) => {
    setLoading(true);
    setError('');
    try {
      const response = await processQRCheckIn(type, bookingId, participantId);
      setSuccess(response.message);
      
      // Update scan result with check-in success
      if (scanResult) {
        setScanResult({
          ...scanResult,
          action: 'CHECKED_IN',
          message: response.message,
          checkInTime: new Date().toISOString(),
          canCheckIn: false
        });
      }
      
      clearMessages();
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to check in';
      setError(errorMessage);
      
      // Update scan result with check-in failure
      if (scanResult) {
        setScanResult({
          ...scanResult,
          action: 'CHECK_IN_FAILED',
          message: errorMessage,
          errorCode: 'CHECK_IN_ERROR'
        });
      }
      
      clearMessages();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateQR = async (qrContent, expectedBookingId = null) => {
    setLoading(true);
    try {
      const response = await validateQRCode(qrContent, expectedBookingId);
      return response;
    } catch (err) {
      setError('Failed to validate QR code');
      clearMessages();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ENHANCED: Better QR data extraction
const extractQRData = (qrUrl) => {
  try {
    let url;
    
    // Handle backend API URLs
    if (qrUrl.includes('/scan')) {
      url = new URL(qrUrl);
    }
    // Handle frontend URLs (legacy)
    else if (qrUrl.startsWith('http')) {
      url = new URL(qrUrl);
    } else if (qrUrl.startsWith('/scan')) {
      url = new URL(`${window.location.origin}${qrUrl}`);
    } else {
      url = new URL(`${window.location.origin}/scan?${qrUrl}`);
    }
    
    const params = new URLSearchParams(url.search);
    const type = params.get('type');
    const token = params.get('token');
    
    if (!type || !token) {
      return null;
    }
    
    if (!['seat', 'room'].includes(type.toLowerCase())) {
      return null;
    }
    
    return {
      type: type.toLowerCase(),
      token: token.trim()
    };
  } catch (error) {
    console.error('Error extracting QR data:', error);
    return null;
  }
};

  // Validate QR token format (UUID)
  const isValidQRToken = (token) => {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // UUID v4 pattern
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(token.trim());
  };

  // Format QR scan result for display
  const formatScanResult = (result) => {
    if (!result) return null;
    
    return {
      ...result,
      formattedTime: result.bookingStartTime ? 
        new Date(result.bookingStartTime).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : null,
      formattedEndTime: result.bookingEndTime ? 
        new Date(result.bookingEndTime).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : null,
      isWithinCheckInWindow: result.checkInAvailableAt ? 
        new Date() >= new Date(result.checkInAvailableAt) : false
    };
  };

  // Get user-friendly error message
  const getErrorMessage = (errorCode, defaultMessage) => {
    const errorMessages = {
      'INVALID_QR': 'This QR code is invalid or expired',
      'SEAT_UNAVAILABLE': 'This seat is currently unavailable',
      'ROOM_UNAVAILABLE': 'This room is currently unavailable',
      'UNDER_MAINTENANCE': 'This room is under maintenance',
      'NO_BOOKING_FOR_SEAT': 'You don\'t have a booking for this seat',
      'NO_BOOKING_FOR_ROOM': 'You don\'t have a booking for this room',
      'CHECK_IN_NOT_OPEN': 'Check-in window hasn\'t opened yet',
      'CHECK_IN_EXPIRED': 'Check-in window has expired',
      'BOOKING_MISMATCH': 'QR code doesn\'t match your booking',
      'CHECK_IN_ERROR': 'Failed to complete check-in',
      'STORED_SCAN_ERROR': 'Failed to continue scan after login'
    };
    
    return errorMessages[errorCode] || defaultMessage;
  };

  // Check if scan result requires action
  const requiresUserAction = (result) => {
    if (!result) return false;
    
    const actionableResults = [
      'CHECK_IN',
      'TOO_EARLY',
      'TOO_LATE',
      'NO_BOOKING',
      'VIEW_AVAILABILITY'
    ];
    
    return actionableResults.includes(result.action);
  };

  // Get next recommended action
  const getRecommendedAction = (result) => {
    if (!result) return null;
    
    switch (result.action) {
      case 'CHECK_IN':
        return result.canCheckIn ? 'CHECK_IN_NOW' : 'WAIT_FOR_WINDOW';
      case 'TOO_EARLY':
        return 'SET_REMINDER';
      case 'TOO_LATE':
        return 'CONTACT_SUPPORT';
      case 'NO_BOOKING':
        return result.canBook ? 'BOOK_NOW' : 'FIND_ALTERNATIVE';
      case 'VIEW_AVAILABILITY':
        return 'BOOK_NOW';
      default:
        return null;
    }
  };

  const value = {
    // State
    loading,
    error,
    success,
    statistics,
    history,
    scanResult,
    showBulkModal,
    showHistoryModal,
    showScanModal,
    
    // Enhanced state
    scanContext,
    lastScanResult,
    
    // Functions
    generateQR, 
    bulkGenerateQR,
    generateMissingQRs,
    handleSingleDownload, 
    handleBulkDownload, 
    fetchStatistics,
    fetchHistory, 
    handleScan,
    handleCheckIn,
    validateQR,
    extractQRData,
    
    // Enhanced functions
    handleStoredScan,
    isValidQRToken,
    formatScanResult,
    getErrorMessage,
    requiresUserAction,
    getRecommendedAction,
    clearScanState,
    
    // Setters
    setError,
    setSuccess,
    setScanResult,
    setShowBulkModal,
    setShowHistoryModal,
    setShowScanModal,
    setScanContext
  };

  return (
    <QRCodeContext.Provider value={value}>
      {children}
    </QRCodeContext.Provider>
  );
};
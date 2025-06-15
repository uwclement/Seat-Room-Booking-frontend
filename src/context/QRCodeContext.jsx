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
  validateQRCode
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
  const { isAuthenticated, isAdmin } = useAuth();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [history, setHistory] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  
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

  // ========== QR SCANNING ==========
  
  const handleScan = async (type, token) => {
    setLoading(true);
    setError('');
    try {
      const response = await scanQRCode(type, token);
      setScanResult(response);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to scan QR code');
      clearMessages();
      throw err;
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
      clearMessages();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in');
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

  // ========== UTILITY FUNCTIONS ==========
  
  const extractQRData = (qrUrl) => {
    try {
      const url = new URL(qrUrl);
      const params = new URLSearchParams(url.search);
      return {
        type: params.get('type'),
        token: params.get('token')
      };
    } catch {
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
    
    // Setters
    setError,
    setSuccess,
    setScanResult,
    setShowBulkModal,
    setShowHistoryModal,
    setShowScanModal
  };

  return (
    <QRCodeContext.Provider value={value}>
      {children}
    </QRCodeContext.Provider>
  );
};
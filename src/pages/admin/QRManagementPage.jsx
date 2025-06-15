import React, { useState, useEffect } from 'react';
import { useQRCode } from '../../context/QRCodeContext';
import AdminSidebar from '../../components/common/AdminSidebar';
import QRCodeStatistics from '../../components/admin/qr/QRCodeStatistics';
import BulkQRModal from '../../components/admin/qr/BulkQRModal';
import QRHistoryModal from '../../components/admin/qr/QRHistoryModal';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './QRManagementPage.css';
const QRManagementPage = () => {
  const { 
    generateMissingQRs, 
    fetchStatistics, 
    handleBulkDownload,
    statistics,
    loading, 
    error, 
    success,
    setError,
    setSuccess
  } = useQRCode();
  
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [bulkType, setBulkType] = useState('seats');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleGenerateMissing = async () => {
    if (window.confirm('Generate QR codes for all seats and rooms without QR codes?')) {
      setActionLoading(prev => ({ ...prev, generateMissing: true }));
      try {
        await generateMissingQRs();
        fetchStatistics(); // Refresh stats
      } catch (err) {
        console.error('Failed to generate missing QR codes:', err);
      } finally {
        setActionLoading(prev => ({ ...prev, generateMissing: false }));
      }
    }
  };

  const handleBulkDownloadAll = async (type) => {
    setActionLoading(prev => ({ ...prev, [`download_${type}`]: true }));
    try {
      await handleBulkDownload(type, [], true);
    } catch (err) {
      console.error(`Failed to download ${type} QR codes:`, err);
    } finally {
      setActionLoading(prev => ({ ...prev, [`download_${type}`]: false }));
    }
  };

  const openBulkModal = (type) => {
    setBulkType(type);
    setShowBulkModal(true);
  };

  return (
    <div className="admin-page-container">
      <AdminSidebar activePage="qr" />
      
      <div className="admin-content">
        <div className="admin-header">
          <div className="header-content">
            <div>
              <h1>QR Code Management</h1>
              <p className="admin-subtitle">
                Generate and manage QR codes for seats and rooms
              </p>
            </div>
            <div className="header-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowHistoryModal(true)}
              >
                <i className="fas fa-history"></i>
                View History
              </button>
              <button
                className="btn btn-primary"
                onClick={handleGenerateMissing}
                disabled={actionLoading.generateMissing}
              >
                {actionLoading.generateMissing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i>
                    Generate Missing QRs
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            type="danger"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess('')}
          />
        )}

        {/* Statistics */}
        <div className="admin-card">
          <div className="card-header">
            <h2>QR Code Statistics</h2>
          </div>
          <div className="card-body">
            {loading && !statistics ? (
              <LoadingSpinner />
            ) : (
              <QRCodeStatistics />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="qr-actions-grid">
              <div className="action-card">
                <div className="action-icon">
                  <i className="fas fa-chair"></i>
                </div>
                <div className="action-content">
                  <h3>Seat QR Codes</h3>
                  <p>Generate and manage QR codes for library seats</p>
                  <div className="action-stats">
                    {statistics && (
                      <>
                        <span className="stat-item">
                          <strong>{statistics.seatsWithQRCode}</strong> with QR
                        </span>
                        <span className="stat-item">
                          <strong>{statistics.seatsWithoutQRCode}</strong> missing
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="action-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => openBulkModal('seats')}
                  >
                    <i className="fas fa-qrcode"></i>
                    Bulk Generate
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleBulkDownloadAll('seats')}
                    disabled={actionLoading.download_seats}
                  >
                    {actionLoading.download_seats ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-download"></i>
                    )}
                    Download All
                  </button>
                </div>
              </div>

              <div className="action-card">
                <div className="action-icon">
                  <i className="fas fa-door-open"></i>
                </div>
                <div className="action-content">
                  <h3>Room QR Codes</h3>
                  <p>Generate and manage QR codes for library rooms</p>
                  <div className="action-stats">
                    {statistics && (
                      <>
                        <span className="stat-item">
                          <strong>{statistics.roomsWithQRCode}</strong> with QR
                        </span>
                        <span className="stat-item">
                          <strong>{statistics.roomsWithoutQRCode}</strong> missing
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="action-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => openBulkModal('rooms')}
                  >
                    <i className="fas fa-qrcode"></i>
                    Bulk Generate
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleBulkDownloadAll('rooms')}
                    disabled={actionLoading.download_rooms}
                  >
                    {actionLoading.download_rooms ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-download"></i>
                    )}
                    Download All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {statistics && statistics.recentGenerations && statistics.recentGenerations.length > 0 && (
          <div className="admin-card">
            <div className="card-header">
              <h2>Recent QR Generation Activity</h2>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Resource</th>
                      <th>Generated By</th>
                      <th>Date</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.recentGenerations.slice(0, 10).map((log, index) => (
                      <tr key={index}>
                        <td>
                          <span className={`badge badge-${log.resourceType.toLowerCase()}`}>
                            {log.resourceType}
                          </span>
                        </td>
                        <td>#{log.resourceId}</td>
                        <td>{log.generatedBy}</td>
                        <td>{new Date(log.generatedAt).toLocaleDateString()}</td>
                        <td>{log.generationReason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowHistoryModal(true)}
                >
                  View Complete History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="admin-card">
          <div className="card-header">
            <h2>QR Code Management Guide</h2>
          </div>
          <div className="card-body">
            <div className="help-grid">
              <div className="help-item">
                <div className="help-icon">
                  <i className="fas fa-qrcode"></i>
                </div>
                <div className="help-content">
                  <h4>Generate QR Codes</h4>
                  <p>Each seat and room should have a unique QR code that users can scan to check availability or check in to their bookings.</p>
                </div>
              </div>
              
              <div className="help-item">
                <div className="help-icon">
                  <i className="fas fa-print"></i>
                </div>
                <div className="help-content">
                  <h4>Print & Install</h4>
                  <p>Download QR codes as PNG images or ZIP files for bulk printing. Install them physically at each seat or room location.</p>
                </div>
              </div>
              
              <div className="help-item">
                <div className="help-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <div className="help-content">
                  <h4>User Scanning</h4>
                  <p>Users can scan QR codes with their phone cameras to view availability, make bookings, or check in to existing reservations.</p>
                </div>
              </div>
              
              <div className="help-item">
                <div className="help-icon">
                  <i className="fas fa-sync-alt"></i>
                </div>
                <div className="help-content">
                  <h4>Update & Track</h4>
                  <p>Regenerate QR codes when needed and track all generation activity through the history log for audit purposes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <BulkQRModal
          show={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          type={bulkType}
        />

        <QRHistoryModal
          show={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />
      </div>
    </div>
  );
};

export default QRManagementPage;
import React, { useState } from 'react';
import { useEquipmentAdmin } from '../../../context/EquipmentAdminContext';
import { approveEquipmentRequest } from '../../../api/equipmentRequests';
import Alert from '../../common/Alert';
import LoadingSpinner from '../../common/LoadingSpinner';

const EquipmentRequestManagement = () => {
  const {
    pendingRequests,
    loadingRequests,
    error,
    successMessage,
    showSuccess,
    showError,
    clearMessages,
    loadPendingRequests
  } = useEquipmentAdmin();

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleApproveReject = async (requestId, approved, reason = '', suggestion = '') => {
    setProcessing(true);
    try {
      await approveEquipmentRequest(requestId, {
        approved,
        rejectionReason: reason,
        adminSuggestion: suggestion
      });
      
      await loadPendingRequests();
      showSuccess(`Request ${approved ? 'approved' : 'rejected'} successfully`);
      setShowApprovalModal(false);
      setSelectedRequest(null);
    } catch (err) {
      showError('Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  const getRequestStats = () => {
    return {
      total: pendingRequests.length,
      today: pendingRequests.filter(req => {
        const today = new Date().toISOString().split('T')[0];
        return req.createdAt.startsWith(today);
      }).length,
      urgent: pendingRequests.filter(req => {
        const requestDate = new Date(req.createdAt);
        const hoursSince = (Date.now() - requestDate.getTime()) / (1000 * 60 * 60);
        return hoursSince > 24;
      }).length,
      professors: pendingRequests.filter(req => req.userRole === 'PROFESSOR').length
    };
  };

  const stats = getRequestStats();

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>Equipment Requests</h1>
            <p className="admin-subtitle">
              Review and approve equipment requests from students and professors
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-item available">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        <div className="stat-item library">
          <div className="stat-value">{stats.today}</div>
          <div className="stat-label">Today</div>
        </div>
        <div className="stat-item maintenance">
          <div className="stat-value">{stats.urgent}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="stat-item study">
          <div className="stat-value">{stats.professors}</div>
          <div className="stat-label">From Professors</div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert type="danger" message={error} onClose={clearMessages} />
      )}

      {loadingRequests && <LoadingSpinner />}

      {/* Requests List */}
      <div className="admin-card">
        <div className="card-body">
          {pendingRequests.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-clipboard-check"></i>
              <h3>No Pending Requests</h3>
              <p>All equipment requests have been processed.</p>
            </div>
          ) : (
            <div className="request-list">
              {pendingRequests.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onApprove={() => handleApproveReject(request.id, true)}
                  onReject={() => {
                    setSelectedRequest(request);
                    setShowApprovalModal(true);
                  }}
                  processing={processing}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      <RejectionModal
        show={showApprovalModal}
        request={selectedRequest}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedRequest(null);
        }}
        onSubmit={(reason, suggestion) => 
          handleApproveReject(selectedRequest?.id, false, reason, suggestion)
        }
        loading={processing}
      />
    </div>
  );
};

// Request Card Component
const RequestCard = ({ request, onApprove, onReject, processing }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilStart = () => {
    const startTime = new Date(request.startTime);
    const now = new Date();
    const diffHours = (startTime - now) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'Started';
    if (diffHours < 24) return `${Math.round(diffHours)}h`;
    return `${Math.round(diffHours / 24)}d`;
  };

  return (
    <div className="request-card">
      <div className="request-header">
        <div className="request-basic-info">
          <h3 className="request-title">{request.equipmentName}</h3>
          <div className="request-user">
            {request.userFullName}
            {request.courseCode && (
              <span className="course-badge">{request.courseCode}</span>
            )}
          </div>
        </div>
        <div className="request-timing">
          <div className="time-until">
            <i className="fas fa-clock"></i>
            {getTimeUntilStart()}
          </div>
        </div>
      </div>

      <div className="request-details">
        <div className="request-info-grid">
          <div className="info-item">
            <i className="fas fa-calendar"></i>
            <span>{formatDate(request.startTime)}</span>
          </div>
          <div className="info-item">
            <i className="fas fa-clock"></i>
            <span>{request.durationHours}h duration</span>
          </div>
          <div className="info-item">
            <i className="fas fa-cubes"></i>
            <span>Qty: {request.requestedQuantity}</span>
          </div>
          {request.labClassName && (
            <div className="info-item">
              <i className="fas fa-flask"></i>
              <span>{request.labClassName}</span>
            </div>
          )}
        </div>

        <div className="request-reason">
          <strong>Reason:</strong> {request.reason}
        </div>

        <div className="request-actions">
          <button 
            className="btn btn-success"
            onClick={onApprove}
            disabled={processing}
          >
            <i className="fas fa-check"></i>
            Approve
          </button>
          <button 
            className="btn btn-danger"
            onClick={onReject}
            disabled={processing}
          >
            <i className="fas fa-times"></i>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

// Rejection Modal Component
const RejectionModal = ({ show, request, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit(reason, suggestion);
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Reject Equipment Request</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="request-summary">
              <strong>{request?.equipmentName}</strong> - {request?.userFullName}
            </div>

            <div className="form-group">
              <label>Rejection Reason *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="form-control"
                rows="3"
                placeholder="Explain why this request is being rejected..."
                required
              />
            </div>

            <div className="form-group">
              <label>Suggestion (Optional)</label>
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                className="form-control"
                rows="2"
                placeholder="Suggest alternative equipment or time slots..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={loading || !reason.trim()}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Rejecting...
                </>
              ) : (
                <>
                  <i className="fas fa-times"></i>
                  Reject Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentRequestManagement;
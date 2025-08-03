import React, { useState } from 'react';
import { useEquipmentAdmin } from '../../../context/EquipmentAdminContext';
import { approveLabRequest } from '../../../api/labRequests';
import Alert from '../../common/Alert';
import LoadingSpinner from '../../common/LoadingSpinner';

const LabRequestManagement = () => {
  const {
    pendingLabRequests,
    labRequests,
    loadingLabRequests,
    loadingCurrentMonthLabs,
    error,
    successMessage,
    showSuccess,
    showError,
    clearMessages,
    loadPendingLabRequests,
    loadCurrentMonthLabRequests,
    filters,
    selectedItems,
    updateFilters,
    toggleItemSelection,
    selectAllItems,
    clearSelection
  } = useEquipmentAdmin();

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleApproveReject = async (requestId, approved, reason = '', suggestion = '') => {
    setProcessing(true);
    try {
      await approveLabRequest(requestId, {
        approved,
        rejectionReason: reason,
        adminSuggestion: suggestion
      });
      
      await loadPendingLabRequests();
      await loadCurrentMonthLabRequests();
      showSuccess(`Lab request ${approved ? 'approved' : 'rejected'} successfully`);
      setShowApprovalModal(false);
      setSelectedRequest(null);
    } catch (err) {
      showError('Failed to process lab request');
    } finally {
      setProcessing(false);
    }
  };

  const getRequestStats = () => {
    return {
      total: pendingLabRequests.length,
      today: pendingLabRequests.filter(req => {
        const today = new Date().toISOString().split('T')[0];
        return req.createdAt.startsWith(today);
      }).length,
      urgent: pendingLabRequests.filter(req => {
        const requestDate = new Date(req.createdAt);
        const hoursSince = (Date.now() - requestDate.getTime()) / (1000 * 60 * 60);
        return hoursSince > 24;
      }).length,
      professors: pendingLabRequests.length // All lab requests are from professors
    };
  };

  const getFilteredLabRequests = () => {
    if (!filters.keyword) return labRequests;
    
    return labRequests.filter(request => 
      request.labClassName?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      request.userFullName?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      request.courseCode?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      request.reason?.toLowerCase().includes(filters.keyword.toLowerCase())
    );
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'HOD_APPROVED':
        return 'green';
      case 'REJECTED':
      case 'HOD_REJECTED':
        return 'red';
      case 'PENDING':
        return 'yellow';
      case 'ESCALATED':
        return 'orange';
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const canReprocess = (request) => {
    const endTime = new Date(request.endTime);
    const now = new Date();
    return request.status === 'REJECTED' && endTime > now;
  };

  const canReject = (request) => {
    const endTime = new Date(request.endTime);
    const now = new Date();
    return (request.status === 'PENDING' || request.status === 'APPROVED') && endTime > now;
  };

  const stats = getRequestStats();
  const filteredLabRequests = getFilteredLabRequests();

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>Lab Class Requests</h1>
            <p className="admin-subtitle">
              Review and approve lab class requests from professors
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-item available">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Pending Lab Requests</div>
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

      {loadingLabRequests && <LoadingSpinner />}

      {/* Pending Lab Requests */}
      <div className="admin-card">
        <div className="card-header">
          <h3>Pending Lab Requests</h3>
        </div>
        <div className="card-body">
          {pendingLabRequests.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-flask"></i>
              <h3>No Pending Lab Requests</h3>
              <p>All lab class requests have been processed.</p>
            </div>
          ) : (
            <div className="request-list">
              {pendingLabRequests.map(request => (
                <LabRequestCard
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

      {/* Current Month Lab Requests Table */}
      <div className="admin-card">
        <div className="card-header">
          <h3>Current Month Lab Requests</h3>
          <p className="card-subtitle">All lab class requests for the current month</p>
        </div>

        {/* Search and Filters */}
        <div className="card-body">
          <div className="equipment-filters">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search by lab class, professor, course, or reason..."
                value={filters.keyword}
                onChange={(e) => updateFilters({ keyword: e.target.value })}
                className="form-control"
              />
              <i className="fas fa-search search-icon"></i>
            </div>
          </div>
        </div>

        {loadingCurrentMonthLabs && <LoadingSpinner />}

        {/* Lab Requests Table */}
        <div className="card-body">
          {filteredLabRequests.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-calendar-alt"></i>
              <h3>No Lab Requests Found</h3>
              <p>
                {filters.keyword 
                  ? 'No lab requests match your search criteria.' 
                  : 'No lab requests for the current month.'}
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Lab Class</th>
                    <th>Professor</th>
                    <th>Course</th>
                    <th>Date & Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLabRequests.map(request => (
                    <tr key={request.id}>
                      <td>
                        <div className="lab-info">
                          <strong>{request.labClassName}</strong>
                          <div className="lab-number">{request.labNumber}</div>
                        </div>
                      </td>
                      <td>
                        <div className="user-info">
                          <strong>{request.userFullName}</strong>
                        </div>
                      </td>
                      <td>
                        {request.courseCode ? (
                          <span className="course-badge">{request.courseCode}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <div className="datetime-info">
                          <div className="date">
                            {new Date(request.startTime).toLocaleDateString()}
                          </div>
                          <div className="time">
                            {new Date(request.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="duration">{request.durationHours}h</span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                          <span className="status-dot"></span>
                          {request.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {request.status === 'PENDING' && (
                            <>
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => handleApproveReject(request.id, true)}
                                disabled={processing}
                                title="Approve Request"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowApprovalModal(true);
                                }}
                                disabled={processing}
                                title="Reject Request"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          )}
                          
                          {canReprocess(request) && (
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => handleApproveReject(request.id, true)}
                              disabled={processing}
                              title="Approve Request"
                            >
                              <i className="fas fa-check"></i>
                              Approve
                            </button>
                          )}
                          
                          {canReject(request) && request.status !== 'PENDING' && (
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowApprovalModal(true);
                              }}
                              disabled={processing}
                              title="Reject Request"
                            >
                              <i className="fas fa-times"></i>
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

// Lab Request Card Component
const LabRequestCard = ({ request, onApprove, onReject, processing }) => {
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
          <h3 className="request-title">
            <i className="fas fa-flask"></i>
            {request.labClassName}
          </h3>
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
            <i className="fas fa-door-open"></i>
            <span>{request.labNumber}</span>
          </div>
          <div className="info-item">
            <i className="fas fa-graduation-cap"></i>
            <span>{request.courseName}</span>
          </div>
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
            Approve Lab
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
          <h3>Reject Lab Request</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="request-summary">
              <strong>{request?.labClassName}</strong> - {request?.userFullName}
            </div>

            <div className="form-group">
              <label>Rejection Reason *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="form-control"
                rows="3"
                placeholder="Explain why this lab request is being rejected..."
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
                placeholder="Suggest alternative lab classes or time slots..."
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

export default LabRequestManagement;
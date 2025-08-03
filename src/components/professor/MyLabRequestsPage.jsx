import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProfessor } from '../../context/ProfessorContext';
import { escalateLabRequest, cancelLabRequest } from '../../api/labRequests';
import Alert from '../common/Alert';
import LoadingSpinner from '../common/LoadingSpinner';

const MyLabRequestsPage = () => {
  const {
    myLabRequests,
    loadingLabRequests,
    error,
    successMessage,
    showSuccess,
    showError,
    clearMessages,
    updateLabRequestInState,
    loadMyLabRequests
  } = useProfessor();

  const [processing, setProcessing] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    keyword: ''
  });

  useEffect(() => {
    loadMyLabRequests();
  }, []);

  const handleEscalate = async (requestId) => {
    if (!window.confirm('Are you sure you want to escalate this lab request to the HOD?')) {
      return;
    }

    setProcessing(true);
    try {
      await escalateLabRequest(requestId);
      updateLabRequestInState(requestId, { status: 'ESCALATED', escalatedToHod: true });
      showSuccess('Lab request escalated to HOD successfully');
    } catch (err) {
      showError('Failed to escalate lab request');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this lab request?')) {
      return;
    }

    setProcessing(true);
    try {
      await cancelLabRequest(requestId);
      updateLabRequestInState(requestId, { status: 'CANCELLED' });
      showSuccess('Lab request cancelled successfully');
    } catch (err) {
      showError('Failed to cancel lab request');
    } finally {
      setProcessing(false);
    }
  };

  const getFilteredRequests = () => {
    let filtered = [...myLabRequests];
    
    if (filters.status) {
      filtered = filtered.filter(req => req.status === filters.status);
    }
    
    if (filters.keyword) {
      filtered = filtered.filter(req => 
        req.labClassName.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        req.courseCode?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        req.reason.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getRequestStats = () => {
    return {
      total: myLabRequests.length,
      pending: myLabRequests.filter(req => req.status === 'PENDING').length,
      approved: myLabRequests.filter(req => 
        req.status === 'APPROVED' || req.status === 'HOD_APPROVED'
      ).length,
      rejected: myLabRequests.filter(req => 
        req.status === 'REJECTED' || req.status === 'HOD_REJECTED'
      ).length,
      escalatable: myLabRequests.filter(req => 
        req.status === 'REJECTED' && !req.escalatedToHod
      ).length
    };
  };

  const stats = getRequestStats();
  const filteredRequests = getFilteredRequests();

  if (loadingLabRequests) {
    return (
      <div className="professor-page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="professor-page">
      <div className="professor-header">
        <div className="professor-header-content">
          <div>
            <h1 className="professor-title">My Lab Requests</h1>
            <p className="professor-subtitle">
              Track and manage your lab class requests
            </p>
          </div>
          <div className="professor-quick-actions">
            <Link to="/professor/request-lab" className="professor-btn primary">
              <i className="fas fa-plus"></i>
              New Lab Request
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert type="danger" message={error} onClose={clearMessages} />
      )}
      {successMessage && (
        <Alert type="success" message={successMessage} onClose={clearMessages} />
      )}

      {/* Quick Stats */}
      <div className="professor-stats-grid">
        <div className="professor-stat-card">
          <div className="professor-stat-icon">
            <i className="fas fa-flask"></i>
          </div>
          <div className="professor-stat-value">{stats.total}</div>
          <div className="professor-stat-label">Total Requests</div>
        </div>
        <div className="professor-stat-card">
          <div className="professor-stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="professor-stat-value">{stats.pending}</div>
          <div className="professor-stat-label">Pending</div>
        </div>
        <div className="professor-stat-card">
          <div className="professor-stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="professor-stat-value">{stats.approved}</div>
          <div className="professor-stat-label">Approved</div>
        </div>
        <div className="professor-stat-card">
          <div className="professor-stat-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="professor-stat-value">{stats.escalatable}</div>
          <div className="professor-stat-label">Can Escalate</div>
        </div>
      </div>

      {/* Escalation Notice */}
      {stats.escalatable > 0 && (
        <div className="escalation-alert">
          <div className="escalation-alert-content">
            <i className="fas fa-exclamation-triangle"></i>
            <span>
              You have {stats.escalatable} rejected lab request(s) that can be escalated to HOD
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="professor-filters">
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="form-control"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ESCALATED">Escalated</option>
            <option value="HOD_APPROVED">HOD Approved</option>
            <option value="HOD_REJECTED">HOD Rejected</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search lab requests..."
            value={filters.keyword}
            onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
            className="form-control"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="professor-content-card">
        <div className="professor-card-header">
          <h3 className="professor-card-title">
            <i className="fas fa-list"></i>
            Lab Requests ({filteredRequests.length})
          </h3>
        </div>
        <div className="professor-card-body">
          {filteredRequests.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-flask"></i>
              <h4>No Lab Requests Found</h4>
              <p>
                {filters.status || filters.keyword 
                  ? 'No lab requests match your current filters.' 
                  : 'You haven\'t made any lab requests yet.'}
              </p>
              {!filters.status && !filters.keyword && (
                <Link to="/professor/request-lab" className="professor-btn primary">
                  <i className="fas fa-plus"></i>
                  Create Your First Lab Request
                </Link>
              )}
            </div>
          ) : (
            <div className="requests-grid">
              {filteredRequests.map(request => (
                <LabRequestCard
                  key={request.id}
                  request={request}
                  onEscalate={() => handleEscalate(request.id)}
                  onCancel={() => handleCancel(request.id)}
                  canEscalate={request.status === 'REJECTED' && !request.escalatedToHod}
                  canCancel={request.status === 'PENDING'}
                  processing={processing}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Lab Request Card Component
const LabRequestCard = ({ request, onEscalate, onCancel, canEscalate, canCancel, processing }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'HOD_APPROVED':
        return 'approved';
      case 'REJECTED':
      case 'HOD_REJECTED':
        return 'rejected';
      case 'ESCALATED':
        return 'escalated';
      case 'COMPLETED':
        return 'completed';
      case 'CANCELLED':
        return 'red';
      default:
        return 'pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="request-item lab-request-item">
      <div className="request-header">
        <div className="request-info">
          <div className="lab-name">
            <i className="fas fa-flask"></i>
            {request.labClassName}
          </div>
          <div className="request-meta">
            <span className="lab-number">{request.labNumber}</span>
            {request.courseCode && (
              <span className="course-tag">{request.courseCode}</span>
            )}
            <span className="request-date">{formatDate(request.createdAt)}</span>
          </div>
        </div>
        <span className={`status-badge ${getStatusColor(request.status)}`}>
          {request.status.replace('_', ' ')}
        </span>
      </div>

      <div className="request-details">
        <div className="time-info">
          <i className="fas fa-calendar"></i>
          <div>
            <div className="session-time">
              {formatFullDate(request.startTime)} - {formatDate(request.endTime)}
            </div>
            <div className="duration">Duration: {request.durationHours} hours</div>
          </div>
        </div>

        <div className="course-info">
          <i className="fas fa-graduation-cap"></i>
          <span>{request.courseName}</span>
        </div>

        <div className="reason-info">
          <i className="fas fa-comment"></i>
          <span>{request.reason}</span>
        </div>
        
        {request.rejectionReason && (
          <div className="rejection-reason">
            <i className="fas fa-exclamation-triangle"></i>
            <div>
              <strong>Rejection Reason:</strong> {request.rejectionReason}
            </div>
          </div>
        )}

        {request.adminSuggestion && (
          <div className="admin-suggestion">
            <i className="fas fa-lightbulb"></i>
            <div>
              <strong>Suggestion:</strong> {request.adminSuggestion}
            </div>
          </div>
        )}

        {request.escalatedToHod && (
          <div className="escalation-notice">
            <i className="fas fa-info-circle"></i>
            This request has been escalated to the HOD
          </div>
        )}

        <div className="request-actions">
          {canEscalate && (
            <button 
              className="escalate-btn"
              onClick={onEscalate}
              disabled={processing}
            >
              <i className="fas fa-arrow-up"></i>
              Escalate to HOD
            </button>
          )}

          {canCancel && (
            <button 
              className="cancel-btn"
              onClick={onCancel}
              disabled={processing}
            >
              <i className="fas fa-times"></i>
              Cancel Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyLabRequestsPage;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfessor } from '../../context/ProfessorContext';
import { escalateRequest } from '../../api/equipmentRequests';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyRequestsPage = () => {
  const {
    myRequests,
    loadingDashboard,
    error,
    successMessage,
    showSuccess,
    showError,
    clearMessages,
    updateRequestInState
  } = useProfessor();

  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const handleEscalate = async (requestId) => {
    if (!window.confirm('Are you sure you want to escalate this request to the HOD?')) {
      return;
    }

    setProcessing(true);
    try {
      await escalateRequest(requestId);
      updateRequestInState(requestId, { status: 'ESCALATED', escalatedToHod: true });
      showSuccess('Request escalated to HOD successfully');
    } catch (err) {
      showError('Failed to escalate request');
    } finally {
      setProcessing(false);
    }
  };

  const getFilteredAndSortedRequests = () => {
    let filtered = myRequests;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => {
        switch (filterStatus) {
          case 'pending':
            return request.status === 'PENDING';
          case 'approved':
            return request.status === 'APPROVED' || request.status === 'HOD_APPROVED';
          case 'rejected':
            return request.status === 'REJECTED' || request.status === 'HOD_REJECTED';
          case 'escalated':
            return request.status === 'ESCALATED';
          default:
            return true;
        }
      });
    }

    // Sort requests
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'equipment':
          return (a.equipmentName || '').localeCompare(b.equipmentName || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getStatusCounts = () => {
    return {
      all: myRequests.length,
      pending: myRequests.filter(req => req.status === 'PENDING').length,
      approved: myRequests.filter(req => 
        req.status === 'APPROVED' || req.status === 'HOD_APPROVED'
      ).length,
      rejected: myRequests.filter(req => 
        req.status === 'REJECTED' || req.status === 'HOD_REJECTED'
      ).length,
      escalated: myRequests.filter(req => req.status === 'ESCALATED').length
    };
  };

  const filteredRequests = getFilteredAndSortedRequests();
  const statusCounts = getStatusCounts();

  if (loadingDashboard) {
    return (
      <div className="professor-dashboard">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="professor-dashboard">
      {/* Header */}
      <div className="professor-header">
        <div className="professor-header-content">
          <div>
            <h1 className="professor-title">My Equipment Requests</h1>
            <p className="professor-subtitle">
              View and manage all your equipment requests
            </p>
          </div>
          <div className="professor-quick-actions">
            <Link to="/professor/dashboard" className="professor-btn secondary">
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
            </Link>
            <Link to="/professor/request-equipment" className="professor-btn primary">
              <i className="fas fa-plus"></i>
              New Request
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Alerts */}
        {error && (
          <Alert type="danger" message={error} onClose={clearMessages} />
        )}

        {successMessage && (
          <Alert type="success" message={successMessage} onClose={clearMessages} />
        )}

        {/* Filters and Stats */}
        <div className="professor-content-card">
          <div className="professor-card-header">
            <h3 className="professor-card-title">
              <i className="fas fa-filter"></i>
              Filter & Sort Requests
            </h3>
          </div>
          <div className="professor-card-body">
            {/* Status Filter Tabs */}
            <div className="status-filter-tabs">
              {[
                { key: 'all', label: 'All Requests', count: statusCounts.all },
                { key: 'pending', label: 'Pending', count: statusCounts.pending },
                { key: 'approved', label: 'Approved', count: statusCounts.approved },
                { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
                { key: 'escalated', label: 'Escalated', count: statusCounts.escalated }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`status-filter-tab ${filterStatus === tab.key ? 'active' : ''}`}
                >
                  <span>{tab.label}</span>
                  <span className="tab-count">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="sort-controls">
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-control sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="equipment">Equipment Name</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="professor-content-card">
          <div className="professor-card-header">
            <h3 className="professor-card-title">
              <i className="fas fa-list"></i>
              Requests ({filteredRequests.length})
            </h3>
          </div>
          <div className="professor-card-body">
            {filteredRequests.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-clipboard-list"></i>
                <h4>No Requests Found</h4>
                <p>
                  {myRequests.length === 0 
                    ? 'You haven\'t created any equipment requests yet.'
                    : 'No requests match your current filter criteria.'
                  }
                </p>
                {myRequests.length === 0 && (
                  <Link to="/professor/request-equipment" className="professor-btn primary">
                    <i className="fas fa-plus"></i>
                    Create Your First Request
                  </Link>
                )}
              </div>
            ) : (
              <div className="requests-list">
                {filteredRequests.map(request => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onEscalate={() => handleEscalate(request.id)}
                    canEscalate={request.status === 'REJECTED' && !request.escalatedToHod}
                    processing={processing}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Request Card Component
const RequestCard = ({ request, onEscalate, canEscalate, processing }) => {
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
      default:
        return 'pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="request-card-detailed">
      <div className="request-card-header">
        <div className="request-basic-info">
          <h4 className="equipment-name">{request.equipmentName}</h4>
          <div className="request-meta">
            {request.courseCode && (
              <span className="course-tag">{request.courseCode}</span>
            )}
            <span className="request-date">
              Requested: {formatDate(request.createdAt)}
            </span>
          </div>
        </div>
        <div className="request-status-info">
          <span className={`status-badge ${getStatusColor(request.status)}`}>
            {request.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="request-card-body">
        <div className="request-details-grid">
          <div className="detail-item">
            <label>Scheduled Time:</label>
            <div className="time-info">
              <i className="fas fa-calendar"></i>
              {formatDate(request.startTime)} - {formatDate(request.endTime)}
            </div>
          </div>

          <div className="detail-item">
            <label>Quantity:</label>
            <span>{request.requestedQuantity || 1}</span>
          </div>

          {request.labClassName && (
            <div className="detail-item">
              <label>Lab Class:</label>
              <span>{request.labClassName}</span>
            </div>
          )}
        </div>

        <div className="request-reason">
          <label>Reason:</label>
          <p>{request.reason}</p>
        </div>

        {request.rejectionReason && (
          <div className="rejection-reason">
            <i className="fas fa-exclamation-triangle"></i>
            <div>
              <strong>Rejection Reason:</strong>
              <p>{request.rejectionReason}</p>
            </div>
          </div>
        )}

        {request.adminSuggestion && (
          <div className="admin-suggestion">
            <i className="fas fa-lightbulb"></i>
            <div>
              <strong>Admin Suggestion:</strong>
              <p>{request.adminSuggestion}</p>
            </div>
          </div>
        )}

        {request.escalatedToHod && (
          <div className="escalation-notice">
            <i className="fas fa-info-circle"></i>
            This request has been escalated to the HOD for review
          </div>
        )}

        {canEscalate && (
          <div className="request-actions">
            <button 
              className="escalate-btn"
              onClick={onEscalate}
              disabled={processing}
            >
              <i className="fas fa-arrow-up"></i>
              Escalate to HOD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequestsPage;
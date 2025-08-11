import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfessor } from '../../context/ProfessorContext';
import { escalateRequest, respondToSuggestion, requestExtension, cancelRequest } from '../../api/equipmentRequests';
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

    // Filter by status - Enhanced with new statuses
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
          case 'active':
            return request.status === 'IN_USE' || request.status === 'APPROVED';
          case 'completed':
            return request.status === 'RETURNED' || request.status === 'COMPLETED';
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
      escalated: myRequests.filter(req => req.status === 'ESCALATED').length,
      active: myRequests.filter(req => 
        req.status === 'IN_USE' || req.status === 'APPROVED'
      ).length,
      completed: myRequests.filter(req => 
        req.status === 'RETURNED' || req.status === 'COMPLETED'
      ).length
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

        {/* Enhanced Filters and Stats */}
        <div className="professor-content-card">
          <div className="professor-card-header">
            <h3 className="professor-card-title">
              <i className="fas fa-filter"></i>
              Filter & Sort Requests
            </h3>
          </div>
          <div className="professor-card-body">
            {/* Enhanced Status Filter Tabs */}
            <div className="status-filter-tabs">
              {[
                { key: 'all', label: 'All Requests', count: statusCounts.all },
                { key: 'pending', label: 'Pending', count: statusCounts.pending },
                { key: 'approved', label: 'Approved', count: statusCounts.approved },
                { key: 'active', label: 'Active', count: statusCounts.active },
                { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
                { key: 'escalated', label: 'Escalated', count: statusCounts.escalated },
                { key: 'completed', label: 'Completed', count: statusCounts.completed }
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
                    onUpdateRequest={updateRequestInState}
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

// Enhanced Request Card Component
const RequestCard = ({ request, onEscalate, canEscalate, processing, onUpdateRequest }) => {
  const [showSuggestionResponse, setShowSuggestionResponse] = useState(false);
  const [showExtensionForm, setShowExtensionForm] = useState(false);
  const [suggestionResponse, setSuggestionResponse] = useState('');
  const [suggestionAcknowledged, setSuggestionAcknowledged] = useState(null);
  const [extensionHours, setExtensionHours] = useState('');
  const [extensionReason, setExtensionReason] = useState('');
  const [localProcessing, setLocalProcessing] = useState(false);

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
      case 'IN_USE':
        return 'in-use';
      case 'RETURNED':
        return 'returned';
      case 'COMPLETED':
        return 'completed';
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

const handleSuggestionResponse = async () => {
  if (suggestionAcknowledged === null) {
    alert('Please select whether you acknowledge or reject the suggestion');
    return;
  }
  
  setLocalProcessing(true);
  try {
    // Prepare the request data exactly as expected by backend
    const requestData = {
      suggestionAcknowledged: suggestionAcknowledged,
      suggestionResponseReason: suggestionAcknowledged === false ? suggestionResponse : null
    };
    
    console.log('Sending suggestion response:', requestData); // Debug log
    
    await respondToSuggestion(request.id, requestData);
    
    // Update local state
    onUpdateRequest(request.id, {
      suggestionAcknowledged: suggestionAcknowledged,
      suggestionResponseReason: requestData.suggestionResponseReason,
      suggestionResponseAt: new Date().toISOString()
    });
    
    setShowSuggestionResponse(false);
    setSuggestionAcknowledged(null);
    setSuggestionResponse('');
    
    alert('Response submitted successfully');
  } catch (error) {
    console.error('Failed to respond to suggestion:', error);
    alert(error.response?.data?.message || 'Failed to respond to suggestion');
  } finally {
    setLocalProcessing(false);
  }
};

const handleExtensionRequest = async () => {
  if (!extensionHours || !extensionReason) {
    alert('Please fill in both extension hours and reason');
    return;
  }
  
  const hours = parseFloat(extensionHours);
  if (isNaN(hours) || hours < 0.1 || hours > 3.0) {
    alert('Extension must be between 0.1 and 3.0 hours');
    return;
  }
  
  setLocalProcessing(true);
  try {
    const requestData = {
      extensionHoursRequested: hours,
      extensionReason: extensionReason.trim()
    };
    
    console.log('Sending extension request:', requestData); // Debug log
    
    await requestExtension(request.id, requestData);
    
    // Update local state
    onUpdateRequest(request.id, {
      extensionStatus: 'PENDING',
      extensionHoursRequested: hours,
      extensionReason: extensionReason.trim(),
      extensionRequestedAt: new Date().toISOString()
    });
    
    setShowExtensionForm(false);
    setExtensionHours('');
    setExtensionReason('');
    
    alert('Extension request submitted successfully');
  } catch (error) {
    console.error('Failed to request extension:', error);
    alert(error.response?.data?.message || 'Failed to request extension');
  } finally {
    setLocalProcessing(false);
  }
};

  const handleCancelRequest = async () => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    
    setLocalProcessing(true);
    try {
      await cancelRequest(request.id);
      onUpdateRequest(request.id, { status: 'CANCELLED' });
    } catch (error) {
      alert('Failed to cancel request');
    } finally {
      setLocalProcessing(false);
    }
  };

  // Check if user can respond to suggestion
  const canRespondToSuggestion = request.adminSuggestion && 
    request.suggestionAcknowledged === null && 
    request.status !== 'HOD_REJECTED';

  // Check if user can request extension
  const canRequestExtension = (request.status === 'APPROVED' || request.status === 'IN_USE') &&
    (!request.extensionStatus || request.extensionStatus === 'REJECTED') &&
    (request.remainingExtensionHours || 3.0) > 0;

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
          {request.returnedAt && (
            <span className="return-info">
              Returned: {formatDate(request.returnedAt)}
            </span>
          )}
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

          {request.extensionHoursRequested && (
            <div className="detail-item">
              <label>Extension:</label>
              <span>{request.extensionHoursRequested}h ({request.extensionStatus})</span>
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
              
              {/* Suggestion Response Section */}
              {request.suggestionAcknowledged !== null ? (
                <div className="suggestion-response">
                  <strong>Your Response:</strong> 
                  <span className={request.suggestionAcknowledged ? 'acknowledged' : 'rejected'}>
                    {request.suggestionAcknowledged ? 'Acknowledged' : 'Rejected'}
                  </span>
                  {request.suggestionResponseReason && (
                    <p>Reason: {request.suggestionResponseReason}</p>
                  )}
                </div>
              ) : canRespondToSuggestion && (
                <div className="suggestion-response-form">
                  {!showSuggestionResponse ? (
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => setShowSuggestionResponse(true)}
                    >
                      Respond to Suggestion
                    </button>
                  ) : (
                    <div className="response-form">
                      <div className="response-options">
                        <label>
                          <input 
                            type="radio" 
                            name={`suggestion-response-${request.id}`} 
                            value="acknowledge"
                            checked={suggestionAcknowledged === true}
                            onChange={() => setSuggestionAcknowledged(true)}
                          />
                          Acknowledge
                        </label>
                        <label>
                          <input 
                            type="radio" 
                            name={`suggestion-response-${request.id}`} 
                            value="reject"
                            checked={suggestionAcknowledged === false}
                            onChange={() => setSuggestionAcknowledged(false)}
                          />
                          Reject
                        </label>
                      </div>
                      {suggestionAcknowledged === false && (
                        <textarea
                          placeholder="Why do you reject this suggestion? (optional)"
                          value={suggestionResponse}
                          onChange={(e) => setSuggestionResponse(e.target.value)}
                          className="form-control"
                          rows="2"
                        />
                      )}
                      <div className="response-actions">
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={handleSuggestionResponse}
                          disabled={localProcessing || suggestionAcknowledged === null}
                        >
                          Submit Response
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setShowSuggestionResponse(false);
                            setSuggestionAcknowledged(null);
                            setSuggestionResponse('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {request.escalatedToHod && (
          <div className="escalation-notice">
            <i className="fas fa-info-circle"></i>
            This request has been escalated to the HOD for review
          </div>
        )}

        {/* Extension Section */}
        {canRequestExtension && (
          <div className="extension-section">
            {!showExtensionForm ? (
              <button 
                className="btn btn-sm btn-info"
                onClick={() => setShowExtensionForm(true)}
              >
                <i className="fas fa-clock"></i>
                Request Extension
              </button>
            ) : (
              <div className="extension-form">
                <h5>Request Extension</h5>
                <p className="extension-limit">
                  Daily limit: {(request.remainingExtensionHours || 3.0).toFixed(1)} hours remaining
                </p>
                <div className="form-group">
                  <label>Extension Hours (0.1 - 3.0):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={request.remainingExtensionHours || 3.0}
                    value={extensionHours}
                    onChange={(e) => setExtensionHours(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Reason:</label>
                  <textarea
                    value={extensionReason}
                    onChange={(e) => setExtensionReason(e.target.value)}
                    className="form-control"
                    rows="3"
                    placeholder="Why do you need this extension?"
                    required
                  />
                </div>
                <div className="extension-actions">
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={handleExtensionRequest}
                    disabled={localProcessing || !extensionHours || !extensionReason}
                  >
                    Request Extension
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setShowExtensionForm(false);
                      setExtensionHours('');
                      setExtensionReason('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
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
          
          {request.status === 'PENDING' && (
            <button 
              className="btn btn-sm btn-danger"
              onClick={handleCancelRequest}
              disabled={localProcessing}
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

export default MyRequestsPage;
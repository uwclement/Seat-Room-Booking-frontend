import React, { useState, useEffect } from 'react';
import { useEquipmentAdmin } from '../../../context/EquipmentAdminContext';
import { 
  approveEquipmentRequest, 
  markEquipmentReturned, 
  handleExtensionRequest, 
  completeRequest,
  getActiveRequests,
  getExtensionRequests
} from '../../../api/equipmentRequests';
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
    loadPendingRequests,
    EquipmentRequests,
    loadingEquipmentRequests,
    filters,
    selectedItems,
    updateFilters,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    updateItemInState,
    removeItemFromState,
    loadEquipmentRequests
  } = useEquipmentAdmin();

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [activeRequests, setActiveRequests] = useState([]);
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('current-month');

  // Load additional data
  useEffect(() => {
    loadActiveRequestsData();
    loadExtensionRequestsData();
  }, []);

  const loadActiveRequestsData = async () => {
    try {
      const data = await getActiveRequests();
      setActiveRequests(data);
    } catch (err) {
      console.error('Failed to load active requests');
    }
  };

  const loadExtensionRequestsData = async () => {
    try {
      const data = await getExtensionRequests();
      setExtensionRequests(data);
    } catch (err) {
      console.error('Failed to load extension requests');
    }
  };

  const handleApproveReject = async (requestId, approved, reason = '', suggestion = '') => {
    setProcessing(true);
    try {
      await approveEquipmentRequest(requestId, {
        approved,
        rejectionReason: reason,
        adminSuggestion: suggestion
      });
      
      await loadPendingRequests();
      await loadEquipmentRequests();
      await loadActiveRequestsData();
      showSuccess(`Request ${approved ? 'approved' : 'rejected'} successfully`);
      setShowApprovalModal(false);
      setSelectedRequest(null);
    } catch (err) {
      showError('Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkReturned = async (requestId, returnData) => {
    setProcessing(true);
    try {
      await markEquipmentReturned(requestId, returnData);
      
      // Update state
      updateItemInState(requestId, {
        status: 'RETURNED',
        returnedAt: new Date().toISOString(),
        ...returnData
      });
      
      await loadActiveRequestsData();
      await loadEquipmentRequests();
      showSuccess('Equipment marked as returned successfully');
    } catch (err) {
      showError('Failed to mark equipment as returned');
    } finally {
      setProcessing(false);
    }
  };

  const handleExtension = async (requestId, approved, rejectionReason = null) => {
    setProcessing(true);
    try {
      await handleExtensionRequest(requestId, {
        approved,
        rejectionReason
      });
      
      updateItemInState(requestId, {
        extensionStatus: approved ? 'APPROVED' : 'REJECTED',
        extensionApprovedAt: new Date().toISOString()
      });
      
      await loadExtensionRequestsData();
      await loadActiveRequestsData();
      await loadEquipmentRequests();
      showSuccess(`Extension ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      showError('Failed to process extension request');
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteRequest = async (requestId) => {
    setProcessing(true);
    try {
      await completeRequest(requestId);
      
      updateItemInState(requestId, {
        status: 'COMPLETED'
      });
      
      await loadActiveRequestsData();
      await loadEquipmentRequests();
      showSuccess('Request completed successfully');
    } catch (err) {
      showError('Failed to complete request');
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
      professors: pendingRequests.filter(req => req.userRole === 'PROFESSOR').length,
      active: activeRequests.length,
      extensions: extensionRequests.length
    };
  };

  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'current-month':
        return EquipmentRequests;
      case 'active':
        return activeRequests;
      case 'extensions':
        return extensionRequests;
      default:
        return EquipmentRequests;
    }
  };

  const getFilteredRequests = () => {
    const data = getCurrentTabData();
    if (!filters.keyword) return data;
    
    return data.filter(request => 
      request.equipmentName?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      request.userFullName?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      request.courseCode?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      request.reason?.toLowerCase().includes(filters.keyword.toLowerCase())
    );
  };

  const handleBulkApproval = async (action) => {
    if (selectedItems.length === 0) {
      showError('Please select requests to perform bulk action');
      return;
    }

    const validRequests = selectedItems.filter(requestId => {
      const request = getCurrentTabData().find(r => r.id === requestId);
      if (!request) return false;
      
      const endTime = new Date(request.endTime);
      const now = new Date();
      const isTimeValid = endTime > now;
      
      if (action === 'approve') {
        return (request.status === 'PENDING' || request.status === 'REJECTED') && isTimeValid;
      } else if (action === 'reject') {
        return (request.status === 'PENDING' || request.status === 'APPROVED') && isTimeValid;
      }
      return false;
    });

    if (validRequests.length === 0) {
      showError(`No valid requests selected for ${action} action`);
      return;
    }

    if (!window.confirm(`Are you sure you want to ${action} ${validRequests.length} request(s)?`)) {
      return;
    }

    setProcessing(true);
    try {
      for (const requestId of validRequests) {
        if (action === 'approve') {
          await approveEquipmentRequest(requestId, { approved: true });
        } else if (action === 'reject') {
          await approveEquipmentRequest(requestId, { 
            approved: false, 
            rejectionReason: 'Bulk rejection by admin' 
          });
        }
      }
      
      await loadPendingRequests();
      await loadEquipmentRequests();
      await loadActiveRequestsData();
      clearSelection();
      showSuccess(`Bulk ${action} completed successfully for ${validRequests.length} request(s)`);
    } catch (err) {
      showError(`Failed to perform bulk ${action}`);
    } finally {
      setProcessing(false);
    }
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
      case 'IN_USE':
        return 'blue';
      case 'RETURNED':
        return 'purple';
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

  const canMarkReturned = (request) => {
    return (request.status === 'APPROVED' || 
            request.status === 'IN_USE' || 
            request.status === 'HOD_APPROVED') && 
            !request.returnedAt;
  };

  const canComplete = (request) => {
    return request.status === 'RETURNED';
  };

  const stats = getRequestStats();
  const filteredRequests = getFilteredRequests();

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

      {/* Enhanced Quick Stats */}
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
        <div className="stat-item active">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active Bookings</div>
        </div>
        <div className="stat-item extensions">
          <div className="stat-value">{stats.extensions}</div>
          <div className="stat-label">Extension Requests</div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert type="danger" message={error} onClose={clearMessages} />
      )}

      {loadingRequests && <LoadingSpinner />}

      {/* Pending Requests List */}
      <div className="admin-card">
        <div className="card-header">
          <h3>Pending Requests</h3>
        </div>
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

      {/* Enhanced Equipment Requests Table with Tabs */}
      <div className="admin-card">
        <div className="card-header">
          <h3>Equipment Requests Management</h3>
          
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'current-month' ? 'active' : ''}`}
              onClick={() => setActiveTab('current-month')}
            >
              Current Month ({EquipmentRequests.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active Bookings ({activeRequests.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'extensions' ? 'active' : ''}`}
              onClick={() => setActiveTab('extensions')}
            >
              Extension Requests ({extensionRequests.length})
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card-body">
          <div className="equipment-filters">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search by equipment, user, course, or reason..."
                value={filters.keyword}
                onChange={(e) => updateFilters({ keyword: e.target.value })}
                className="form-control"
              />
              <i className="fas fa-search search-icon"></i>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="bulk-action-toolbar">
            <div className="bulk-info">
              <span className="selection-count">{selectedItems.length} request(s) selected</span>
            </div>
            <div className="bulk-actions">
              <button 
                className="btn btn-sm btn-secondary"
                onClick={clearSelection}
              >
                Clear Selection
              </button>
              <button 
                className="btn btn-sm btn-success"
                onClick={() => handleBulkApproval('approve')}
                disabled={processing}
              >
                Bulk Approve
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleBulkApproval('reject')}
                disabled={processing}
              >
                Bulk Reject
              </button>
            </div>
          </div>
        )}

        {loadingEquipmentRequests && <LoadingSpinner />}

        {/* Equipment Requests Table */}
        <div className="card-body">
          {filteredRequests.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-calendar-alt"></i>
              <h3>No Requests Found</h3>
              <p>
                {filters.keyword 
                  ? 'No equipment requests match your search criteria.' 
                  : `No ${activeTab.replace('-', ' ')} requests found.`}
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredRequests.length && filteredRequests.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            selectAllItems();
                          } else {
                            clearSelection();
                          }
                        }}
                      />
                    </th>
                    <th>Equipment</th>
                    <th>Requested By</th>
                    <th>Course</th>
                    <th>Date & Time</th>
                    <th>Duration</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(request => (
                    <EnhancedTableRow
                      key={request.id}
                      request={request}
                      selectedItems={selectedItems}
                      toggleItemSelection={toggleItemSelection}
                      onApprove={() => handleApproveReject(request.id, true)}
                      onReject={() => {
                        setSelectedRequest(request);
                        setShowApprovalModal(true);
                      }}
                      onMarkReturned={handleMarkReturned}
                      onHandleExtension={handleExtension}
                      onComplete={handleCompleteRequest}
                      processing={processing}
                      canReprocess={canReprocess}
                      canReject={canReject}
                      canMarkReturned={canMarkReturned}
                      canComplete={canComplete}
                      getStatusBadgeClass={getStatusBadgeClass}
                    />
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

// Enhanced Table Row Component
const EnhancedTableRow = ({ 
  request, 
  selectedItems, 
  toggleItemSelection, 
  onApprove, 
  onReject, 
  onMarkReturned, 
  onHandleExtension, 
  onComplete,
  processing,
  canReprocess,
  canReject,
  canMarkReturned,
  canComplete,
  getStatusBadgeClass
}) => {
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnNotes, setReturnNotes] = useState('');
  const [localProcessing, setLocalProcessing] = useState(false);

  const handleMarkReturned = async () => {
    setLocalProcessing(true);
    try {
      await onMarkReturned(request.id, {
        returnCondition,
        returnNotes
      });
      setShowReturnForm(false);
      setReturnCondition('GOOD');
      setReturnNotes('');
    } catch (error) {
      console.error('Failed to mark as returned');
    } finally {
      setLocalProcessing(false);
    }
  };

  const handleExtensionApproval = async (approved) => {
    setLocalProcessing(true);
    try {
      await onHandleExtension(request.id, approved, approved ? null : 'Admin decision');
    } catch (error) {
      console.error('Failed to process extension');
    } finally {
      setLocalProcessing(false);
    }
  };

  return (
    <>
      <tr className={selectedItems.includes(request.id) ? 'selected' : ''}>
        <td>
          <input
            type="checkbox"
            checked={selectedItems.includes(request.id)}
            onChange={() => toggleItemSelection(request.id)}
          />
        </td>
        <td>
          <div className="equipment-info">
            <strong>{request.equipmentName}</strong>
            {request.labClassName && (
              <div className="lab-info">
                <i className="fas fa-flask"></i>
                {request.labClassName}
              </div>
            )}
          </div>
        </td>
        <td>
          <div className="user-info">
            <strong>{request.userFullName}</strong>
            <div className="user-role">
              <span className={`role-badge ${request.userRole?.toLowerCase()}`}>
                {request.userRole}
              </span>
            </div>
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
            {request.originalEndTime && request.endTime !== request.originalEndTime && (
              <div className="extension-info">
                <i className="fas fa-clock text-info"></i>
                Extended
              </div>
            )}
          </div>
        </td>
        <td>
          <span className="duration">{request.durationHours}h</span>
        </td>
        <td>
          <span className="quantity">{request.requestedQuantity}</span>
        </td>
        <td>
          <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
            <span className="status-dot"></span>
            {request.status.replace('_', ' ')}
          </span>
          {request.returnedAt && (
            <div className="return-status">
              <i className="fas fa-check-circle text-success"></i>
              {request.returnCondition}
            </div>
          )}
        </td>
        <td>
          <div className="action-buttons">
            {/* Extension Actions */}
            {request.extensionStatus === 'PENDING' && (
              <div className="extension-actions">
                <button 
                  className="btn btn-sm btn-success"
                  onClick={() => handleExtensionApproval(true)}
                  disabled={processing || localProcessing}
                  title="Approve Extension"
                >
                  <i className="fas fa-clock"></i>
                  Approve Ext
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleExtensionApproval(false)}
                  disabled={processing || localProcessing}
                  title="Reject Extension"
                >
                  <i className="fas fa-times"></i>
                  Reject Ext
                </button>
              </div>
            )}

            {/* Return Actions */}
            {canMarkReturned(request) && (
              <button 
                className="btn btn-sm btn-info"
                onClick={() => setShowReturnForm(true)}
                disabled={processing || localProcessing}
                title="Mark as Returned"
              >
                <i className="fas fa-undo"></i>
                Return
              </button>
            )}

            {/* Complete Action */}
            {canComplete(request) && (
              <button 
                className="btn btn-sm btn-success"
                onClick={() => onComplete(request.id)}
                disabled={processing || localProcessing}
                title="Complete Request"
              >
                <i className="fas fa-check"></i>
                Complete
              </button>
            )}

            {/* Standard Actions */}
            {request.status === 'PENDING' && (
              <>
                <button 
                  className="btn btn-sm btn-success"
                  onClick={onApprove}
                  disabled={processing || localProcessing}
                  title="Approve Request"
                >
                  <i className="fas fa-check"></i>
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={onReject}
                  disabled={processing || localProcessing}
                  title="Reject Request"
                >
                  <i className="fas fa-times"></i>
                </button>
              </>
            )}
            
            {canReprocess(request) && (
              <button 
                className="btn btn-sm btn-success"
                onClick={onApprove}
                disabled={processing || localProcessing}
                title="Approve Request"
              >
                <i className="fas fa-check"></i>
                Approve
              </button>
            )}
            
            {canReject(request) && request.status !== 'PENDING' && (
              <button 
                className="btn btn-sm btn-danger"
                onClick={onReject}
                disabled={processing || localProcessing}
                title="Reject Request"
              >
                <i className="fas fa-times"></i>
                Reject
              </button> 
            )}
          </div>
        </td>
      </tr>

      {/* Return Form Row */}
      {showReturnForm && (
        <tr className="return-form-row">
          <td colSpan="9">
            <div className="return-form">
              <h5>Mark Equipment as Returned</h5>
              <div className="form-row">
                <div className="form-group">
                  <label>Condition:</label>
                  <select 
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                    className="form-control"
                  >
                    <option value="GOOD">Good Condition</option>
                    <option value="DAMAGED">Damaged</option>
                    <option value="MISSING_PARTS">Missing Parts</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes:</label>
                  <textarea
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    className="form-control"
                    rows="2"
                    placeholder="Additional notes about the equipment condition..."
                  />
                </div>
                <div className="form-actions">
                  <button 
                    className="btn btn-success"
                    onClick={handleMarkReturned}
                    disabled={localProcessing}
                  >
                    {localProcessing ? 'Processing...' : 'Mark as Returned'}
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowReturnForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// Request Card Component (existing component remains the same)
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

// Rejection Modal Component (existing component remains the same)
const RejectionModal = ({ show, request, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit(reason, suggestion);
    setReason('');
    setSuggestion('');
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
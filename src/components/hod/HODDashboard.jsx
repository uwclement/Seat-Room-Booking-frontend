import React, { useState, useEffect } from 'react';
import { 
  getPendingProfessorApprovals,
  approveProfessorAccount,
  rejectProfessorAccount
} from '../../api/professor';
import { 
  getEscalatedRequests,
  hodReviewRequest
} from '../../api/equipmentRequests';
import { getHodCurrentMonthEquipmentRequests } from '../../api/equipmentAdmin';
import { getHODDashboard } from '../../api/dashboards';
import Alert from '../common/Alert';
import LoadingSpinner from '../common/LoadingSpinner';

const HODDashboard = () => {
  const [pendingProfessors, setPendingProfessors] = useState([]);
  const [escalatedRequests, setEscalatedRequests] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hodEquipmentRequests, setHodEquipmentRequests] = useState([]);
  const [loadingHodRequests, setLoadingHodRequests] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [professors, requests, dashboard] = await Promise.all([
        getPendingProfessorApprovals(),
        getEscalatedRequests(),
        getHODDashboard()
      ]);
      
      setPendingProfessors(professors);
      setEscalatedRequests(requests);
      setDashboardData(dashboard);
      
      // Load equipment requests separately
      await loadHodEquipmentRequests();
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load HOD equipment requests
  const loadHodEquipmentRequests = async () => {
    setLoadingHodRequests(true);
    try {
      const data = await getHodCurrentMonthEquipmentRequests();
      setHodEquipmentRequests(data);
    } catch (err) {
      setError('Failed to load equipment requests');
    } finally {
      setLoadingHodRequests(false);
    }
  };

  const handleApproveProfessor = async (professorId) => {
    setProcessing(true);
    try {
      await approveProfessorAccount(professorId);
      setPendingProfessors(prev => prev.filter(p => p.id !== professorId));
      setSuccessMessage('Professor account approved successfully');
    } catch (err) {
      setError('Failed to approve professor');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectProfessor = async (professorId, rejectionReason) => {
    setProcessing(true);
    try {
      await rejectProfessorAccount(professorId, rejectionReason);
      setPendingProfessors(prev => prev.filter(p => p.id !== professorId));
      setSuccessMessage('Professor account rejected');
    } catch (err) {
      setError('Failed to reject professor');
    } finally {
      setProcessing(false);
    }
  };

  const handleReviewEscalation = async (requestId, approved, reason = '') => {
    setProcessing(true);
    try {
      await hodReviewRequest(requestId, { approved, rejectionReason: reason });
      setEscalatedRequests(prev => prev.filter(r => r.id !== requestId));
      setSuccessMessage(`Request ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      setError('Failed to process escalation');
    } finally {
      setProcessing(false);
    }
  };

  const getQuickStats = () => {
    if (!dashboardData) return {};
    
    return {
      pendingProfessors: pendingProfessors.length,
      escalatedRequests: escalatedRequests.length,
      totalEquipmentRequests: hodEquipmentRequests.length,
      totalProfessors: dashboardData.totalProfessors || 0,
      escalationRate: dashboardData.escalationRate || 0
    };
  };

  const stats = getQuickStats();

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>HOD Dashboard</h1>
            <p className="admin-subtitle">
              Department oversight and approval management
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-item maintenance">
          <div className="stat-value">{stats.pendingProfessors}</div>
          <div className="stat-label">Pending Professor Approvals</div>
        </div>
        <div className="stat-item disabled">
          <div className="stat-value">{stats.escalatedRequests}</div>
          <div className="stat-label">Escalated Requests</div>
        </div>
        <div className="stat-item library">
          <div className="stat-value">{stats.totalEquipmentRequests}</div>
          <div className="stat-label">Equipment Requests</div>
        </div>
        <div className="stat-item study">
          <div className="stat-value">{stats.totalProfessors}</div>
          <div className="stat-label">Total Professors</div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert type="danger" message={error} onClose={() => setError('')} />
      )}
      {successMessage && (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
      )}

      {loading && <LoadingSpinner />}

      {/* Pending Professor Approvals */}
      <div className="admin-card">
        <div className="card-header">
          <h3>Pending Professor Approvals</h3>
          <p className="card-subtitle">Review professor accounts with assigned courses</p>
        </div>
        <div className="card-body">
          {pendingProfessors.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-user-check"></i>
              <h4>No Pending Approvals</h4>
              <p>All professor applications have been processed.</p>
            </div>
          ) : (
            <div className="approval-list">
              {pendingProfessors.map(professor => (
                <ProfessorApprovalCard
                  key={professor.id}
                  professor={professor}
                  onApprove={() => handleApproveProfessor(professor.id)}
                  onReject={(reason) => handleRejectProfessor(professor.id, reason)}
                  processing={processing}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Escalated Equipment Requests */}
      <div className="admin-card">
        <div className="card-header">
          <h3>Escalated Equipment Requests</h3>
        </div>
        <div className="card-body">
          {escalatedRequests.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-exclamation-triangle"></i>
              <h4>No Escalated Requests</h4>
              <p>No equipment requests have been escalated for review.</p>
            </div>
          ) : (
            <div className="escalation-list">
              {escalatedRequests.map(request => (
                <EscalatedRequestCard
                  key={request.id}
                  request={request}
                  onApprove={() => handleReviewEscalation(request.id, true)}
                  onReject={(reason) => handleReviewEscalation(request.id, false, reason)}
                  processing={processing}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Equipment Requests Table Component */}
      <EquipmentRequestsTable
        equipmentRequests={hodEquipmentRequests}
        loading={loadingHodRequests}
        onRefresh={loadHodEquipmentRequests}
      />
    </div>
  );
};



// Professor Approval Card Component (Updated)
const ProfessorApprovalCard = ({ professor, onApprove, onReject, processing }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleReject = (reason) => {
    onReject(reason);
    setShowRejectModal(false);
  };

  const getCoursesData = () => {
    // Check if we have assignedCourses array (full course objects)
    if (professor.assignedCourses && Array.isArray(professor.assignedCourses)) {
      return professor.assignedCourses;
    }
    
    // Check if we have courseIds and courseNames arrays
    if (professor.courseIds && professor.courseNames && Array.isArray(professor.courseIds)) {
      return professor.courseIds.map((id, index) => ({
        id: id,
        courseCode: professor.courseCodes ? professor.courseCodes[index] : `Course-${id}`,
        courseName: professor.courseNames[index] || 'Unknown Course',
        creditHours: professor.creditHours ? professor.creditHours[index] : 3
      }));
    }
    
    return [];
  };

  const coursesData = getCoursesData();

  return (
    <>
      <div className="approval-card">
        <div className="approval-header">
          <div className="professor-info">
            <h4>{professor.fullName}</h4>
            <div className="professor-email">{professor.email}</div>
            {/* <div className="professor-id">Employee ID: {professor.identifier}</div> */}
          </div>
          <div className="approval-actions">
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
              onClick={() => setShowRejectModal(true)}
              disabled={processing}
            >
              <i className="fas fa-times"></i>
              Reject
            </button>
          </div>
        </div>

        {/* Show assigned courses */}
        {coursesData.length > 0 ? (
          <div className="assigned-courses">
            <strong>Assigned Courses ({coursesData.length}):</strong>
            <div className="course-list">
              {coursesData.map((course, index) => (
                <div key={index} className="course-item">
                  <span className="course-code">{course.courseCode}</span>
                  <span className="course-name">{course.courseName}</span>
                  <span className="course-credits">({course.creditHours} credits)</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-courses">
            <small className="text-muted">No courses assigned</small>
          </div>
        )}
      </div>

      <ProfessorRejectionModal
        show={showRejectModal}
        professor={professor}
        onClose={() => setShowRejectModal(false)}
        onSubmit={handleReject}
      />
    </>
  );
};

// Professor Rejection Modal Component
const ProfessorRejectionModal = ({ show, professor, onClose, onSubmit }) => {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    onSubmit(rejectionReason);
    setRejectionReason('');
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Reject Professor Account</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="professor-info">
              <p><strong>Professor:</strong> {professor?.fullName}</p>
              <p><strong>Email:</strong> {professor?.email}</p>
            </div>
            
            <div className="form-group">
              <label>Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="form-control"
                rows="4"
                placeholder="Provide reason for rejection (will be sent to admin for review)..."
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={!rejectionReason.trim()}>
              <i className="fas fa-times"></i>
              Reject Professor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Escalated Request Card Component (unchanged)
const EscalatedRequestCard = ({ request, onApprove, onReject, processing }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);

  return (
    <div className="escalation-card">
      <div className="escalation-header">
        <div className="request-info">
          <h4>{request.equipmentName}</h4>
          <div className="professor-name">Professor: {request.userFullName}</div>
          <div className="escalation-date">
            Escalated: {new Date(request.escalatedAt).toLocaleDateString()}
          </div>
        </div>
        <div className="escalation-actions">
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
            onClick={() => setShowRejectModal(true)}
            disabled={processing}
          >
            <i className="fas fa-times"></i>
            Reject
          </button>
        </div>
      </div>

      <div className="original-rejection">
        <strong>Original Rejection Reason:</strong> {request.rejectionReason}
      </div>

      {showRejectModal && (
        <HODRejectionModal
          show={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onSubmit={(reason) => {
            onReject(reason);
            setShowRejectModal(false);
          }}
        />
      )}
    </div>
  );
};

// HOD Rejection Modal Component (unchanged)
const HODRejectionModal = ({ show, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit(reason);
    setReason('');
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Final Rejection</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Final Rejection Reason *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="form-control"
                rows="4"
                placeholder="Provide final reason for rejecting this escalated request..."
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={!reason.trim()}>
              <i className="fas fa-times"></i>
              Final Reject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Equipment Requests Table Component (unchanged)
const EquipmentRequestsTable = ({ 
  equipmentRequests, 
  loading, 
  onRefresh 
}) => {
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [filters, setFilters] = useState({ keyword: '' });

  // Filter equipment requests
  const getFilteredEquipmentRequests = () => {
    if (!filters.keyword) return equipmentRequests;
    
    return equipmentRequests.filter(request => 
      request.equipmentName?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      request.userFullName?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      request.courseCode?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      request.reason?.toLowerCase().includes(filters.keyword.toLowerCase())
    );
  };

  // Selection functions
  const toggleRequestSelection = (requestId) => {
    setSelectedRequests(prev => {
      if (prev.includes(requestId)) {
        return prev.filter(id => id !== requestId);
      } else {
        return [...prev, requestId];
      }
    });
  };

  const selectAllRequests = () => {
    const filteredRequests = getFilteredEquipmentRequests();
    setSelectedRequests(filteredRequests.map(request => request.id));
  };

  const clearRequestSelection = () => {
    setSelectedRequests([]);
  };

  // Status badge helper
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

  const filteredRequests = getFilteredEquipmentRequests();

  return (
    <div className="admin-card">
      <div className="card-header">
        <h3>Current Month Equipment Requests</h3>
        <p className="card-subtitle">All equipment requests for the current month</p>
      </div>

      <div className="card-body">
        {/* Search Filters */}
        <div className="equipment-filters">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search by equipment, user, course, or reason..."
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
              className="form-control"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedRequests.length > 0 && (
          <div className="bulk-action-toolbar">
            <div className="bulk-info">
              <span className="selection-count">{selectedRequests.length} request(s) selected</span>
            </div>
            <div className="bulk-actions">
              <button 
                className="btn btn-sm btn-secondary"
                onClick={clearRequestSelection}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {/* Equipment Requests Table */}
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-calendar-alt"></i>
            <h3>No Requests Found</h3>
            <p>
              {filters.keyword 
                ? 'No equipment requests match your search criteria.' 
                : 'No equipment requests for the current month.'}
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
                      checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAllRequests();
                        } else {
                          clearRequestSelection();
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
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(request => (
                  <tr key={request.id} className={selectedRequests.includes(request.id) ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id)}
                        onChange={() => toggleRequestSelection(request.id)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HODDashboard;
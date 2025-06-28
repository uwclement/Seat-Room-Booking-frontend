import React, { useState, useEffect } from 'react';
import { 
  getPendingProfessorApprovals,
  approveProfessorAccount,
  approveProfessorCourses
} from '../../api/professor';
import { 
  getEscalatedRequests,
  hodReviewRequest
} from '../../api/equipmentRequests';
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
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProfessor = async (professorId) => {
    setProcessing(true);
    try {
      await approveProfessorAccount(professorId);
      setPendingProfessors(prev => prev.filter(p => p.id !== professorId));
      setSuccessMessage('Professor approved successfully');
    } catch (err) {
      setError('Failed to approve professor');
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
          <div className="stat-label">Pending Approvals</div>
        </div>
        <div className="stat-item disabled">
          <div className="stat-value">{stats.escalatedRequests}</div>
          <div className="stat-label">Escalated Requests</div>
        </div>
        <div className="stat-item available">
          <div className="stat-value">{stats.totalProfessors}</div>
          <div className="stat-label">Total Professors</div>
        </div>
        <div className="stat-item study">
          <div className="stat-value">{stats.escalationRate}%</div>
          <div className="stat-label">Escalation Rate</div>
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
    </div>
  );
};

// Professor Approval Card Component
const ProfessorApprovalCard = ({ professor, onApprove, processing }) => {
  return (
    <div className="approval-card">
      <div className="approval-header">
        <div className="professor-info">
          <h4>{professor.fullName}</h4>
          <div className="professor-email">{professor.email}</div>
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
        </div>
      </div>
      
      {professor.courseNames && professor.courseNames.length > 0 && (
        <div className="requested-courses">
          <strong>Requested Courses:</strong>
          <div className="course-tags">
            {professor.courseNames.map((courseName, index) => (
              <span key={index} className="course-tag">{courseName}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Escalated Request Card Component
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

// HOD Rejection Modal Component
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

export default HODDashboard;

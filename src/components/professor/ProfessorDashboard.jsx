import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfessor } from '../../context/ProfessorContext';
import { escalateRequest } from '../../api/equipmentRequests';
import Alert from '../common/Alert';
import LoadingSpinner from '../common/LoadingSpinner';
import { escalateLabRequest } from '../../api/labRequests';

const ProfessorDashboard = () => {
  const {
    myRequests,
    myCourses,
    myLabRequests,
    dashboardData,
    loadingDashboard,
    error,
    successMessage,
    showSuccess,
    showError,
    clearMessages,
    updateRequestInState
  } = useProfessor();

  const [processing, setProcessing] = useState(false);

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

  const getQuickStats = () => {
    return {
      totalRequests: myRequests.length,
      totalLabRequests: myLabRequests.length,
      pendingRequests: myRequests.filter(req => req.status === 'PENDING').length,
      approvedRequests: myRequests.filter(req => 
        req.status === 'APPROVED' || req.status === 'HOD_APPROVED'
      ).length,
      rejectedRequests: myRequests.filter(req => 
        req.status === 'REJECTED' || req.status === 'HOD_REJECTED'
      ).length,
      escalatableRequests: myRequests.filter(req => 
        req.status === 'REJECTED' && !req.escalatedToHod
      ).length,
      approvedCourses: Array.isArray(myCourses) ? myCourses.length : 0
    };
  };

  const stats = getQuickStats();

  if (loadingDashboard) {
    return (
      <div className="professor-dashboard">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="professor-dashboard">
      {/* Header Section */}
      <div className="professor-header">
        <div className="professor-header-content">
          <div>
            <h1 className="professor-title">Professor Dashboard</h1>
            <p className="professor-subtitle">
              Manage your academic resources and equipment requests
            </p>
          </div>
          <div className="professor-quick-actions">
            <Link to="/professor/my-courses" className="professor-btn secondary">
              <i className="fas fa-graduation-cap"></i>
              My Courses
            </Link>
            <Link to="/professor/request-equipment" className="professor-btn primary">
              <i className="fas fa-plus"></i>
              New Request
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <Alert type="danger" message={error} onClose={clearMessages} />
        </div>
      )}

      {successMessage && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <Alert type="success" message={successMessage} onClose={clearMessages} />
        </div>
      )}

      {/* Escalation Notice */}
      {/* {stats.escalatableRequests > 0 && (
        <div className="escalation-alert">
          <div className="escalation-alert-content">
            <i className="fas fa-exclamation-triangle"></i>
            <span>
              You have {stats.escalatableRequests} rejected request(s) that can be escalated to HOD
            </span>
          </div>
        </div>
      )} */}

      {/* Quick Stats */}
      <div className="professor-stats-grid">
        <div className="professor-stat-card">
          <div className="professor-stat-icon">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="professor-stat-value">{stats.totalRequests}</div>
          <div className="professor-stat-label">Total Requests</div>
        </div>
        <div className="professor-stat-card">
          <div className="professor-stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="professor-stat-value">{stats.pendingRequests}</div>
          <div className="professor-stat-label">Pending</div>
        </div>
        <div className="professor-stat-card">
          <div className="professor-stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="professor-stat-value">{stats.approvedRequests}</div>
          <div className="professor-stat-label">Approved</div>
        </div>
        <div className="professor-stat-card">
          <div className="professor-stat-icon">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div className="professor-stat-value">{stats.approvedCourses}</div>
          <div className="professor-stat-label">My Courses</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="professor-content-grid">
        {/* Quick Actions Card */}
        <div className="professor-content-card">
          <div className="professor-card-header">
            <h3 className="professor-card-title">
              <i className="fas fa-bolt"></i>
              Quick Actions
            </h3>
          </div>
          <div className="professor-card-body">
            <div className="quick-actions-grid">
              <Link to="/professor/request-equipment" className="quick-action-btn">
                <i className="fas fa-tools"></i>
                Request Equipment
              </Link>
              <Link to="/professor/request-courses" className="quick-action-btn secondary">
                <i className="fas fa-book"></i>
                Request Courses
              </Link>
              <Link to="/professor/request-lab" className="quick-action-btn">
                <i className="fas fa-flask"></i>
                Request Lab Class
             </Link>
              <Link to="/professor/my-requests" className="quick-action-btn secondary">
                <i className="fas fa-list"></i>
                View All Requests
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Equipment Requests */}
        <div className="professor-content-card">
          <div className="professor-card-header">
            <h3 className="professor-card-title">
              <i className="fas fa-history"></i>
              Recent Equipment Requests
            </h3>
          </div>
          <div className="professor-card-body">
            {myRequests.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-clipboard-list"></i>
                <h4>No Equipment Requests</h4>
                <p>Create your first equipment request to get started.</p>
                <Link to="/professor/request-equipment" className="professor-btn primary">
                  <i className="fas fa-plus"></i>
                  Create Request
                </Link>
              </div>
            ) : (
              <>
                <div className="recent-requests">
                  {myRequests.slice(0, 5).map(request => (
                    <ProfessorRequestCard
                      key={request.id}
                      request={request}
                      onEscalate={() => handleEscalate(request.id)}
                      canEscalate={request.status === 'REJECTED' && !request.escalatedToHod}
                      processing={processing}
                    />
                  ))}
                </div>
                {myRequests.length > 5 && (
                  <div className="view-all-link">
                    <Link to="/professor/my-requests">
                      <span>View All Requests</span>
                      <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* My Courses Section */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        <div className="professor-content-card">
          <div className="professor-card-header">
            <h3 className="professor-card-title">
              <i className="fas fa-graduation-cap"></i>
              My Approved Courses
            </h3>
          </div>
          <div className="professor-card-body">
            {!Array.isArray(myCourses) || myCourses.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-book"></i>
                <h4>No Approved Courses</h4>
                <p>Contact your HOD to get course approvals.</p>
                <Link to="/professor/request-courses" className="professor-btn primary">
                  <i className="fas fa-plus"></i>
                  Request Course Approval
                </Link>
              </div>
            ) : (
              <div className="course-grid">
                {myCourses.map(course => (
                  <div key={course.id} className="course-card">
                    <div className="course-code">{course.courseCode}</div>
                    <div className="course-name">{course.courseName}</div>
                    <div className="course-credits">{course.creditHours} credits</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Professor Request Card Component
const ProfessorRequestCard = ({ request, onEscalate, canEscalate, processing }) => {
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="request-item">
      <div className="request-header">
        <div className="request-info">
          <div className="equipment-name">{request.equipmentName}</div>
          <div className="request-meta">
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
          {formatDate(request.startTime)} - {formatDate(request.endTime)}
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
            <strong>Suggestion:</strong> {request.adminSuggestion}
          </div>
        )}

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

        {request.escalatedToHod && (
          <div className="escalation-notice">
            <i className="fas fa-info-circle"></i>
            This request has been escalated to the HOD
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorDashboard;
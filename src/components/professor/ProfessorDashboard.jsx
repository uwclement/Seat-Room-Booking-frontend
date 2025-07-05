import React, { useState } from 'react';
import { useProfessor } from '../../context/ProfessorContext';
import { escalateRequest } from '../../api/equipmentRequests';
import Alert from '../common/Alert';
import LoadingSpinner from '../common/LoadingSpinner';
import EquipmentRequestForm from './EquipmentRequestForm';
import CourseSelectionForm from './CourseSelectionForm';

const ProfessorDashboard = () => {
  const {
    myRequests,
    myCourses,
    dashboardData,
    loadingDashboard,
    error,
    successMessage,
    getFilteredRequests,
    showSuccess,
    showError,
    clearMessages,
    updateRequestInState
  } = useProfessor();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false); 
  const [processing, setProcessing] = useState(false);

  console.log('myCourses:', myCourses);
  console.log('myCourses type:', typeof myCourses);
  console.log('Is array:', Array.isArray(myCourses));

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
      approvedCourses: myCourses.length
    };
  };

  const stats = getQuickStats();

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>Professor Dashboard</h1>
            <p className="admin-subtitle">
              Manage your equipment requests and course assignments
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowCourseModal(true)}
            >
              <i className="fas fa-book"></i>
              Request Courses
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowRequestModal(true)}
            >
              <i className="fas fa-plus"></i>
              New Request
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-item available">
          <div className="stat-value">{stats.totalRequests}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="stat-item maintenance">
          <div className="stat-value">{stats.pendingRequests}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-item library">
          <div className="stat-value">{stats.approvedRequests}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-item disabled">
          <div className="stat-value">{stats.rejectedRequests}</div>
          <div className="stat-label">Rejected</div>
        </div>
        <div className="stat-item study">
          <div className="stat-value">{stats.approvedCourses}</div>
          <div className="stat-label">My Courses</div>
        </div>
      </div>


      

      {/* Alerts */}
      {error && (
        <Alert type="danger" message={error} onClose={clearMessages} />
      )}

      {successMessage && (
        <Alert type="success" message={successMessage} onClose={clearMessages} />
      )}

      {/* Escalation Notice */}
      {stats.escalatableRequests > 0 && (
        <Alert 
          type="warning" 
          message={`You have ${stats.escalatableRequests} rejected request(s) that can be escalated to HOD`}
        />
      )}

      {loadingDashboard && <LoadingSpinner />}

      {/* My Courses */}
      <div className="admin-card">
        <div className="card-header">
          <h3>My Approved Courses</h3>
        </div>
        <div className="card-body">
          {myCourses.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-book"></i>
              <h4>No Approved Courses</h4>
              <p>Contact your HOD to get course approvals.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCourseModal(true)}
              >
                <i className="fas fa-plus"></i>
                Request Course Approval
              </button>
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

      {/* Recent Requests */}
      <div className="admin-card">
        <div className="card-header">
          <h3>Recent Equipment Requests</h3>
        </div>
        <div className="card-body">
          {myRequests.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-clipboard-list"></i>
              <h4>No Equipment Requests</h4>
              <p>Create your first equipment request to get started.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowRequestModal(true)}
              >
                <i className="fas fa-plus"></i>
                Create Request
              </button>
            </div>
          ) : (
            <div className="request-list">
              {myRequests.slice(0, 10).map(request => (
                <ProfessorRequestCard
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

      {/* Equipment Request Modal */}
      {showRequestModal && (
        <EquipmentRequestForm 
          show={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSuccess={(message) => {
            showSuccess(message);
            setShowRequestModal(false);
          }}
        />
      )}

      {/* Course Selection Modal */}
      {showCourseModal && (
        <CourseSelectionForm 
          show={showCourseModal}
          onClose={() => setShowCourseModal(false)}
          onSuccess={(message) => {
            showSuccess(message);
            setShowCourseModal(false);
          }}
        />
      )}
    </div>
  );
};

// Professor Request Card Component
const ProfessorRequestCard = ({ request, onEscalate, canEscalate, processing }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'HOD_APPROVED':
        return 'green';
      case 'REJECTED':
      case 'HOD_REJECTED':
        return 'red';
      case 'ESCALATED':
        return 'orange';
      default:
        return 'blue';
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
    <div className="request-card professor-request">
      <div className="request-header">
        <div className="request-basic-info">
          <h4>{request.equipmentName}</h4>
          <div className="request-meta">
            {request.courseCode && (
              <span className="course-badge">{request.courseCode}</span>
            )}
            <span className="request-date">{formatDate(request.createdAt)}</span>
          </div>
        </div>
        <div className="request-status">
          <span className={`status-badge ${getStatusColor(request.status)}`}>
            {request.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="request-details">
        <div className="request-timing">
          <i className="fas fa-calendar"></i>
          {formatDate(request.startTime)} - {formatDate(request.endTime)}
        </div>
        
        {request.rejectionReason && (
          <div className="rejection-reason">
            <strong>Rejection Reason:</strong> {request.rejectionReason}
          </div>
        )}

        {request.adminSuggestion && (
          <div className="admin-suggestion">
            <strong>Suggestion:</strong> {request.adminSuggestion}
          </div>
        )}

        {canEscalate && (
          <div className="request-actions">
            <button 
              className="btn btn-warning btn-sm"
              onClick={onEscalate}
              disabled={processing}
            >
              <i className="fas fa-arrow-up"></i>
              Escalate to HOD
            </button>
          </div>
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
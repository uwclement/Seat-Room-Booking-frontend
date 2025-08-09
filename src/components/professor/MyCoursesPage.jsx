import React from 'react';
import { Link } from 'react-router-dom';
import { useProfessor } from '../../context/ProfessorContext';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyCoursesPage = () => {
  const {
    myCourses,
    loadingDashboard,
    error,
    successMessage,
    clearMessages
  } = useProfessor();

  if (loadingDashboard) {
    return (
      <div className="professor-dashboard">
        <LoadingSpinner />
      </div>
    );
  }

  const getTotalCredits = () => {
    if (!Array.isArray(myCourses)) return 0;
    return myCourses.reduce((total, course) => total + (course.creditHours || 0), 0);
  };

  const groupCoursesByDepartment = () => {
    if (!Array.isArray(myCourses)) return {};
    
    return myCourses.reduce((groups, course) => {
      const dept = course.department || 'Other';
      if (!groups[dept]) {
        groups[dept] = [];
      }
      groups[dept].push(course);
      return groups;
    }, {});
  };

  const courseGroups = groupCoursesByDepartment();

  return (
    <div className="professor-dashboard">
      {/* Header */}
      <div className="professor-header">
        <div className="professor-header-content">
          <div>
            <h1 className="professor-title">My Approved Courses</h1>
            <p className="professor-subtitle">
              View and manage your approved teaching assignments
            </p>
          </div>
          <div className="professor-quick-actions">
            <Link to="/professor/dashboard" className="professor-btn secondary">
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
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

        {/* Course Summary */}
        <div className="professor-content-card">
          <div className="professor-card-header">
            <h3 className="professor-card-title">
              <i className="fas fa-chart-bar"></i>
              Course Summary
            </h3>
          </div>
          <div className="professor-card-body">
            <div className="course-summary-stats">
              <div className="summary-stat-item">
                <div className="stat-icon">
                  <i className="fas fa-book"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{Array.isArray(myCourses) ? myCourses.length : 0}</div>
                  <div className="stat-label">Total Courses</div>
                </div>
              </div>
              
              <div className="summary-stat-item">
                <div className="stat-icon">
                  <i className="fas fa-star"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{getTotalCredits()}</div>
                  <div className="stat-label">Total Credit Hours</div>
                </div>
              </div>
              
              <div className="summary-stat-item">
                <div className="stat-icon">
                  <i className="fas fa-building"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{Object.keys(courseGroups).length}</div>
                  <div className="stat-label">Departments</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses by Department */}
        {!Array.isArray(myCourses) || myCourses.length === 0 ? (
          <div className="professor-content-card">
            <div className="professor-card-body">
              <div className="empty-state">
                <i className="fas fa-graduation-cap"></i>
                <h4>No Approved Courses</h4>
                <p>You don't have any approved courses yet. Request course approvals from your HOD to get started.</p>
                <Link to="/professor/request-courses" className="professor-btn primary">
                  <i className="fas fa-plus"></i>
                  Request Course Approval
                </Link>
              </div>
            </div>
          </div>
        ) : (
          Object.entries(courseGroups).map(([department, courses]) => (
            <div key={department} className="professor-content-card">
              <div className="professor-card-header">
                <h3 className="professor-card-title">
                  <i className="fas fa-building"></i>
                  {department} ({courses.length} courses)
                </h3>
              </div>
              <div className="professor-card-body">
                <div className="courses-grid">
                  {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course }) => {
  return (
    <div className="detailed-course-card">
      <div className="course-card-header">
        <div className="course-code-badge">{course.courseCode}</div>
        <div className="course-credits-badge">{course.creditHours} credits</div>
      </div>
      
      <div className="course-card-body">
        <h4 className="course-title">{course.courseName}</h4>
        
        {course.description && (
          <p className="course-description">{course.description}</p>
        )}
        
        <div className="course-details">
          {course.semester && (
            <div className="course-detail-item">
              <i className="fas fa-calendar-alt"></i>
              <span>Semester: {course.semester}</span>
            </div>
          )}
          
          {course.level && (
            <div className="course-detail-item">
              <i className="fas fa-layer-group"></i>
              <span>Level: {course.level}</span>
            </div>
          )}
          
          {course.approvalDate && (
            <div className="course-detail-item">
              <i className="fas fa-check-circle"></i>
              <span>Approved: {new Date(course.approvalDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default MyCoursesPage;
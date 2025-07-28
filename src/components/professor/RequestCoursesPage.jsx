import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getActiveCourses,
  requestCourseApproval 
} from '../../api/professor';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RequestCoursesPage = () => {
  const navigate = useNavigate();
  
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByDepartment, setFilterByDepartment] = useState('');

  useEffect(() => {
    loadAvailableCourses();
  }, []);

  const loadAvailableCourses = async () => {
    setLoading(true);
    try {
      const courses = await getActiveCourses();
      setAvailableCourses(courses);
    } catch (err) {
      setError('Failed to load available courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSelectAll = () => {
    const filteredCourseIds = getFilteredCourses().map(course => course.id);
    setSelectedCourses(prev => {
      const newSelected = [...new Set([...prev, ...filteredCourseIds])];
      return newSelected;
    });
  };

  const handleDeselectAll = () => {
    const filteredCourseIds = getFilteredCourses().map(course => course.id);
    setSelectedCourses(prev => prev.filter(id => !filteredCourseIds.includes(id)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedCourses.length === 0) {
      setError('Please select at least one course');
      return;
    }

    setSubmitting(true);
    try {
      await requestCourseApproval({ courseIds: selectedCourses });
      navigate('/professor/dashboard', { 
        state: { message: 'Course approval request submitted successfully' } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit course request');
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredCourses = () => {
    return availableCourses.filter(course => {
      const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !filterByDepartment || course.department === filterByDepartment;
      return matchesSearch && matchesDepartment;
    });
  };

  const getDepartments = () => {
    const departments = [...new Set(availableCourses.map(course => course.department))];
    return departments.filter(Boolean);
  };

  const filteredCourses = getFilteredCourses();

  if (loading) {
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
            <h1 className="professor-title">Request Course Approval</h1>
            <p className="professor-subtitle">
              Select courses you would like to teach and submit for HOD approval
            </p>
          </div>
          <div className="professor-quick-actions">
            <button 
              onClick={() => navigate('/professor/dashboard')}
              className="professor-btn secondary"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        {error && (
          <Alert type="danger" message={error} onClose={() => setError('')} />
        )}

        <form onSubmit={handleSubmit}>
          {/* Filters and Search */}
          <div className="professor-content-card">
            <div className="professor-card-header">
              <h3 className="professor-card-title">
                <i className="fas fa-filter"></i>
                Filter Courses
              </h3>
            </div>
            <div className="professor-card-body">
              <div className="course-filters">
                <div className="filter-grid">
                  <div className="form-group">
                    <label>Search Courses</label>
                    <input
                      type="text"
                      placeholder="Search by course name or code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-control search-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Department</label>
                    <select
                      value={filterByDepartment}
                      onChange={(e) => setFilterByDepartment(e.target.value)}
                      className="form-control"
                    >
                      <option value="">All Departments</option>
                      {getDepartments().map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="selection-tools">
                  <div className="selection-count">
                    {selectedCourses.length} of {filteredCourses.length} courses selected
                  </div>
                  <div className="bulk-actions">
                    <button 
                      type="button"
                      onClick={handleSelectAll}
                      className="professor-btn secondary small"
                    >
                      Select All Filtered
                    </button>
                    <button 
                      type="button"
                      onClick={handleDeselectAll}
                      className="professor-btn secondary small"
                    >
                      Deselect All Filtered
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Available Courses */}
          <div className="professor-content-card">
            <div className="professor-card-header">
              <h3 className="professor-card-title">
                <i className="fas fa-graduation-cap"></i>
                Available Courses ({filteredCourses.length})
              </h3>
            </div>
            <div className="professor-card-body">
              {filteredCourses.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-search"></i>
                  <h4>No Courses Found</h4>
                  <p>Try adjusting your search criteria or filters.</p>
                </div>
              ) : (
                <div className="course-selection-grid">
                  {filteredCourses.map(course => (
                    <div 
                      key={course.id} 
                      className={`course-selection-card ${
                        selectedCourses.includes(course.id) ? 'selected' : ''
                      }`}
                      onClick={() => handleCourseToggle(course.id)}
                    >
                      <div className="course-selection-header">
                        <div className="course-selection-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(course.id)}
                            onChange={() => handleCourseToggle(course.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="course-selection-info">
                          <div className="course-header-row">
                            <span className="course-code">{course.courseCode}</span>
                            <span className="course-credits">{course.creditHours} credits</span>
                          </div>
                          <div className="course-name">{course.courseName}</div>
                          {course.department && (
                            <div className="course-department">{course.department}</div>
                          )}
                        </div>
                      </div>
                      
                      {course.description && (
                        <div className="course-description">
                          {course.description}
                        </div>
                      )}
                      
                      {selectedCourses.includes(course.id) && (
                        <div className="selection-indicator">
                          <i className="fas fa-check-circle"></i>
                          <span>Selected</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Courses Summary */}
          {selectedCourses.length > 0 && (
            <div className="professor-content-card">
              <div className="professor-card-header">
                <h3 className="professor-card-title">
                  <i className="fas fa-check-double"></i>
                  Selected Courses ({selectedCourses.length})
                </h3>
              </div>
              <div className="professor-card-body">
                <div className="selected-courses-summary">
                  <div className="selected-courses-list">
                    {selectedCourses.map(courseId => {
                      const course = availableCourses.find(c => c.id === courseId);
                      return course ? (
                        <div key={courseId} className="selected-course-item">
                          <div className="selected-course-info">
                            <span className="course-code">{course.courseCode}</span>
                            <span className="course-name">{course.courseName}</span>
                            <span className="course-credits">{course.creditHours} credits</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleCourseToggle(courseId)}
                            className="remove-course-btn"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                  
                  <div className="selection-summary-stats">
                    <div className="summary-stat">
                      <strong>Total Courses:</strong> {selectedCourses.length}
                    </div>
                    <div className="summary-stat">
                      <strong>Total Credits:</strong> {
                        selectedCourses.reduce((total, courseId) => {
                          const course = availableCourses.find(c => c.id === courseId);
                          return total + (course ? course.creditHours : 0);
                        }, 0)
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Section */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/professor/dashboard')}
              className="professor-btn secondary"
            >
              <i className="fas fa-times"></i>
              Cancel
            </button>
            <button 
              type="submit" 
              className="professor-btn primary"
              disabled={submitting || selectedCourses.length === 0}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Submitting Request...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Submit for Approval ({selectedCourses.length} courses)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestCoursesPage;
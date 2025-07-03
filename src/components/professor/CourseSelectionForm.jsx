import React, { useState, useEffect } from 'react';
import { 
  getActiveCourses,
  requestCourseApproval 
} from '../../api/professor';
import Alert from '../common/Alert';
import LoadingSpinner from '../common/LoadingSpinner';

const CourseSelectionForm = ({ show, onClose, onSuccess }) => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      loadAvailableCourses();
    }
  }, [show]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedCourses.length === 0) {
      setError('Please select at least one course');
      return;
    }

    setSubmitting(true);
    try {
      await requestCourseApproval({ courseIds: selectedCourses });
      onSuccess('Course approval request submitted successfully');
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit course request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCourses([]);
    setError('');
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container large-modal">
        <div className="modal-header">
          <h3>Select Courses to Teach</h3>
          <button className="close-button" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {loading ? (
          <div className="modal-body">
            <LoadingSpinner />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <Alert type="danger" message={error} onClose={() => setError('')} />
              )}

              <div className="form-section">
                <h4>Available Courses</h4>
                <p className="form-help">
                  Select the courses you would like to teach. Your selection will be sent to the HOD for approval.
                </p>
                
                {availableCourses.length === 0 ? (
                  <div className="no-courses">
                    <i className="fas fa-book"></i>
                    <p>No courses available for selection.</p>
                  </div>
                ) : (
                  <div className="course-selection-grid">
                    {availableCourses.map(course => (
                      <div 
                        key={course.id} 
                        className={`course-selection-item ${selectedCourses.includes(course.id) ? 'selected' : ''}`}
                      >
                        <label className="course-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(course.id)}
                            onChange={() => handleCourseToggle(course.id)}
                          />
                          <div className="course-info">
                            <div className="course-header">
                              <span className="course-code">{course.courseCode}</span>
                              <span className="course-credits">{course.creditHours} credits</span>
                            </div>
                            <div className="course-name">{course.courseName}</div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedCourses.length > 0 && (
                <div className="selection-summary">
                  <h5>Selected Courses ({selectedCourses.length})</h5>
                  <div className="selected-course-list">
                    {selectedCourses.map(courseId => {
                      const course = availableCourses.find(c => c.id === courseId);
                      return course ? (
                        <div key={courseId} className="selected-course-item">
                          <span className="course-code">{course.courseCode}</span>
                          <span className="course-name">{course.courseName}</span>
                          <button 
                            type="button"
                            onClick={() => handleCourseToggle(courseId)}
                            className="remove-course"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
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
                    Submit for Approval
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CourseSelectionForm;
import React, { useState, useEffect } from 'react';
import { useEquipmentAdmin } from '../../../context/EquipmentAdminContext';
import {
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
  searchCourses
} from '../../../api/equipmentAdmin';
import Alert from '../../common/Alert';
import LoadingSpinner from '../../common/LoadingSpinner';
import ToastNotification from '../../common/ToastNotification';

const CourseManagement = () => {
  const {
    courses,
    loadingCourses,
    filters,
    selectedItems,
    error,
    successMessage,
    updateFilters,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    updateItemInState,
    removeItemFromState,
    showSuccess,
    showError,
    clearMessages,
    loadCourses: refreshCourses
  } = useEquipmentAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Filter courses based on search
  const getFilteredCourses = () => {
    if (!filters.keyword) return courses;
    
    return courses.filter(course => 
      course.courseCode.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      course.courseName.toLowerCase().includes(filters.keyword.toLowerCase())
    );
  };

  const filteredCourses = getFilteredCourses();

  const handleCreate = async (courseData) => {
    setProcessing(true);
    try {
      const newCourse = await createCourse(courseData);
      await refreshCourses();
      showSuccess('Course created successfully');
      setShowCreateModal(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdate = async (courseData) => {
    if (!selectedCourse) return;
    
    setProcessing(true);
    try {
      const updatedCourse = await updateCourse(selectedCourse.id, courseData);
      updateItemInState(selectedCourse.id, updatedCourse, 'courses');
      showSuccess('Course updated successfully');
      setShowEditModal(false);
      setSelectedCourse(null);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id, courseName) => {
    if (window.confirm(`Are you sure you want to delete "${courseName}"?`)) {
      setProcessing(true);
      try {
        await deleteCourse(id);
        removeItemFromState(id, 'courses');
        showSuccess('Course deleted successfully');
      } catch (err) {
        showError(err.response?.data?.message || 'Failed to delete course');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    setProcessing(true);
    try {
      const updatedCourse = await toggleCourseStatus(id);
      updateItemInState(id, updatedCourse, 'courses');
      showSuccess('Course status updated successfully');
    } catch (err) {
      showError('Failed to update course status');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      showError('Please select courses to perform bulk action');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${action} ${selectedItems.length} course(s)?`)) {
      return;
    }

    setProcessing(true);
    try {
      for (const courseId of selectedItems) {
        if (action === 'delete') {
          await deleteCourse(courseId);
        } else if (action === 'toggle') {
          await toggleCourseStatus(courseId);
        }
      }
      
      await refreshCourses();
      clearSelection();
      showSuccess(`Bulk ${action} completed successfully`);
    } catch (err) {
      showError(`Failed to perform bulk ${action}`);
    } finally {
      setProcessing(false);
    }
  };

  const getCourseStats = () => {
    return {
      total: courses.length,
      active: courses.filter(course => course.active).length,
      inactive: courses.filter(course => !course.active).length,
      withProfessors: courses.filter(course => course.professorCount > 0).length
    };
  };

  const stats = getCourseStats();

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>Course Management</h1>
            <p className="admin-subtitle">
              Manage academic courses and professor assignments
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
            disabled={processing}
          >
            <i className="fas fa-plus"></i>
            Add Course
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-item available">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Courses</div>
        </div>
        <div className="stat-item library">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-item disabled">
          <div className="stat-value">{stats.inactive}</div>
          <div className="stat-label">Inactive</div>
        </div>
        <div className="stat-item study">
          <div className="stat-value">{stats.withProfessors}</div>
          <div className="stat-label">With Professors</div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert
          type="danger"
          message={error}
          onClose={clearMessages}
        />
      )}

      {successMessage && (
        <ToastNotification
          type="success"
          message={successMessage}
          onClose={clearMessages}
        />
      )}

      {/* Search and Filters */}
      <div className="admin-card">
        <div className="card-body">
          <div className="course-filters">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search courses by code or name..."
                value={filters.keyword}
                onChange={(e) => updateFilters({ keyword: e.target.value })}
                className="form-control"
              />
              <i className="fas fa-search search-icon"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bulk-action-toolbar">
          <div className="bulk-info">
            <span className="selection-count">{selectedItems.length} course(s) selected</span>
          </div>
          <div className="bulk-actions">
            <button 
              className="btn btn-sm btn-secondary"
              onClick={clearSelection}
            >
              Clear Selection
            </button>
            <button 
              className="btn btn-sm btn-warning"
              onClick={() => handleBulkAction('toggle')}
              disabled={processing}
            >
              Toggle Status
            </button>
            <button 
              className="btn btn-sm btn-danger"
              onClick={() => handleBulkAction('delete')}
              disabled={processing}
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {loadingCourses && <LoadingSpinner />}

      {/* Courses Table */}
      <div className="admin-card">
        <div className="card-body">
          {filteredCourses.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-book"></i>
              <h3>No Courses Found</h3>
              <p>
                {filters.keyword 
                  ? 'No courses match your search criteria.' 
                  : 'No courses available. Create your first course.'}
              </p>
              {!filters.keyword && (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <i className="fas fa-plus"></i>
                  Create First Course
                </button>
              )}
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredCourses.length && filteredCourses.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            selectAllItems();
                          } else {
                            clearSelection();
                          }
                        }}
                      />
                    </th>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credit Hours</th>
                    <th>Professors</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map(course => (
                    <tr key={course.id} className={selectedItems.includes(course.id) ? 'selected' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(course.id)}
                          onChange={() => toggleItemSelection(course.id)}
                        />
                      </td>
                      <td>
                        <strong className="course-code">{course.courseCode}</strong>
                      </td>
                      <td>
                        <div className="course-name">{course.courseName}</div>
                      </td>
                      <td>
                        <span className="credit-hours">{course.creditHours}</span>
                      </td>
                      <td>
                        <span className="professor-count">
                          {course.professorCount} professor{course.professorCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${course.active ? 'green' : 'red'}`}>
                          <span className="status-dot"></span>
                          {course.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowEditModal(true);
                            }}
                            disabled={processing}
                            title="Edit Course"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className={`btn btn-sm ${course.active ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleStatus(course.id)}
                            disabled={processing}
                            title={course.active ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`fas ${course.active ? 'fa-pause' : 'fa-play'}`}></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(course.id, course.courseName)}
                            disabled={processing}
                            title="Delete Course"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Course Form Modals */}
      <CourseFormModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        title="Create Course"
        loading={processing}
      />

      <CourseFormModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCourse(null);
        }}
        onSubmit={handleUpdate}
        course={selectedCourse}
        title="Edit Course"
        loading={processing}
      />
    </div>
  );
};

// Course Form Modal Component
const CourseFormModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  course = null, 
  title = "Create Course",
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    creditHours: 3
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (course) {
      setFormData({
        courseCode: course.courseCode || '',
        courseName: course.courseName || '',
        creditHours: course.creditHours || 3
      });
    } else {
      setFormData({
        courseCode: '',
        courseName: '',
        creditHours: 3
      });
    }
    setErrors({});
  }, [course, show]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required';
    } else if (formData.courseCode.length > 20) {
      newErrors.courseCode = 'Course code must be 20 characters or less';
    }

    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    } else if (formData.courseName.length > 100) {
      newErrors.courseName = 'Course name must be 100 characters or less';
    }

    if (formData.creditHours < 1 || formData.creditHours > 10) {
      newErrors.creditHours = 'Credit hours must be between 1 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Course Code *</label>
              <input
                type="text"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                className={`form-control ${errors.courseCode ? 'error' : ''}`}
                placeholder="e.g., CS101"
                maxLength="20"
              />
              {errors.courseCode && <div className="error-message">{errors.courseCode}</div>}
            </div>

            <div className="form-group">
              <label>Course Name *</label>
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                className={`form-control ${errors.courseName ? 'error' : ''}`}
                placeholder="e.g., Introduction to Computer Science"
                maxLength="100"
              />
              {errors.courseName && <div className="error-message">{errors.courseName}</div>}
            </div>

            <div className="form-group">
              <label>Credit Hours *</label>
              <input
                type="number"
                name="creditHours"
                value={formData.creditHours}
                onChange={handleChange}
                className={`form-control ${errors.creditHours ? 'error' : ''}`}
                min="1"
                max="10"
              />
              {errors.creditHours && <div className="error-message">{errors.creditHours}</div>}
              <small className="form-text">Credit hours (1-10)</small>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {course ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <i className={`fas ${course ? 'fa-save' : 'fa-plus'}`}></i>
                  {course ? 'Update Course' : 'Create Course'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseManagement;
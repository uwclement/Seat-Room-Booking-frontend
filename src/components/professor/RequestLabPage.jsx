import React, { useState, useEffect } from 'react';
import { useProfessor } from '../../context/ProfessorContext';
import { Link } from 'react-router-dom';
import { getAllLabClasses } from '../../api/equipmentAdmin';
import { createLabRequest } from '../../api/labRequests';
import Alert from '../common/Alert';
import LoadingSpinner from '../common/LoadingSpinner';

const RequestLabPage = () => {
  const {
    myCourses,
    error,
    successMessage,
    showSuccess,
    showError,
    clearMessages
  } = useProfessor();

  const [labClasses, setLabClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    labClassId: '',
    courseId: '',
    reason: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    loadLabClasses();
  }, []);

  const loadLabClasses = async () => {
    try {
      const data = await getAllLabClasses();
      setLabClasses(data.filter(lab => lab.available));
    } catch (err) {
      showError('Failed to load lab classes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    // Validation
    if (!formData.labClassId || !formData.courseId || !formData.reason || 
        !formData.startTime || !formData.endTime) {
      showError('Please fill in all required fields');
      return;
    }

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    
    if (startTime >= endTime) {
      showError('End time must be after start time');
      return;
    }

    if (startTime <= new Date()) {
      showError('Start time must be in the future');
      return;
    }

    setSubmitting(true);
    try {
      await createLabRequest({
        labClassId: parseInt(formData.labClassId),
        courseId: parseInt(formData.courseId),
        reason: formData.reason,
        startTime: formData.startTime,
        endTime: formData.endTime
      });

      showSuccess('Lab request submitted successfully');
      
      // Reset form
      setFormData({
        labClassId: '',
        courseId: '',
        reason: '',
        startTime: '',
        endTime: ''
      });

    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit lab request');
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedLab = () => {
    return labClasses.find(lab => lab.id === parseInt(formData.labClassId));
  };

  if (loading) {
    return (
      <div className="professor-page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="professor-page">

       <div className="professor-header">
                <div>
                  <h1 className="professor-title">Request Lab Class</h1>
                </div>
                <div className="professor-quick-actions">
                  <Link to="/professor/my-lab-requests" className="professor-btn secondary">
                                <i className="fas fa-arrow-left"></i>
                                Back
                </Link>
                </div>
              </div>

      {/* Alerts */}
      {error && (
        <Alert type="danger" message={error} onClose={clearMessages} />
      )}
      {successMessage && (
        <Alert type="success" message={successMessage} onClose={clearMessages} />
      )}

      <div className="professor-form-container">
        <div className="professor-form-card">
          <div className="professor-form-header">
            <h3>Lab Class Request Form</h3>
            <p>Complete the form below to request access to a lab class</p>
          </div>

          <form onSubmit={handleSubmit} className="professor-form">
            {/* Lab Class Selection */}
            <div className="form-group">
              <label htmlFor="labClassId">Lab Class *</label>
              <select
                id="labClassId"
                name="labClassId"
                value={formData.labClassId}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="">Select a lab class</option>
                {labClasses.map(lab => (
                  <option key={lab.id} value={lab.id}>
                    {lab.labNumber} - {lab.name} ({lab.building}, Floor {lab.floor})
                  </option>
                ))}
              </select>
            </div>

            {/* Course Selection */}
            <div className="form-group">
              <label htmlFor="courseId">Course *</label>
              <select
                id="courseId"
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="">Select your course</option>
                {Array.isArray(myCourses) && myCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
              {(!Array.isArray(myCourses) || myCourses.length === 0) && (
                <small className="form-text text-muted">
                  No approved courses found. Please request course approval first.
                </small>
              )}
            </div>

            {/* Time Selection */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">Start Time *</label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="form-control"
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endTime">End Time *</label>
                <input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="form-control"
                  min={formData.startTime}
                  required
                />
              </div>
            </div>

            {/* Reason */}
            <div className="form-group">
              <label htmlFor="reason">Reason for Lab Request *</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="form-control"
                rows="4"
                placeholder="Explain why you need this lab class (e.g., practical session, demonstration, group work)"
                required
              />
            </div>

            {/* Lab Info Display */}
            {getSelectedLab() && (
              <div className="lab-info-display">
                <h4>Selected Lab Information</h4>
                <div className="lab-details">
                  <div><strong>Lab:</strong> {getSelectedLab().labNumber} - {getSelectedLab().name}</div>
                  <div><strong>Location:</strong> {getSelectedLab().building}, Floor {getSelectedLab().floor}</div>
                  <div><strong>Capacity:</strong> {getSelectedLab().capacity} people</div>
                  {getSelectedLab().equipmentCount > 0 && (
                    <div><strong>Equipment:</strong> {getSelectedLab().equipmentCount} items available</div>
                  )}
                  {getSelectedLab().description && (
                    <div><strong>Description:</strong> {getSelectedLab().description}</div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="submit"
                className="professor-btn primary"
                disabled={submitting || !Array.isArray(myCourses) || myCourses.length === 0}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Submit Lab Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default RequestLabPage;
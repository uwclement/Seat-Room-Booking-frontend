import React, { useState, useEffect } from 'react';
import { 
  getPublicAvailableEquipment,
  getPublicLabClasses,
  createEquipmentRequest
} from '../../api/equipmentRequests';
import { getMyApprovedCourses } from '../../api/professor';
import Alert from '../common/Alert';
import LoadingSpinner from '../common/LoadingSpinner';

const EquipmentRequestForm = ({ show, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    equipmentId: '',
    courseId: '',
    labClassId: '',
    reason: '',
    startTime: '',
    endTime: '',
    requestedQuantity: 1
  });

  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [availableLabClasses, setAvailableLabClasses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      loadFormData();
    }
  }, [show]);

  const loadFormData = async () => {
    setLoading(true);
    try {
      const [equipment, labClasses, courses] = await Promise.all([
        getPublicAvailableEquipment(),
        getPublicLabClasses(),
        getMyApprovedCourses()
      ]);
      
      setAvailableEquipment(equipment);
      setAvailableLabClasses(labClasses);
      setMyCourses(courses);
    } catch (err) {
      setError('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 1 : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.equipmentId) {
      newErrors.equipmentId = 'Please select equipment';
    }
    
    if (!formData.courseId) {
      newErrors.courseId = 'Please select a course';
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Please select start time';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'Please select end time';
    }
    
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      
      if (start >= end) {
        newErrors.endTime = 'End time must be after start time';
      }
      
      if (start < new Date()) {
        newErrors.startTime = 'Start time cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await createEquipmentRequest(formData);
      onSuccess('Equipment request created successfully');
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      equipmentId: '',
      courseId: '',
      labClassId: '',
      reason: '',
      startTime: '',
      endTime: '',
      requestedQuantity: 1
    });
    setErrors({});
    setError('');
    onClose();
  };

  const getSelectedEquipment = () => {
    return availableEquipment.find(eq => eq.id.toString() === formData.equipmentId);
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container large-modal">
        <div className="modal-header">
          <h3>Create Equipment Request</h3>
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

              <div className="form-grid">
                <div className="form-section">
                  <h4>Request Details</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Equipment *</label>
                      <select
                        name="equipmentId"
                        value={formData.equipmentId}
                        onChange={handleChange}
                        className={`form-control ${errors.equipmentId ? 'error' : ''}`}
                      >
                        <option value="">Select equipment...</option>
                        {availableEquipment.map(equipment => (
                          <option key={equipment.id} value={equipment.id}>
                            {equipment.name} 
                            {equipment.quantity && ` (${equipment.availableQuantity}/${equipment.quantity} available)`}
                          </option>
                        ))}
                      </select>
                      {errors.equipmentId && <div className="error-message">{errors.equipmentId}</div>}
                    </div>

                    <div className="form-group">
                      <label>Quantity *</label>
                      <input
                        type="number"
                        name="requestedQuantity"
                        value={formData.requestedQuantity}
                        onChange={handleChange}
                        className="form-control"
                        min="1"
                        max={getSelectedEquipment()?.availableQuantity || 1}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Course *</label>
                    <select
                      name="courseId"
                      value={formData.courseId}
                      onChange={handleChange}
                      className={`form-control ${errors.courseId ? 'error' : ''}`}
                    >
                      <option value="">Select course...</option>
                      {myCourses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.courseCode} - {course.courseName}
                        </option>
                      ))}
                    </select>
                    {errors.courseId && <div className="error-message">{errors.courseId}</div>}
                  </div>

                  <div className="form-group">
                    <label>Lab Class (Optional)</label>
                    <select
                      name="labClassId"
                      value={formData.labClassId}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="">No lab class needed</option>
                      {availableLabClasses.map(lab => (
                        <option key={lab.id} value={lab.id}>
                          {lab.labNumber} - {lab.name} (Capacity: {lab.capacity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Reason *</label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      className={`form-control ${errors.reason ? 'error' : ''}`}
                      rows="3"
                      placeholder="Explain why you need this equipment..."
                    />
                    {errors.reason && <div className="error-message">{errors.reason}</div>}
                  </div>
                </div>

                <div className="form-section">
                  <h4>Schedule</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Time *</label>
                      <input
                        type="datetime-local"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className={`form-control ${errors.startTime ? 'error' : ''}`}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                      {errors.startTime && <div className="error-message">{errors.startTime}</div>}
                    </div>

                    <div className="form-group">
                      <label>End Time *</label>
                      <input
                        type="datetime-local"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className={`form-control ${errors.endTime ? 'error' : ''}`}
                        min={formData.startTime || new Date().toISOString().slice(0, 16)}
                      />
                      {errors.endTime && <div className="error-message">{errors.endTime}</div>}
                    </div>
                  </div>

                  {formData.startTime && formData.endTime && (
                    <div className="duration-info">
                      <i className="fas fa-clock"></i>
                      Duration: {Math.round((new Date(formData.endTime) - new Date(formData.startTime)) / (1000 * 60 * 60))} hours
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Creating Request...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Submit Request
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

export default EquipmentRequestForm;
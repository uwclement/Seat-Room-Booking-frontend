import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getPublicAvailableEquipment,
  getPublicLabClasses,
  createEquipmentRequest
} from '../../api/equipmentRequests';
import { getMyApprovedCourses } from '../../api/professor';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RequestEquipmentPage = () => {
  const navigate = useNavigate();
  
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFormData();
  }, []);

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

  const handleEquipmentSelect = (equipment) => {
    setSelectedEquipment(equipment);
    setFormData(prev => ({
      ...prev,
      equipmentId: equipment.id.toString(),
      requestedQuantity: 1
    }));
    if (errors.equipmentId) {
      setErrors(prev => ({ ...prev, equipmentId: '' }));
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
      navigate('/professor/dashboard', { 
        state: { message: 'Equipment request created successfully' } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEquipment = availableEquipment.filter(equipment =>
    equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="professor-title">Request Equipment</h1>
            <p className="professor-subtitle">
              Submit a request for laboratory equipment and resources
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

        <form onSubmit={handleSubmit} className="equipment-request-form">
          {/* Equipment Selection */}
          <div className="professor-content-card">
            <div className="professor-card-header">
              <h3 className="professor-card-title">
                <i className="fas fa-search"></i>
                Select Equipment
              </h3>
            </div>
            <div className="professor-card-body">
              <div className="equipment-search">
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control search-input"
                />
              </div>
              
              {errors.equipmentId && (
                <div className="error-message">{errors.equipmentId}</div>
              )}

              <div className="equipment-catalog">
                {filteredEquipment.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-search"></i>
                    <h4>No Equipment Found</h4>
                    <p>Try adjusting your search terms.</p>
                  </div>
                ) : (
                  <div className="equipment-grid">
                    {filteredEquipment.map(equipment => (
                      <div
                        key={equipment.id}
                        className={`equipment-selection-card ${
                          selectedEquipment?.id === equipment.id ? 'selected' : ''
                        }`}
                        onClick={() => handleEquipmentSelect(equipment)}
                      >
                        <div className="equipment-icon">
                          <i className="fas fa-tools"></i>
                        </div>
                        <div className="equipment-info">
                          <h4>{equipment.name}</h4>
                          <p>{equipment.description}</p>
                          <div className="equipment-availability">
                            {equipment.availableQuantity}/{equipment.quantity} available
                          </div>
                        </div>
                        {selectedEquipment?.id === equipment.id && (
                          <div className="selection-indicator">
                            <i className="fas fa-check-circle"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedEquipment && (
                <div className="selected-equipment-info">
                  <h4>Selected Equipment</h4>
                  <div className="selected-equipment-details">
                    <span className="equipment-name">{selectedEquipment.name}</span>
                    <div className="quantity-selector">
                      <label>Quantity:</label>
                      <input
                        type="number"
                        name="requestedQuantity"
                        value={formData.requestedQuantity}
                        onChange={handleChange}
                        min="1"
                        max={selectedEquipment.availableQuantity}
                        className="form-control quantity-input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Section */}
          <div className="professor-content-card">
            <div className="professor-card-header">
              <h3 className="professor-card-title">
                <i className="fas fa-calendar"></i>
                Schedule
              </h3>
            </div>
            <div className="professor-card-body">
              <div className="form-grid">
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

          {/* Request Details */}
          <div className="professor-content-card">
            <div className="professor-card-header">
              <h3 className="professor-card-title">
                <i className="fas fa-edit"></i>
                Request Details
              </h3>
            </div>
            <div className="professor-card-body">
              <div className="form-grid">
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
              </div>

              <div className="form-group">
                <label>Reason *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className={`form-control ${errors.reason ? 'error' : ''}`}
                  rows="4"
                  placeholder="Explain why you need this equipment and how it will be used in your course..."
                />
                {errors.reason && <div className="error-message">{errors.reason}</div>}
              </div>
            </div>
          </div>

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
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Submitting Request...
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
      </div>
    </div>
  );
};

export default RequestEquipmentPage;
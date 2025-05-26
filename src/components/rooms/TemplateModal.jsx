import React, { useState } from 'react';

const TemplateModal = ({ show, onClose, onSubmit, equipment, loading }) => {
  const [formData, setFormData] = useState({
    templateName: '',
    description: '',
    category: 'LIBRARY_ROOM',
    capacity: 1,
    maxBookingHours: 2,
    maxBookingsPerDay: 1,
    advanceBookingDays: 7,
    requiresApproval: false,
    defaultEquipmentIds: []
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEquipmentChange = (equipmentId) => {
    setFormData(prev => ({
      ...prev,
      defaultEquipmentIds: prev.defaultEquipmentIds.includes(equipmentId)
        ? prev.defaultEquipmentIds.filter(id => id !== equipmentId)
        : [...prev.defaultEquipmentIds, equipmentId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.templateName.trim()) {
      newErrors.templateName = 'Template name is required';
    }
    
    if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }
    
    if (formData.maxBookingHours < 1) {
      newErrors.maxBookingHours = 'Max booking hours must be at least 1';
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
      // Reset form
      setFormData({
        templateName: '',
        description: '',
        category: 'LIBRARY_ROOM',
        capacity: 1,
        maxBookingHours: 2,
        maxBookingsPerDay: 1,
        advanceBookingDays: 7,
        requiresApproval: false,
        defaultEquipmentIds: []
      });
      setErrors({});
    } catch (error) {
      // Error handling is done in the context
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container large-modal">
        <div className="modal-header">
          <h3>Create Room Template</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-section">
              <h4>Template Information</h4>
              
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  name="templateName"
                  value={formData.templateName}
                  onChange={handleChange}
                  className={`form-control ${errors.templateName ? 'error' : ''}`}
                  placeholder="e.g., Standard Study Room"
                />
                {errors.templateName && <div className="error-message">{errors.templateName}</div>}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                  placeholder="Template description"
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Default Configuration</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="LIBRARY_ROOM">Library Room</option>
                    <option value="STUDY_ROOM">Study Room</option>
                    <option value="CLASS_ROOM">Class Room</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className={`form-control ${errors.capacity ? 'error' : ''}`}
                    min="1"
                  />
                  {errors.capacity && <div className="error-message">{errors.capacity}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Booking Hours *</label>
                  <input
                    type="number"
                    name="maxBookingHours"
                    value={formData.maxBookingHours}
                    onChange={handleChange}
                    className={`form-control ${errors.maxBookingHours ? 'error' : ''}`}
                    min="1"
                  />
                  {errors.maxBookingHours && <div className="error-message">{errors.maxBookingHours}</div>}
                </div>

                <div className="form-group">
                  <label>Max Bookings per Day</label>
                  <input
                    type="number"
                    name="maxBookingsPerDay"
                    value={formData.maxBookingsPerDay}
                    onChange={handleChange}
                    className="form-control"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Advance Booking Days</label>
                <input
                  type="number"
                  name="advanceBookingDays"
                  value={formData.advanceBookingDays}
                  onChange={handleChange}
                  className="form-control"
                  min="1"
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Default Equipment</h4>
              <div className="equipment-selection">
                {equipment.length === 0 ? (
                  <p className="no-equipment">No equipment available</p>
                ) : (
                  <div className="equipment-grid">
                    {equipment.map(eq => (
                      <div key={eq.id} className="equipment-item">
                        <label className="equipment-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.defaultEquipmentIds.includes(eq.id)}
                            onChange={() => handleEquipmentChange(eq.id)}
                            disabled={!eq.available}
                          />
                          <div className="equipment-info">
                            <span className="equipment-name">{eq.name}</span>
                            {eq.description && (
                              <span className="equipment-description">{eq.description}</span>
                            )}
                            {!eq.available && (
                              <span className="equipment-unavailable">Unavailable</span>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h4>Template Settings</h4>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="requiresApproval"
                  checked={formData.requiresApproval}
                  onChange={handleChange}
                />
                <span>Requires admin approval for bookings</span>
              </label>
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
                  Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i>
                  Create Template
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateModal;

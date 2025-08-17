import React, { useState } from 'react';

const MaintenanceModal = ({ show, onClose, onSubmit, room, loading }) => {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.startTime && formData.endTime) {
      onSubmit(room.id, formData.startTime, formData.endTime, formData.notes);
    }
  };

  const handleClear = () => {
    onSubmit(room.id, null, null, '');
  };

  if (!show || !room) return null;

  const hasActiveMaintenance = room.maintenanceStart && room.maintenanceEnd;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Maintenance Schedule - {room.name}</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {hasActiveMaintenance && (
            <div className="current-maintenance">
              <h4>Current Maintenance Window</h4>
              <div className="maintenance-info">
                <div className="maintenance-period">
                  <i className="fas fa-calendar"></i>
                  <span>
                    {new Date(room.maintenanceStart).toLocaleString()} - 
                    {new Date(room.maintenanceEnd).toLocaleString()}
                  </span>
                </div>
                {room.maintenanceNotes && (
                  <div className="maintenance-notes">
                    <i className="fas fa-sticky-note"></i>
                    <span>{room.maintenanceNotes}</span>
                  </div>
                )}
              </div>
              <button 
                className="btn btn-warning"
                onClick={handleClear}
                disabled={loading}
              >
                <i className="fas fa-times"></i>
                Clear Maintenance Window
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h4>{hasActiveMaintenance ? 'Update' : 'Set'} Maintenance Window</h4>
            
            <div className="form-group">
              <label>Start Date & Time</label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label>End Date & Time</label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="form-control"
                required
                min={formData.startTime}
              />
            </div>

            <div className="form-group">
              <label>Maintenance Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="form-control"
                rows="3"
                placeholder="Optional notes about the maintenance work"
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Setting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-tools"></i>
                    Set Maintenance
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

// BulkOperationModal Component
const BulkOperationModal = ({ show, onClose, onSubmit, selectedCount, loading }) => {
  const [operation, setOperation] = useState('enable');
  const [maintenanceData, setMaintenanceData] = useState({
    startTime: '',
    endTime: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    switch (operation) {
      case 'enable':
        onSubmit('enable');
        break;
      case 'disable':
        onSubmit('disable');
        break;
      case 'set_maintenance':
        if (maintenanceData.startTime && maintenanceData.endTime) {
          onSubmit('set_maintenance', {
            maintenanceStart: maintenanceData.startTime,
            maintenanceEnd: maintenanceData.endTime,
            maintenanceNotes: maintenanceData.notes
          });
        }
        break;
      case 'clear_maintenance':
        onSubmit('clear_maintenance');
        break;
      default:
        break;
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Bulk Operation ({selectedCount} rooms)</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Select Operation</label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="form-control"
              >
                <option value="enable">Enable All Rooms</option>
                <option value="disable">Disable All Rooms</option>
                <option value="set_maintenance">Set Maintenance Window</option>
                <option value="clear_maintenance">Clear Maintenance Window</option>
              </select>
            </div>

            {operation === 'set_maintenance' && (
              <div className="maintenance-fields">
                <div className="form-group">
                  <label>Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={maintenanceData.startTime}
                    onChange={(e) => setMaintenanceData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={maintenanceData.endTime}
                    onChange={(e) => setMaintenanceData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="form-control"
                    required
                    min={maintenanceData.startTime}
                  />
                </div>

                <div className="form-group">
                  <label>Maintenance Notes</label>
                  <textarea
                    value={maintenanceData.notes}
                    onChange={(e) => setMaintenanceData(prev => ({ ...prev, notes: e.target.value }))}
                    className="form-control"
                    rows="3"
                    placeholder="Optional notes about the maintenance work"
                  />
                </div>
              </div>
            )}

            <div className="operation-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <span>This operation will affect {selectedCount} rooms.</span>
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
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  Apply Operation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// TemplateModal Component
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

export { MaintenanceModal, BulkOperationModal, TemplateModal };
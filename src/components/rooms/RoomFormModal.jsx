import React, { useState, useEffect } from 'react';

const RoomFormModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  room = null, 
  equipment = [], 
  title = "Create Room",
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    name: '',
    description: '',
    category: 'LIBRARY_ROOM',
    capacity: 1,
    maxBookingHours: 2,
    maxBookingsPerDay: 1,
    advanceBookingDays: 7,
    available: true,
    building: '',
    floor: '',
    department: '',
    equipmentIds: [],
    requiresApproval: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber || '',
        name: room.name || '',
        description: room.description || '',
        category: room.category || 'LIBRARY_ROOM',
        capacity: room.capacity || 1,
        maxBookingHours: room.maxBookingHours || 2,
        maxBookingsPerDay: room.maxBookingsPerDay || 1,
        advanceBookingDays: room.advanceBookingDays || 7,
        available: room.available !== false,
        building: room.building || '',
        floor: room.floor || '',
        department: room.department || '',
        equipmentIds: room.equipment?.map(eq => eq.id) || [],
        requiresApproval: room.requiresApproval || false
      });
    } else {
      setFormData({
        roomNumber: '',
        name: '',
        description: '',
        category: 'LIBRARY_ROOM',
        capacity: 1,
        maxBookingHours: 2,
        maxBookingsPerDay: 1,
        advanceBookingDays: 7,
        available: true,
        building: '',
        floor: '',
        department: '',
        equipmentIds: [],
        requiresApproval: false
      });
    }
    setErrors({});
  }, [room, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEquipmentChange = (equipmentId) => {
    setFormData(prev => ({
      ...prev,
      equipmentIds: prev.equipmentIds.includes(equipmentId)
        ? prev.equipmentIds.filter(id => id !== equipmentId)
        : [...prev.equipmentIds, equipmentId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Room number is required';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required';
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
    } catch (error) {
      // Error handling is done in the context
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container large-modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Basic Information */}
              <div className="form-section">
                <h4>Basic Information</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Room Number *</label>
                    <input
                      type="text"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleChange}
                      className={`form-control ${errors.roomNumber ? 'error' : ''}`}
                      placeholder="e.g., LIB-101"
                      disabled={!!room} // Can't change room number when editing
                    />
                    {errors.roomNumber && <div className="error-message">{errors.roomNumber}</div>}
                  </div>

                  <div className="form-group">
                    <label>Room Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`form-control ${errors.name ? 'error' : ''}`}
                      placeholder="e.g., Library Study Room 1"
                    />
                    {errors.name && <div className="error-message">{errors.name}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    placeholder="Optional description of the room"
                  />
                </div>
              </div>

              {/* Room Configuration */}
              <div className="form-section">
                <h4>Room Configuration</h4>
                
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

              {/* Location Information */}
              <div className="form-section">
                <h4>Location Information</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Building</label>
                    <input
                      type="text"
                      name="building"
                      value={formData.building}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g., Main Library"
                    />
                  </div>

                  <div className="form-group">
                    <label>Floor</label>
                    <input
                      type="text"
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g., 1st Floor"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g., Library Services"
                  />
                </div>
              </div>

              {/* Equipment Selection */}
              <div className="form-section">
                <h4>Equipment Selection</h4>
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
                              checked={formData.equipmentIds.includes(eq.id)}
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

              {/* Room Settings */}
              <div className="form-section">
                <h4>Room Settings</h4>
                
                <div className="form-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleChange}
                    />
                    <span>Room is available for booking</span>
                  </label>

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
                  {room ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <i className={`fas ${room ? 'fa-save' : 'fa-plus'}`}></i>
                  {room ? 'Update Room' : 'Create Room'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { RoomCard, RoomList, RoomFilters, BulkActionToolbar, RoomFormModal };
import React from 'react';
import QRCodeButton from '../qr/QRCodeButton';

const RoomCard = ({ room, isSelected, onSelect, onEdit, onToggleStatus, onSetMaintenance, onDuplicate, onCalendar, onDelete, onQRUpdated }) => {
  const getCategoryColor = (category) => {
    switch (category) {
      case 'LIBRARY_ROOM': return 'blue';
      case 'STUDY_ROOM': return 'green';
      case 'CLASS_ROOM': return 'purple';
      default: return 'gray';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'LIBRARY_ROOM': return 'Library Room';
      case 'STUDY_ROOM': return 'Study Room';
      case 'CLASS_ROOM': return 'Class Room';
      default: return category;
    }
  };

  const getStatusColor = () => {
    if (room.underMaintenance) return 'orange';
    if (!room.available) return 'red';
    return 'green';
  };

  const getStatusText = () => {
    if (room.underMaintenance) return 'Under Maintenance';
    if (!room.available) return 'Disabled';
    return 'Available';
  };

const handleQRGenerated = (response) => {
  console.log('🏠 QR Generated for room:', room.id, response); // Debug log
  
  const updates = {
    qrCodeUrl: response.qrCodeUrl,
    qrImageUrl: response.imagePath,
    hasQRCode: true,
    qrGeneratedAt: response.generatedAt
  };
  
  console.log('🏠 Updating room with:', updates); 
  console.log('🏠 onQRUpdated function exists:', !!onQRUpdated);
  
  if (onQRUpdated) {
    console.log('🏠 Calling onQRUpdated for room:', room.id); 
    onQRUpdated(room.id, updates);
    console.log('🏠 onQRUpdated called successfully'); 
  } else {
    console.warn('🏠 onQRUpdated function not provided!'); 
  }
};

  return (
    <div className={`admin-card room-card ${isSelected ? 'selected' : ''}`}>
      <div className="card-header">
        <div className="room-card-header">
          <div className="room-selection">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(room.id)}
              className="room-checkbox"
            />
          </div>
          <div className="room-basic-info">
            <h3 className="room-title">{room.name}</h3>
            <div className="room-number">{room.roomNumber}</div>
          </div>
          <div className="room-status">
            <span className={`status-badge ${getStatusColor()}`}>
              <i className={`fas fa-circle status-dot`}></i>
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="room-details">
          <div className="room-category">
            <span className={`category-badge ${getCategoryColor(room.category)}`}>
              {getCategoryLabel(room.category)}
            </span>
          </div>
          
          <div className="room-info-grid">
            <div className="info-item">
              <i className="fas fa-users"></i>
              <span>Capacity: {room.capacity}</span>
            </div>
            <div className="info-item">
              <i className="fas fa-clock"></i>
              <span>Max Hours: {room.maxBookingHours}</span>
            </div>
            {room.building && (
              <div className="info-item">
                <i className="fas fa-building"></i>
                <span>{room.building}</span>
              </div>
            )}
            {room.floor && (
              <div className="info-item">
                <i className="fas fa-layer-group"></i>
                <span>{room.floor}</span>
              </div>
            )}
          </div>

          {room.description && (
            <div className="room-description">
              <p>{room.description}</p>
            </div>
          )}

          {room.equipment && room.equipment.length > 0 && (
            <div className="room-equipment">
              <div className="equipment-title">Equipment:</div>
              <div className="equipment-list">
                {room.equipment.slice(0, 3).map(eq => (
                  <span key={eq.id} className="equipment-tag">
                    {eq.name}
                  </span>
                ))}
                {room.equipment.length > 3 && (
                  <span className="equipment-tag more">
                    +{room.equipment.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {room.maintenanceStart && room.maintenanceEnd && (
            <div className="maintenance-info">
              <i className="fas fa-tools"></i>
              <span>
                Maintenance: {new Date(room.maintenanceStart).toLocaleDateString()} - {new Date(room.maintenanceEnd).toLocaleDateString()}
              </span>
            </div>
          )}

        <div className="room-qr-section">
          <QRCodeButton
            type="room"
            resourceId={room.id}
            resourceName={room.roomNumber}
            hasQR={room.hasQRCode}
            onGenerated={handleQRGenerated}
          />
          {room.qrGeneratedAt && (
            <small className="qr-info">
              QR generated: {new Date(room.qrGeneratedAt).toLocaleDateString()}
            </small>
          )}
        </div>
      </div>

        <div className="room-actions">
          <button 
            className="btn btn-sm btn-primary"
            title = "Edit"
            onClick={() => onEdit(room)}
          >
            <i className="fas fa-edit"></i>
            Edit
          </button>
          
          <button 
            className={`btn btn-sm ${room.available ? 'btn-warning' : 'btn-success'}`}
            onClick={() => onToggleStatus(room.id)}
          >
            <i className={`fas ${room.available ? 'fa-pause' : 'fa-play'}`}></i>
            {room.available ? 'Disable' : 'Enable'}
          </button>
          
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => onSetMaintenance(room)}
          >
            <i className="fas fa-tools"></i>
            Maintenance
          </button>

          {onCalendar && (
            <button 
              className="btn btn-sm btn-info"
              onClick={() => onCalendar(room)}
            >
              <i className="fas fa-calendar"></i>
              Calendar
            </button>
          )}
          
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => onDuplicate(room)}
          >
            <i className="fas fa-copy"></i>
            Duplicate
          </button>

          {onDelete && (
            <button 
              className="btn btn-sm btn-danger"
              onClick={() => onDelete(room.id)}
            >
              <i className="fas fa-trash"></i>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// RoomList Component
const RoomList = ({ rooms, selectedRooms, onSelect, onSelectAll, onEdit, onToggleStatus, onSetMaintenance, onDuplicate, onCalendar, onDelete, onQRUpdated }) => {
  
  const handleQRGenerated = (roomId, qrData) => {
    if (onQRUpdated) {
      onQRUpdated(roomId, qrData);
    }
  };

  return (
    <div className="room-list">
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedRooms.length === rooms.length && rooms.length > 0}
                  onChange={(e) => {
                     if (e.target.checked) {
                      onSelectAll();
                    } else {
                      selectedRooms.forEach(id => onSelect(id));
                    }
                  }}
                />
              </th>
              <th>Room</th>
              <th>Category</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Equipment</th>
              <th>QR Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id} className={selectedRooms.includes(room.id) ? 'selected-row' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRooms.includes(room.id)}
                    onChange={() => onSelect(room.id)}
                  />
                </td>
                <td>
                  <div className="room-info">
                    <div className="room-name">{room.name}</div>
                    <div className="room-number">{room.roomNumber}</div>
                    {room.building && <div className="room-location">{room.building} - {room.floor}</div>}
                  </div>
                </td>
                <td>
                  <span className={`category-badge ${room.category.toLowerCase().replace('_', '-')}`}>
                    {room.category.replace('_', ' ')}
                  </span>
                </td>
                <td>{room.capacity}</td>
                <td>
                  <div className="room-status">
                    <span className={`status-dot ${room.underMaintenance ? 'maintenance' : room.available ? 'available' : 'disabled'}`}></span>
                    <span>{room.underMaintenance ? 'Under Maintenance' : room.available ? 'Available' : 'Disabled'}</span>
                  </div>
                </td>
                <td>
                  <div className="equipment-count">
                    {room.equipment?.length || 0} items
                  </div>
                </td>

                <td>
                  <QRCodeButton
                    type="room"
                    resourceId={room.id}
                    resourceName={room.roomNumber}
                    hasQR={room.hasQRCode}
                    onGenerated={(response) => handleQRGenerated(room.id, {
                      qrCodeUrl: response.qrCodeUrl,
                      qrImageUrl: response.imagePath,
                      hasQRCode: true,
                      qrGeneratedAt: response.generatedAt
                    })}
                  />
                </td>

                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => onEdit(room)}
                      lable="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className={`btn btn-sm ${room.available ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => onToggleStatus(room.id)}
                      title="Enable/Disable"
                    >
                      <i className={`fas ${room.available ? 'fa-pause' : 'fa-play'}`}></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => onSetMaintenance(room)}
                      title="Maintenance"
                    >
                      <i className="fas fa-tools"></i>
                    </button>
                    {onCalendar && (
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => onCalendar(room)}
                        title="Calender"
                      >
                        <i className="fas fa-calendar"></i>
                      </button>
                    )}
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => onDuplicate(room)}
                      title="Duplicate"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                    {onDelete && (
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => onDelete(room.id)}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// RoomFilters Component
const RoomFilters = ({ filters, setFilters, searchKeyword, setSearchKeyword, onClearFilters }) => {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: '',
      available: '',
      minCapacity: '',
      maxCapacity: '',
      building: '',
      floor: '',
      department: '',
      requiresApproval: ''
    });
    setSearchKeyword('');
    onClearFilters && onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchKeyword !== '';

  return (
    <div className="room-filters">
      <div className="filter-header">
        <h3 className="filter-title">Search & Filter Rooms</h3>
        {hasActiveFilters && (
          <button className="btn btn-sm btn-outline" onClick={clearAllFilters}>
            <i className="fas fa-times"></i>
            Clear All
          </button>
        )}
      </div>

      <div className="filters-container">
        {/* Search */}
        <div className="filter-item search-filter">
          <label>Search</label>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search rooms by name, number, or description..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="form-control"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
        </div>

        {/* Category Filter */}
        <div className="filter-item">
          <label>Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="form-control"
          >
            <option value="">All Categories</option>
            <option value="LIBRARY_ROOM">Library Room</option>
            <option value="STUDY_ROOM">Study Room</option>
            <option value="CLASS_ROOM">Class Room</option>
          </select>
        </div>

        {/* Availability Filter */}
        <div className="filter-item">
          <label>Status</label>
          <select
            value={filters.available}
            onChange={(e) => handleFilterChange('available', e.target.value)}
            className="form-control"
          >
            <option value="">All Status</option>
            <option value="true">Available</option>
            <option value="false">Disabled</option>
          </select>
        </div>

        {/* Capacity Filters */}
        <div className="filter-item">
          <label>Min Capacity</label>
          <input
            type="number"
            placeholder="Min"
            value={filters.minCapacity}
            onChange={(e) => handleFilterChange('minCapacity', e.target.value)}
            className="form-control"
            min="1"
          />
        </div>

        <div className="filter-item">
          <label>Max Capacity</label>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxCapacity}
            onChange={(e) => handleFilterChange('maxCapacity', e.target.value)}
            className="form-control"
            min="1"
          />
        </div>

        {/* Location Filters */}
        <div className="filter-item">
          <label>Building</label>
          <input
            type="text"
            placeholder="Building name"
            value={filters.building}
            onChange={(e) => handleFilterChange('building', e.target.value)}
            className="form-control"
          />
        </div>

        <div className="filter-item">
          <label>Floor</label>
          <input
            type="text"
            placeholder="Floor"
            value={filters.floor}
            onChange={(e) => handleFilterChange('floor', e.target.value)}
            className="form-control"
          />
        </div>

        <div className="filter-item">
          <label>Department</label>
          <input
            type="text"
            placeholder="Department"
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="form-control"
          />
        </div>

        {/* Approval Filter */}
        <div className="filter-item">
          <label>Requires Approval</label>
          <select
            value={filters.requiresApproval}
            onChange={(e) => handleFilterChange('requiresApproval', e.target.value)}
            className="form-control"
          >
            <option value="">All</option>
            <option value="true">Requires Approval</option>
            <option value="false">No Approval Required</option>
          </select>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="active-filters">
          <div className="filter-tags">
            {searchKeyword && (
              <span className="filter-tag">
                Search: "{searchKeyword}"
                <button onClick={() => setSearchKeyword('')}>
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            {Object.entries(filters).map(([key, value]) => 
              value && (
                <span key={key} className="filter-tag">
                  {key}: {value}
                  <button onClick={() => handleFilterChange(key, '')}>
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// BulkActionToolbar Component
const BulkActionToolbar = ({ selectedCount, onBulkEnable, onBulkDisable, onBulkMaintenance, onBulkDelete, onClearSelection }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-action-toolbar">
      <div className="bulk-info">
        <span className="selection-count">
          {selectedCount} room{selectedCount > 1 ? 's' : ''} selected
        </span>
        <button className="btn btn-sm btn-outline" onClick={onClearSelection}>
          Clear Selection
        </button>
      </div>
      
      <div className="bulk-actions">
        <button className="btn btn-sm btn-success" onClick={onBulkEnable}>
          <i className="fas fa-play"></i>
          Enable All
        </button>
        <button className="btn btn-sm btn-warning" onClick={onBulkDisable}>
          <i className="fas fa-pause"></i>
          Disable All
        </button>
        <button className="btn btn-sm btn-secondary" onClick={onBulkMaintenance}>
          <i className="fas fa-tools"></i>
          Set Maintenance
        </button>
        <button className="btn btn-sm btn-danger" onClick={onBulkDelete}>
          <i className="fas fa-trash"></i>
          Delete All
        </button>
      </div>
    </div>
  );
};

// RoomFormModal Component
const RoomFormModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  room = null, 
  equipment = [], 
  title = "Create Room",
  loading = false,
  onSaveDraft,
  initialData
}) => {
  const [formData, setFormData] = React.useState({
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

  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
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
    } else if (initialData) {
      setFormData(initialData);
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
  }, [room, show, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    setFormData(newFormData);
    
    // Auto-save draft
    if (onSaveDraft && !room) {
      onSaveDraft(newFormData);
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEquipmentChange = (equipmentId) => {
    const newFormData = {
      ...formData,
      equipmentIds: formData.equipmentIds.includes(equipmentId)
        ? formData.equipmentIds.filter(id => id !== equipmentId)
        : [...formData.equipmentIds, equipmentId]
    };
    setFormData(newFormData);
    
    // Auto-save draft
    if (onSaveDraft && !room) {
      onSaveDraft(newFormData);
    }
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
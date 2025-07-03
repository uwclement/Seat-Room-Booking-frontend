import React, { useState, useEffect } from 'react';
import { useEquipmentAdmin } from '../../../context/EquipmentAdminContext';
import {
  createLabClass,
  updateLabClass,
  deleteLabClass,
  toggleLabAvailability
} from '../../../api/equipmentAdmin';
import Alert from '../../common/Alert';
import LoadingSpinner from '../../common/LoadingSpinner';

const LabClassManagement = () => {
  const {
    labClasses,
    equipment,
    loadingLabClasses,
    filters,
    error,
    successMessage,
    updateFilters,
    getFilteredData,
    updateItemInState,
    removeItemFromState,
    showSuccess,
    showError,
    clearMessages,
    loadLabClasses: refreshLabClasses,
    viewMode,  
    setViewMode
  } = useEquipmentAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLabClass, setSelectedLabClass] = useState(null);
  const [processing, setProcessing] = useState(false);

    useEffect(() => {
    setViewMode('labs');
  }, [setViewMode]);

  const filteredLabClasses = getFilteredData();

   console.log('Filtered Lab Classes:', filteredLabClasses)
   console.log('View Mode:', viewMode);
   console.log('Lab Classes from context:', labClasses);

  const handleCreate = async (labClassData) => {
    setProcessing(true);
    try {
      await createLabClass(labClassData);
      await refreshLabClasses();
      showSuccess('Lab class created successfully');
      setShowCreateModal(false);
    } catch (err) {
      showError('Failed to create lab class');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdate = async (labClassData) => {
    if (!selectedLabClass) return;
    
    setProcessing(true);
    try {
      const updatedLabClass = await updateLabClass(selectedLabClass.id, labClassData);
      updateItemInState(selectedLabClass.id, updatedLabClass, 'labs');
      showSuccess('Lab class updated successfully');
      setShowEditModal(false);
      setSelectedLabClass(null);
    } catch (err) {
      showError('Failed to update lab class');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lab class?')) {
      setProcessing(true);
      try {
        await deleteLabClass(id);
        removeItemFromState(id, 'labs');
        showSuccess('Lab class deleted successfully');
      } catch (err) {
        showError('Failed to delete lab class');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleToggleAvailability = async (id) => {
    setProcessing(true);
    try {
      const updatedLabClass = await toggleLabAvailability(id);
      updateItemInState(id, updatedLabClass, 'labs');
      showSuccess('Lab class status updated successfully');
    } catch (err) {
      showError('Failed to update lab class status');
    } finally {
      setProcessing(false);
    }
  };

  const getLabStats = () => {
    return {
      total: labClasses.length,
      available: labClasses.filter(lab => lab.available).length,
      unavailable: labClasses.filter(lab => !lab.available).length,
      withEquipment: labClasses.filter(lab => lab.equipmentCount > 0).length
    };
  };

  const stats = getLabStats();

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>Lab Class Management</h1>
            <p className="admin-subtitle">
              Manage laboratory classrooms and their equipment
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i>
            Add Lab Class
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-item available">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Labs</div>
        </div>
        <div className="stat-item library">
          <div className="stat-value">{stats.available}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-item disabled">
          <div className="stat-value">{stats.unavailable}</div>
          <div className="stat-label">Unavailable</div>
        </div>
        <div className="stat-item study">
          <div className="stat-value">{stats.withEquipment}</div>
          <div className="stat-label">With Equipment</div>
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

      {/* Search */}
      <div className="admin-card">
        <div className="card-body">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search lab classes..."
              value={filters.keyword}
              onChange={(e) => updateFilters({ keyword: e.target.value })}
              className="form-control"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
        </div>
      </div>

      {loadingLabClasses && <LoadingSpinner />}

      {/* Lab Classes Grid */}
      <div className="admin-card">
        <div className="card-body">
          {filteredLabClasses.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-flask"></i>
              <h3>No Lab Classes Found</h3>
              <p>No lab classes match your search. Create your first lab class.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <i className="fas fa-plus"></i>
                Create First Lab Class
              </button>
            </div>
          ) : (
            <div className="room-grid">
              {filteredLabClasses.map(lab => (
                <div key={lab.id} className="room-card">
                  <div className="room-card-header">
                    <div className="room-basic-info">
                      <h3 className="room-title">{lab.name}</h3>
                      <div className="room-number">Lab {lab.labNumber}</div>
                    </div>
                    <div className="room-status">
                      <span className={`status-badge ${lab.available ? 'green' : 'red'}`}>
                        <span className="status-dot"></span>
                        {lab.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="room-details">
                    <div className="room-info-grid">
                      <div className="info-item">
                        <i className="fas fa-users"></i>
                        <span>Capacity: {lab.capacity}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-building"></i>
                        <span>{lab.building}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-layer-group"></i>
                        <span>Floor {lab.floor}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-tools"></i>
                        <span>{lab.equipmentCount || 0} Equipment</span>
                      </div>
                    </div>
                    
                    {lab.description && (
                      <div className="room-description">
                        <p>{lab.description}</p>
                      </div>
                    )}
                    
                    <div className="room-actions">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setSelectedLabClass(lab);
                          setShowEditModal(true);
                        }}
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button 
                        className={`btn btn-sm ${lab.available ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleAvailability(lab.id)}
                        disabled={processing}
                      >
                        <i className={`fas ${lab.available ? 'fa-pause' : 'fa-play'}`}></i>
                        {lab.available ? 'Disable' : 'Enable'}
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(lab.id)}
                        disabled={processing}
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lab Class Form Modals */}
      <LabClassFormModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        equipment={equipment}
        title="Create Lab Class"
        loading={processing}
      />

      <LabClassFormModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLabClass(null);
        }}
        onSubmit={handleUpdate}
        labClass={selectedLabClass}
        equipment={equipment}
        title="Edit Lab Class"
        loading={processing}
      />
    </div>
  );
};

// Lab Class Form Modal Component
const LabClassFormModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  labClass = null, 
  equipment = [],
  title = "Create Lab Class",
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    labNumber: '',
    name: '',
    description: '',
    capacity: 20,
    building: '',
    floor: '',
    equipmentIds: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (labClass) {
      setFormData({
        labNumber: labClass.labNumber || '',
        name: labClass.name || '',
        description: labClass.description || '',
        capacity: labClass.capacity || 20,
        building: labClass.building || '',
        floor: labClass.floor || '',
        equipmentIds: labClass.equipmentIds || []
      });
    } else {
      setFormData({
        labNumber: '',
        name: '',
        description: '',
        capacity: 20,
        building: '',
        floor: '',
        equipmentIds: []
      });
    }
    setErrors({});
  }, [labClass, show]);

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

  const handleEquipmentToggle = (equipmentId) => {
    setFormData(prev => ({
      ...prev,
      equipmentIds: prev.equipmentIds.includes(equipmentId)
        ? prev.equipmentIds.filter(id => id !== equipmentId)
        : [...prev.equipmentIds, equipmentId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.labNumber.trim()) {
      newErrors.labNumber = 'Lab number is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Lab name is required';
    }

    if (!formData.building.trim()) {
      newErrors.building = 'Building is required';
    }

    if (!formData.floor.trim()) {
      newErrors.floor = 'Floor is required';
    }

    if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
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
              <div className="form-section">
                <h4>Basic Information</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Lab Number *</label>
                    <input
                      type="text"
                      name="labNumber"
                      value={formData.labNumber}
                      onChange={handleChange}
                      className={`form-control ${errors.labNumber ? 'error' : ''}`}
                      placeholder="e.g., L101"
                    />
                    {errors.labNumber && <div className="error-message">{errors.labNumber}</div>}
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

                <div className="form-group">
                  <label>Lab Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-control ${errors.name ? 'error' : ''}`}
                    placeholder="e.g., Computer Science Lab"
                  />
                  {errors.name && <div className="error-message">{errors.name}</div>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Building *</label>
                    <input
                      type="text"
                      name="building"
                      value={formData.building}
                      onChange={handleChange}
                      className={`form-control ${errors.building ? 'error' : ''}`}
                      placeholder="e.g., Main Building"
                    />
                    {errors.building && <div className="error-message">{errors.building}</div>}
                  </div>

                  <div className="form-group">
                    <label>Floor *</label>
                    <input
                      type="text"
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      className={`form-control ${errors.floor ? 'error' : ''}`}
                      placeholder="e.g., 2nd Floor"
                    />
                    {errors.floor && <div className="error-message">{errors.floor}</div>}
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
                    placeholder="Optional description of the lab"
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Equipment Assignment</h4>
                
                {equipment.length === 0 ? (
                  <div className="no-equipment">
                    <p>No equipment available for assignment.</p>
                  </div>
                ) : (
                  <div className="equipment-selection">
                    <div className="equipment-grid">
                      {equipment.map(eq => (
                        <div key={eq.id} className="equipment-item">
                          <label className="equipment-checkbox">
                            <input
                              type="checkbox"
                              checked={formData.equipmentIds.includes(eq.id)}
                              onChange={() => handleEquipmentToggle(eq.id)}
                            />
                            <div className="equipment-info">
                              <div className="equipment-name">{eq.name}</div>
                              {eq.description && (
                                <div className="equipment-description">{eq.description}</div>
                              )}
                              {!eq.available && (
                                <div className="equipment-unavailable">Currently unavailable</div>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  {labClass ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <i className={`fas ${labClass ? 'fa-save' : 'fa-plus'}`}></i>
                  {labClass ? 'Update Lab Class' : 'Create Lab Class'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LabClassManagement;
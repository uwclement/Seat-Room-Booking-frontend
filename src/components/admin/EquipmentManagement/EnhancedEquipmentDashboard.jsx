import React, { useState } from 'react';
import { useEquipmentAdmin } from '../../../context/EquipmentAdminContext';
import {
  createEquipmentAdmin,
  updateEquipmentAdmin,
  deleteEquipmentAdmin,
  toggleEquipmentAvailabilityAdmin
} from '../../../api/equipmentAdmin';
import Alert from '../../common/Alert';
import LoadingSpinner from '../../common/LoadingSpinner';
import ToastNotification from '../../common/ToastNotification';
import AdminSidebar from '../../common/AdminSidebar';

const EnhancedEquipmentDashboard = () => {
  const {
    equipment,
    loadingEquipment,
    filters,
    selectedItems,
    error,
    successMessage,
    updateFilters,
    getFilteredData,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    updateItemInState,
    removeItemFromState,
    showSuccess,
    showError,
    clearMessages,
    loadEquipment
  } = useEquipmentAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [processing, setProcessing] = useState(false);

  const filteredEquipment = getFilteredData();

  const handleCreate = async (equipmentData) => {
    setProcessing(true);
    try {
      const newEquipment = await createEquipmentAdmin(equipmentData);
      await loadEquipment();
      showSuccess('Equipment created successfully');
      setShowCreateModal(false);
    } catch (err) {
      showError('Failed to create equipment');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdate = async (equipmentData) => {
    if (!selectedEquipment) return;
    
    setProcessing(true);
    try {
      const updatedEquipment = await updateEquipmentAdmin(selectedEquipment.id, equipmentData);
      updateItemInState(selectedEquipment.id, updatedEquipment);
      showSuccess('Equipment updated successfully');
      setShowEditModal(false);
      setSelectedEquipment(null);
    } catch (err) {
      showError('Failed to update equipment');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      setProcessing(true);
      try {
        await deleteEquipmentAdmin(id);
        removeItemFromState(id);
        showSuccess('Equipment deleted successfully');
      } catch (err) {
        showError('Failed to delete equipment');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleToggleAvailability = async (id) => {
    setProcessing(true);
    try {
      const updatedEquipment = await toggleEquipmentAvailabilityAdmin(id);
      updateItemInState(id, updatedEquipment);
      showSuccess('Equipment status updated successfully');
    } catch (err) {
      showError('Failed to update equipment status');
    } finally {
      setProcessing(false);
    }
  };

  const getEquipmentStats = () => {
    return {
      total: equipment.length,
      available: equipment.filter(eq => eq.available).length,
      studentAllowed: equipment.filter(eq => eq.allowedToStudents).length,
      lowInventory: equipment.filter(eq => eq.availableQuantity <= 2).length,
      outOfStock: equipment.filter(eq => eq.availableQuantity === 0).length
    };
  };

  const stats = getEquipmentStats();

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>Equipment Management</h1>
            <p className="admin-subtitle">
              Manage equipment inventory, availability, and student permissions
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i>
            Add Equipment
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-item available">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Equipment</div>
        </div>
        <div className="stat-item library">
          <div className="stat-value">{stats.available}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-item study">
          <div className="stat-value">{stats.studentAllowed}</div>
          <div className="stat-label">Student Allowed</div>
        </div>
        <div className="stat-item maintenance">
          <div className="stat-value">{stats.lowInventory}</div>
          <div className="stat-label">Low Inventory</div>
        </div>
        <div className="stat-item disabled">
          <div className="stat-value">{stats.outOfStock}</div>
          <div className="stat-label">Out of Stock</div>
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

      {/* Filters */}
      <div className="admin-card">
        <div className="card-body">
          <div className="equipment-filters">
            <div className="filters-container">
              <div className="filter-item search-filter">
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder="Search equipment..."
                    value={filters.keyword}
                    onChange={(e) => updateFilters({ keyword: e.target.value })}
                    className="form-control"
                  />
                  <i className="fas fa-search search-icon"></i>
                </div>
              </div>
              
              <div className="filter-item">
                <label>Availability</label>
                <select
                  value={filters.availability}
                  onChange={(e) => updateFilters({ availability: e.target.value })}
                  className="form-control"
                >
                  <option value="">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              
              <div className="filter-item">
                <label>Student Access</label>
                <select
                  value={filters.allowedToStudents}
                  onChange={(e) => updateFilters({ allowedToStudents: e.target.value })}
                  className="form-control"
                >
                  <option value="">All</option>
                  <option value="true">Allowed</option>
                  <option value="false">Not Allowed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bulk-action-toolbar">
          <div className="bulk-info">
            <span className="selection-count">{selectedItems.length} selected</span>
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
              onClick={() => console.log('Bulk toggle availability')}
            >
              Toggle Availability
            </button>
          </div>
        </div>
      )}

      {loadingEquipment && <LoadingSpinner />}

      {/* Equipment Grid */}
      <div className="admin-card">
        <div className="card-body">
          {filteredEquipment.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-tools"></i>
              <h3>No Equipment Found</h3>
              <p>No equipment matches your search. Create your first equipment item.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <i className="fas fa-plus"></i>
                Create First Equipment
              </button>
            </div>
          ) : (
            <div className="equipment-grid">
              {filteredEquipment.map(eq => (
                <div key={eq.id} className={`equipment-card ${selectedItems.includes(eq.id) ? 'selected' : ''}`}>
                  <div className="equipment-header">
                    <div className="equipment-selection">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(eq.id)}
                        onChange={() => toggleItemSelection(eq.id)}
                        className="equipment-checkbox"
                      />
                    </div>
                    <div className="equipment-basic-info">
                      <h3 className="equipment-title">{eq.name}</h3>
                      {eq.description && (
                        <p className="equipment-description">{eq.description}</p>
                      )}
                    </div>
                    <div className="equipment-status">
                      <span className={`status-badge ${eq.available ? 'green' : 'red'}`}>
                        <span className="status-dot"></span>
                        {eq.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="equipment-details">
                    <div className="equipment-info-grid">
                      <div className="info-item">
                        <i className="fas fa-cubes"></i>
                        <span>Qty: {eq.quantity || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-check-circle"></i>
                        <span>Available: {eq.availableQuantity || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-users"></i>
                        <span>{eq.allowedToStudents ? 'Student Access' : 'Staff Only'}</span>
                      </div>
                      {eq.availableQuantity <= 2 && eq.availableQuantity > 0 && (
                        <div className="info-item" style={{ color: '#f97316' }}>
                          <i className="fas fa-exclamation-triangle"></i>
                          <span>Low Stock</span>
                        </div>
                      )}
                      {eq.availableQuantity === 0 && (
                        <div className="info-item" style={{ color: '#ef4444' }}>
                          <i className="fas fa-times-circle"></i>
                          <span>Out of Stock</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="equipment-actions">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setSelectedEquipment(eq);
                          setShowEditModal(true);
                        }}
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button 
                        className={`btn btn-sm ${eq.available ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleAvailability(eq.id)}
                        disabled={processing}
                      >
                        <i className={`fas ${eq.available ? 'fa-pause' : 'fa-play'}`}></i>
                        {eq.available ? 'Disable' : 'Enable'}
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(eq.id)}
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

      {/* Equipment Form Modals */}
      <EnhancedEquipmentFormModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        title="Create Equipment"
        loading={processing}
      />

      <EnhancedEquipmentFormModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEquipment(null);
        }}
        onSubmit={handleUpdate}
        equipment={selectedEquipment}
        title="Edit Equipment"
        loading={processing}
      />
    </div>
  );
};

// Enhanced Equipment Form Modal Component
const EnhancedEquipmentFormModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  equipment = null, 
  title = "Create Equipment",
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    available: true,
    allowedToStudents: false,
    quantity: 1
  });

  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        description: equipment.description || '',
        available: equipment.available !== false,
        allowedToStudents: equipment.allowedToStudents === true,
        quantity: equipment.quantity || 1
      });
    } else {
      setFormData({
        name: '',
        description: '',
        available: true,
        allowedToStudents: false,
        quantity: 1
      });
    }
    setErrors({});
  }, [equipment, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Equipment name is required';
    }

    if (formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
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
                    <label>Equipment Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`form-control ${errors.name ? 'error' : ''}`}
                      placeholder="e.g., HD Projector"
                    />
                    {errors.name && <div className="error-message">{errors.name}</div>}
                  </div>

                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className={`form-control ${errors.quantity ? 'error' : ''}`}
                      min="1"
                    />
                    {errors.quantity && <div className="error-message">{errors.quantity}</div>}
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
                    placeholder="Optional description of the equipment"
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Availability & Permissions</h4>
                
                <div className="form-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleChange}
                    />
                    <span>Equipment is available for use</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="allowedToStudents"
                      checked={formData.allowedToStudents}
                      onChange={handleChange}
                    />
                    <span>Allow students to request this equipment</span>
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
                  {equipment ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <i className={`fas ${equipment ? 'fa-save' : 'fa-plus'}`}></i>
                  {equipment ? 'Update Equipment' : 'Create Equipment'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedEquipmentDashboard;
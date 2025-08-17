import React, { useState, useEffect } from 'react';
import { useEquipmentAdmin } from '../../../context/EquipmentAdminContext';
import {
  createEquipmentAdmin,
  updateEquipmentAdmin,
  deleteEquipmentAdmin,
  toggleEquipmentAvailabilityAdmin,
  updateEquipmentStatus,
  getEquipmentHistory
} from '../../../api/equipmentAdmin';
import Alert from '../../common/Alert';
import LoadingSpinner from '../../common/LoadingSpinner';
import ToastNotification from '../../common/ToastNotification';

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
    loadEquipment,
    viewMode,  
    setViewMode
  } = useEquipmentAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipmentHistory, setEquipmentHistory] = useState([]);
  const [processing, setProcessing] = useState(false);


  useEffect(() => {
    setViewMode('equipment');
  }, [setViewMode]);

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

  // NEW: Handle status update
  const handleStatusUpdate = async (statusData) => {
    if (!selectedEquipment) return;
    
    setProcessing(true);
    try {
      const updatedEquipment = await updateEquipmentStatus(selectedEquipment.id, statusData);
      updateItemInState(selectedEquipment.id, updatedEquipment);
      showSuccess(`Moved ${statusData.quantity} items from ${statusData.fromStatus} to ${statusData.toStatus}`);
      setShowStatusModal(false);
      setSelectedEquipment(null);
    } catch (err) {
      showError('Failed to update equipment status');
    } finally {
      setProcessing(false);
    }
  };

  // View equipment history
  const handleViewHistory = async (equipment) => {
    setProcessing(true);
    try {
      const history = await getEquipmentHistory(equipment.id);
      setEquipmentHistory(Array.isArray(history) ? history : []);
      setSelectedEquipment(equipment);
      setShowHistoryModal(true);
    } catch (err) {
      showError('Failed to load equipment history');
      setEquipmentHistory([]);
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
      lowInventory: equipment.filter(eq => (eq.actualAvailableQuantity || eq.availableQuantity) <= 2).length,
      outOfStock: equipment.filter(eq => (eq.actualAvailableQuantity || eq.availableQuantity) === 0).length
    };
  };

  const stats = getEquipmentStats();

  return (
    <div className="admin-content">
      {/* Header */}
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

      {/* Enhanced Equipment Grid */}
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
                      {/* NEW: Location display */}
                      {eq.location && (
                        <span className="location-badge">
                          <i className="fas fa-map-marker-alt"></i>
                          {eq.locationDisplayName || eq.location}
                        </span>
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
                    {/* Enhanced inventory display */}
                    <div className="equipment-info-grid">
                      <div className="info-item">
                        <i className="fas fa-cubes"></i>
                        <span>Total: {eq.totalQuantity || eq.quantity || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-check-circle"></i>
                        <span>Available: {eq.actualAvailableQuantity || eq.availableQuantity || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-users"></i>
                        <span>{eq.allowedToStudents ? 'Student Access' : 'Staff Only'}</span>
                      </div>
                      {(eq.actualAvailableQuantity || eq.availableQuantity) <= 2 && (eq.actualAvailableQuantity || eq.availableQuantity) > 0 && (
                        <div className="info-item" style={{ color: '#f97316' }}>
                          <i className="fas fa-exclamation-triangle"></i>
                          <span>Low Stock</span>
                        </div>
                      )}
                      {(eq.actualAvailableQuantity || eq.availableQuantity) === 0 && (
                        <div className="info-item" style={{ color: '#ef4444' }}>
                          <i className="fas fa-times-circle"></i>
                          <span>Out of Stock</span>
                        </div>
                      )}
                    </div>

                    {/* NEW: Inventory breakdown display */}
                    {eq.inventoryBreakdown && eq.inventoryBreakdown.length > 0 && (
                      <div className="inventory-breakdown">
                        <h5>Status Breakdown:</h5>
                        <div className="status-grid">
                          {eq.inventoryBreakdown.map((inv, index) => (
                            <div key={index} className="status-item">
                              <span className="status-name">{inv.statusDisplayName || inv.status}</span>
                              <span className="status-count">{inv.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Enhanced Equipment Actions */}
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
                      
                      {/* NEW: Manage Status button */}
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => {
                          setSelectedEquipment(eq);
                          setShowStatusModal(true);
                        }}
                      >
                        <i className="fas fa-exchange-alt"></i>
                        Status
                      </button>
                      
                      {/* NEW: View History button */}
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleViewHistory(eq)}
                        disabled={processing}
                      >
                        <i className="fas fa-history"></i>
                        History
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

      {/* NEW: Status Update Modal */}
      <EquipmentStatusModal
        show={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedEquipment(null);
        }}
        onSubmit={handleStatusUpdate}
        equipment={selectedEquipment}
        loading={processing}
      />

      {/* NEW: History Modal */}
      <EquipmentHistoryModal
        show={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setSelectedEquipment(null);
          setEquipmentHistory([]);
        }}
        equipment={selectedEquipment}
        history={equipmentHistory}
      />
    </div>
  );
};

// 1. Enhanced Equipment Form Modal Component
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
    quantity: 1,
    location: 'GISHUSHU' // Default location
  });

  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        description: equipment.description || '',
        available: equipment.available !== false,
        allowedToStudents: equipment.allowedToStudents === true,
        quantity: equipment.quantity || 1,
        location: equipment.location || 'GISHUSHU'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        available: true,
        allowedToStudents: false,
        quantity: 1,
        location: 'GISHUSHU'
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

    if (!formData.location) {
      newErrors.location = 'Location is required';
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

                {/* NEW: Location field */}
                <div className="form-group">
                  <label>Location *</label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`form-control ${errors.location ? 'error' : ''}`}
                  >
                    <option value="GISHUSHU">Gishushu</option>
                    <option value="MASORO">Masoro</option>
                  </select>
                  {errors.location && <div className="error-message">{errors.location}</div>}
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

// 2. Equipment Status Update Modal Component
const EquipmentStatusModal = ({ show, onClose, onSubmit, equipment, loading }) => {
  const [statusData, setStatusData] = useState({
    fromStatus: 'AVAILABLE',
    toStatus: 'DAMAGED',
    quantity: 1,
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
    { value: 'DAMAGED', label: 'Damaged' },
    { value: 'LOST', label: 'Lost' },
    { value: 'RESERVED', label: 'Reserved' }
  ];

  React.useEffect(() => {
    if (equipment && show) {
      setStatusData({
        fromStatus: 'AVAILABLE',
        toStatus: 'DAMAGED',
        quantity: 1,
        notes: ''
      });
      setErrors({});
    }
  }, [equipment, show]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setStatusData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!statusData.fromStatus) {
      newErrors.fromStatus = 'From status is required';
    }

    if (!statusData.toStatus) {
      newErrors.toStatus = 'To status is required';
    }

    if (statusData.fromStatus === statusData.toStatus) {
      newErrors.toStatus = 'To status must be different from from status';
    }

    if (statusData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    // Get max available quantity for the from status
    const fromInventory = equipment?.inventoryBreakdown?.find(
      inv => inv.status === statusData.fromStatus
    );
    const maxQuantity = fromInventory?.quantity || 0;
    
    if (statusData.quantity > maxQuantity) {
      newErrors.quantity = `Cannot move more than ${maxQuantity} items from ${statusData.fromStatus}`;
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
      await onSubmit(statusData);
    } catch (error) {
      // Error handled in parent
    }
  };

  if (!show || !equipment) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Update Equipment Status</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="equipment-info">
              <h4>{equipment.name}</h4>
              <p>Current inventory breakdown:</p>
              <div className="current-status-grid">
                {equipment.inventoryBreakdown?.map((inv, index) => (
                  <div key={index} className="status-item">
                    <span>{inv.statusDisplayName || inv.status}:</span>
                    <strong>{inv.quantity}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label>From Status *</label>
                  <select
                    name="fromStatus"
                    value={statusData.fromStatus}
                    onChange={handleChange}
                    className={`form-control ${errors.fromStatus ? 'error' : ''}`}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.fromStatus && <div className="error-message">{errors.fromStatus}</div>}
                </div>

                <div className="form-group">
                  <label>To Status *</label>
                  <select
                    name="toStatus"
                    value={statusData.toStatus}
                    onChange={handleChange}
                    className={`form-control ${errors.toStatus ? 'error' : ''}`}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.toStatus && <div className="error-message">{errors.toStatus}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={statusData.quantity}
                  onChange={handleChange}
                  className={`form-control ${errors.quantity ? 'error' : ''}`}
                  min="1"
                />
                {errors.quantity && <div className="error-message">{errors.quantity}</div>}
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={statusData.notes}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                  placeholder="Optional notes about the status change"
                />
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
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-exchange-alt"></i>
                  Update Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Equipment History Modal Component
const EquipmentHistoryModal = ({ show, onClose, equipment, history }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusDisplayName = (status) => {
    const statusMap = {
      'AVAILABLE': 'Available',
      'UNDER_MAINTENANCE': 'Under Maintenance',
      'DAMAGED': 'Damaged',
      'LOST': 'Lost',
      'RESERVED': 'Reserved'
    };
    return statusMap[status] || status;
  };

  if (!show || !equipment) return null;

   const historyArray = Array.isArray(history) ? history : [];

  return (
    <div className="modal-backdrop">
      <div className="modal-container large-modal">
        <div className="modal-header">
          <h3>Equipment History - {equipment.name}</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="equipment-summary">
            <h4>Current Status</h4>
            <div className="current-status-grid">
              {equipment.inventoryBreakdown?.map((inv, index) => (
                <div key={index} className="status-item">
                  <span>{inv.statusDisplayName || inv.status}:</span>
                  <strong>{inv.quantity}</strong>
                </div>
              ))}
            </div>
            <p><strong>Total:</strong> {equipment.totalQuantity || equipment.quantity}</p>
          </div>

          <div className="history-section">
            <h4>Change History</h4>
            {historyArray.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-history"></i>
                <p>No history records found for this equipment.</p>
              </div>
            ) : (
              <div className="history-list">
                {history.map((record, index) => (
                  <div key={index} className="history-item">
                    <div className="history-header">
                      <div className="history-action">
                        {record.fromStatus ? (
                          <span>
                            <i className="fas fa-exchange-alt"></i>
                            Moved {record.quantity} from{' '}
                            <span className="status-badge">{getStatusDisplayName(record.fromStatus)}</span>
                            {' '}to{' '}
                            <span className="status-badge">{getStatusDisplayName(record.toStatus)}</span>
                          </span>
                        ) : (
                          <span>
                            <i className="fas fa-plus"></i>
                            Added {record.quantity} to{' '}
                            <span className="status-badge">{getStatusDisplayName(record.toStatus)}</span>
                          </span>
                        )}
                      </div>
                      <div className="history-date">
                        {formatDate(record.changedAt)}
                      </div>
                    </div>
                    <div className="history-details">
                      <div className="history-user">
                        <i className="fas fa-user"></i>
                        {record.changedBy?.fullName || 'Unknown User'}
                      </div>
                      {record.notes && (
                        <div className="history-notes">
                          <i className="fas fa-sticky-note"></i>
                          {record.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEquipmentDashboard;
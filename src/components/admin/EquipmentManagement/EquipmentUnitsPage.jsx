import React, { useState, useEffect } from 'react';
import { useEquipmentAdmin } from '../../../context/EquipmentAdminContext';
import {
  createEquipmentUnit,
  formatUnitStatus,
  getStatusColor
} from '../../../api/equipmentUnits';
import Alert from '../../common/Alert';
import LoadingSpinner from '../../common/LoadingSpinner';
import ToastNotification from '../../common/ToastNotification';

const EquipmentUnitsPage = () => {
  const {
    equipmentUnits,
    equipment,
    loadingEquipmentUnits,
    filters,
    selectedItems,
    error,
    successMessage,
    updateFilters,
    getFilteredData,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    addEquipmentUnitToState,
    showSuccess,
    showError,
    clearMessages,
    loadEquipmentUnits,
    setViewMode
  } = useEquipmentAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setViewMode('units');
  }, [setViewMode]);

  const filteredUnits = getFilteredData();

  const handleCreateUnit = async (unitData) => {
    setProcessing(true);
    try {
      const newUnit = await createEquipmentUnit(unitData);
      addEquipmentUnitToState(newUnit);
      showSuccess('Equipment unit created successfully');
      setShowCreateModal(false);
    } catch (err) {
      showError('Failed to create equipment unit');
    } finally {
      setProcessing(false);
    }
  };

  const getUnitsStats = () => {
    return {
      total: equipmentUnits.length,
      available: equipmentUnits.filter(unit => unit.status === 'AVAILABLE').length,
      assigned: equipmentUnits.filter(unit => unit.status === 'ASSIGNED' || unit.status === 'IN_REQUEST').length,
      maintenance: equipmentUnits.filter(unit => unit.status === 'MAINTENANCE').length,
      damaged: equipmentUnits.filter(unit => unit.status === 'DAMAGED').length
    };
  };

  const stats = getUnitsStats();

  return (
    <div className="admin-content">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>Equipment Units</h1>
            <p className="admin-subtitle">
              Manage individual equipment units with serial numbers
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i>
            Add Equipment Unit
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-item available">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Units</div>
        </div>
        <div className="stat-item library">
          <div className="stat-value">{stats.available}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-item study">
          <div className="stat-value">{stats.assigned}</div>
          <div className="stat-label">Assigned</div>
        </div>
        <div className="stat-item maintenance">
          <div className="stat-value">{stats.maintenance}</div>
          <div className="stat-label">Maintenance</div>
        </div>
        <div className="stat-item disabled">
          <div className="stat-value">{stats.damaged}</div>
          <div className="stat-label">Damaged</div>
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
                    placeholder="Search by serial number, equipment name..."
                    value={filters.keyword}
                    onChange={(e) => updateFilters({ keyword: e.target.value })}
                    className="form-control"
                  />
                  <i className="fas fa-search search-icon"></i>
                </div>
              </div>
              
              <div className="filter-item">
                <label>Status</label>
                <select
                  value={filters.unitStatus}
                  onChange={(e) => updateFilters({ unitStatus: e.target.value })}
                  className="form-control"
                >
                  <option value="">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_REQUEST">In Use</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>
              
              <div className="filter-item">
                <label>Serial Number</label>
                <input
                  type="text"
                  placeholder="Filter by serial..."
                  value={filters.serialNumber}
                  onChange={(e) => updateFilters({ serialNumber: e.target.value })}
                  className="form-control"
                />
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
              className="btn btn-sm btn-info"
              onClick={() => console.log('Bulk assign units')}
            >
              Bulk Assign
            </button>
          </div>
        </div>
      )}

      {loadingEquipmentUnits && <LoadingSpinner />}

      {/* Equipment Units Grid */}
      <div className="admin-card">
        <div className="card-body">
          {filteredUnits.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-barcode"></i>
              <h3>No Equipment Units Found</h3>
              <p>No equipment units match your search. Create your first equipment unit.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <i className="fas fa-plus"></i>
                Create First Unit
              </button>
            </div>
          ) : (
            <div className="equipment-grid">
              {filteredUnits.map(unit => (
                <div key={unit.id} className={`equipment-card ${selectedItems.includes(unit.id) ? 'selected' : ''}`}>
                  <div className="equipment-header">
                    <div className="equipment-selection">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(unit.id)}
                        onChange={() => toggleItemSelection(unit.id)}
                        className="equipment-checkbox"
                      />
                    </div>
                    <div className="equipment-basic-info">
                      <h3 className="equipment-title">
                        {unit.equipmentName}
                        <span className="serial-number">#{unit.serialNumber}</span>
                      </h3>
                      {unit.notes && (
                        <p className="equipment-description">{unit.notes}</p>
                      )}
                      <span className="location-badge">
                        <i className="fas fa-map-marker-alt"></i>
                        {unit.location}
                      </span>
                    </div>
                    <div className="equipment-status">
                      <span className={`status-badge ${getStatusColor(unit.status)}`}>
                        <span className="status-dot"></span>
                        {formatUnitStatus(unit.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="equipment-details">
                    <div className="equipment-info-grid">
                      <div className="info-item">
                        <i className="fas fa-barcode"></i>
                        <span>Serial: {unit.serialNumber}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-tools"></i>
                        <span>Condition: {unit.condition || 'Good'}</span>
                      </div>
                      {unit.assigned && (
                        <div className="info-item">
                          <i className="fas fa-user"></i>
                          <span>Assigned to: {unit.assignedTo}</span>
                        </div>
                      )}
                      {unit.purchaseDate && (
                        <div className="info-item">
                          <i className="fas fa-calendar"></i>
                          <span>Purchased: {new Date(unit.purchaseDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {unit.warrantyExpiry && (
                        <div className="info-item">
                          <i className="fas fa-shield-alt"></i>
                          <span>Warranty: {new Date(unit.warrantyExpiry).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Unit Actions */}
                    <div className="equipment-actions">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => console.log('Edit unit', unit.id)}
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      
                      {unit.status === 'AVAILABLE' && (
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => console.log('Assign unit', unit.id)}
                        >
                          <i className="fas fa-user-plus"></i>
                          Assign
                        </button>
                      )}
                      
                      {unit.assigned && (
                        <button 
                          className="btn btn-sm btn-warning"
                          onClick={() => console.log('Remove assignment', unit.id)}
                        >
                          <i className="fas fa-user-minus"></i>
                          Remove
                        </button>
                      )}
                      
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => console.log('View history', unit.id)}
                      >
                        <i className="fas fa-history"></i>
                        History
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Unit Modal */}
      <CreateEquipmentUnitModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUnit}
        equipment={equipment}
        loading={processing}
      />
    </div>
  );
};

// Create Equipment Unit Modal Component
const CreateEquipmentUnitModal = ({ show, onClose, onSubmit, equipment, loading }) => {
  const [formData, setFormData] = useState({
    equipmentId: '',
    serialNumber: '',
    condition: 'GOOD',
    purchaseDate: '',
    warrantyExpiry: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      setFormData({
        equipmentId: '',
        serialNumber: '',
        condition: 'GOOD',
        purchaseDate: '',
        warrantyExpiry: '',
        notes: ''
      });
      setErrors({});
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.equipmentId) {
      newErrors.equipmentId = 'Equipment selection is required';
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required';
    }

    if (formData.warrantyExpiry && formData.purchaseDate) {
      if (new Date(formData.warrantyExpiry) <= new Date(formData.purchaseDate)) {
        newErrors.warrantyExpiry = 'Warranty expiry must be after purchase date';
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

    try {
      const submitData = {
        ...formData,
        purchaseDate: formData.purchaseDate || null,
        warrantyExpiry: formData.warrantyExpiry || null
      };
      await onSubmit(submitData);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Create Equipment Unit</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-section">
              <div className="form-group">
                <label>Equipment Type *</label>
                <select
                  name="equipmentId"
                  value={formData.equipmentId}
                  onChange={handleChange}
                  className={`form-control ${errors.equipmentId ? 'error' : ''}`}
                >
                  <option value="">Select Equipment</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.location})
                    </option>
                  ))}
                </select>
                {errors.equipmentId && <div className="error-message">{errors.equipmentId}</div>}
              </div>

              <div className="form-group">
                <label>Serial Number *</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  className={`form-control ${errors.serialNumber ? 'error' : ''}`}
                  placeholder="e.g., PROJ-001, LAP-001"
                />
                {errors.serialNumber && <div className="error-message">{errors.serialNumber}</div>}
              </div>

              <div className="form-group">
                <label>Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Purchase Date</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Warranty Expiry</label>
                  <input
                    type="date"
                    name="warrantyExpiry"
                    value={formData.warrantyExpiry}
                    onChange={handleChange}
                    className={`form-control ${errors.warrantyExpiry ? 'error' : ''}`}
                  />
                  {errors.warrantyExpiry && <div className="error-message">{errors.warrantyExpiry}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                  placeholder="Optional notes about this unit"
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
                  Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i>
                  Create Unit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentUnitsPage;
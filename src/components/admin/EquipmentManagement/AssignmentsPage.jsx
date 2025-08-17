import React, { useState, useEffect } from 'react';
import { useEquipmentAdmin } from '../../../context/EquipmentAdminContext';
import {
  assignEquipmentUnit,
  removeAssignment,
  formatAssignmentType,
  getAvailableUnitsForEquipment
} from '../../../api/equipmentUnits';
import Alert from '../../common/Alert';
import LoadingSpinner from '../../common/LoadingSpinner';
import ToastNotification from '../../common/ToastNotification';

const AssignmentsPage = () => {
  const {
    assignments,
    equipmentUnits,
    equipment,
    loadingAssignments,
    filters,
    selectedItems,
    error,
    successMessage,
    updateFilters,
    getFilteredData,
    toggleItemSelection,
    clearSelection,
    updateItemInState,
    removeItemFromState,
    addAssignmentToState,
    showSuccess,
    showError,
    clearMessages,
    setViewMode
  } = useEquipmentAdmin();

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setViewMode('assignments');
  }, [setViewMode]);

  const filteredAssignments = getFilteredData() || [];

  // Show loading spinner while data is being fetched
  if (loadingAssignments && (!assignments || assignments.length === 0)) {
    return (
      <div className="admin-content">
        <div className="admin-header">
          <div className="header-content">
            <div>
              <h1>Equipment Assignments</h1>
              <p className="admin-subtitle">Loading assignments...</p>
            </div>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  const handleCreateAssignment = async (assignmentData) => {
    setProcessing(true);
    try {
      const newAssignment = await assignEquipmentUnit(assignmentData);
      addAssignmentToState(newAssignment);
      showSuccess('Equipment assigned successfully');
      setShowAssignModal(false);
    } catch (err) {
      showError('Failed to create assignment');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveAssignment = async (returnReason) => {
    if (!selectedAssignment) return;
    
    setProcessing(true);
    try {
      await removeAssignment(selectedAssignment.id, returnReason);
      removeItemFromState(selectedAssignment.id, 'assignments');
      showSuccess('Assignment removed successfully');
      setShowRemoveModal(false);
      setSelectedAssignment(null);
    } catch (err) {
      showError('Failed to remove assignment');
    } finally {
      setProcessing(false);
    }
  };

  const getAssignmentStats = () => {
    // Add null check for assignments
    if (!assignments || assignments.length === 0) {
      return {
        total: 0,
        staff: 0,
        room: 0,
        permanent: 0,
        temporary: 0
      };
    }

    return {
      total: assignments.length,
      staff: assignments.filter(a => a.assignmentType === 'STAFF_ASSIGNMENT').length,
      room: assignments.filter(a => a.assignmentType === 'ROOM_ASSIGNMENT').length,
      permanent: assignments.filter(a => a.assignmentPeriod === 'PERMANENT').length,
      temporary: assignments.filter(a => a.assignmentPeriod === 'TEMPORARY').length
    };
  };

  const stats = getAssignmentStats();

  return (
    <div className="admin-content">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>Equipment Assignments</h1>
            <p className="admin-subtitle">
              Manage equipment assignments to staff and rooms
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAssignModal(true)}
          >
            <i className="fas fa-user-plus"></i>
            Create Assignment
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-item available">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Assignments</div>
        </div>
        <div className="stat-item library">
          <div className="stat-value">{stats.staff}</div>
          <div className="stat-label">Staff Assignments</div>
        </div>
        <div className="stat-item study">
          <div className="stat-value">{stats.room}</div>
          <div className="stat-label">Room Assignments</div>
        </div>
        <div className="stat-item disabled">
          <div className="stat-value">{stats.permanent}</div>
          <div className="stat-label">Permanent</div>
        </div>
        <div className="stat-item maintenance">
          <div className="stat-value">{stats.temporary}</div>
          <div className="stat-label">Temporary</div>
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
                    placeholder="Search assignments..."
                    value={filters.keyword}
                    onChange={(e) => updateFilters({ keyword: e.target.value })}
                    className="form-control"
                  />
                  <i className="fas fa-search search-icon"></i>
                </div>
              </div>
              
              <div className="filter-item">
                <label>Assignment Type</label>
                <select
                  value={filters.assignmentType}
                  onChange={(e) => updateFilters({ assignmentType: e.target.value })}
                  className="form-control"
                >
                  <option value="">All Types</option>
                  <option value="STAFF_ASSIGNMENT">Staff Assignment</option>
                  <option value="ROOM_ASSIGNMENT">Room Assignment</option>
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
              onClick={() => console.log('Bulk remove assignments')}
            >
              Remove Selected
            </button>
          </div>
        </div>
      )}

      {loadingAssignments && <LoadingSpinner />}

      {/* Assignments Table */}
      <div className="admin-card">
        <div className="card-body">
          {filteredAssignments.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-user-slash"></i>
              <h3>No Assignments Found</h3>
              <p>No equipment assignments match your search. Create your first assignment.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAssignModal(true)}
              >
                <i className="fas fa-user-plus"></i>
                Create First Assignment
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onChange={() => {
                          if (selectedItems.length === filteredAssignments.length) {
                            clearSelection();
                          } else {
                            filteredAssignments.forEach(a => toggleItemSelection(a.id));
                          }
                        }}
                        checked={selectedItems.length === filteredAssignments.length && filteredAssignments.length > 0}
                      />
                    </th>
                    <th>Equipment</th>
                    <th>Serial Number</th>
                    <th>Assignment Type</th>
                    <th>Assigned To</th>
                    <th>Period</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Assigned By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map(assignment => (
                    <tr key={assignment.id} className={selectedItems.includes(assignment.id) ? 'selected' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(assignment.id)}
                          onChange={() => toggleItemSelection(assignment.id)}
                        />
                      </td>
                      <td>
                        <div className="equipment-info">
                          <strong>{assignment.equipmentName || 'Unknown Equipment'}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="serial-badge">{assignment.serialNumber || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="assignment-type-badge">
                          {formatAssignmentType(assignment.assignmentType) || 'Unknown Type'}
                        </span>
                      </td>
                      <td>
                        <div className="assigned-to-info">
                          <i className={`fas ${
                            assignment.assignmentType === 'STAFF_ASSIGNMENT' ? 'fa-user' : 'fa-door-open'
                          }`}></i>
                          <span>{assignment.assignedToName || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`period-badge ${assignment.assignmentPeriod ? assignment.assignmentPeriod.toLowerCase() : 'unknown'}`}>
                          {assignment.assignmentPeriod || 'Unknown'}
                        </span>
                      </td>
                      <td>{assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : '-'}
                      </td>
                      <td>{assignment.assignedBy || 'Unknown'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowRemoveModal(true);
                            }}
                            title="Remove Assignment"
                          >
                            <i className="fas fa-user-minus"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => console.log('View assignment details', assignment.id)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        show={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSubmit={handleCreateAssignment}
        equipment={equipment}
        equipmentUnits={equipmentUnits}
        loading={processing}
      />

      {/* Remove Assignment Modal */}
      <RemoveAssignmentModal
        show={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setSelectedAssignment(null);
        }}
        onSubmit={handleRemoveAssignment}
        assignment={selectedAssignment}
        loading={processing}
      />
    </div>
  );
};

// Simple Create Assignment Modal Component
const CreateAssignmentModal = ({ show, onClose, onSubmit, equipment, equipmentUnits, loading }) => {
  const [formData, setFormData] = useState({
    equipmentId: '',
    selectedUnits: [],
    assignmentType: 'STAFF_ASSIGNMENT',
    assignedToName: '',
    assignmentPeriod: 'PERMANENT',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const [availableUnits, setAvailableUnits] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      setFormData({
        equipmentId: '',
        selectedUnits: [],
        assignmentType: 'STAFF_ASSIGNMENT',
        assignedToName: '',
        assignmentPeriod: 'PERMANENT',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
      setAvailableUnits([]);
      setErrors({});
    }
  }, [show]);

  const handleEquipmentChange = async (equipmentId) => {
    setFormData(prev => ({
      ...prev,
      equipmentId,
      selectedUnits: []
    }));

    if (equipmentId) {
      try {
        const units = await getAvailableUnitsForEquipment(equipmentId);
        setAvailableUnits(units);
      } catch (err) {
        setAvailableUnits([]);
      }
    } else {
      setAvailableUnits([]);
    }
  };

  const handleUnitSelection = (unitId) => {
    setFormData(prev => {
      const isSelected = prev.selectedUnits.includes(unitId);
      return {
        ...prev,
        selectedUnits: isSelected
          ? prev.selectedUnits.filter(id => id !== unitId)
          : [...prev.selectedUnits, unitId]
      };
    });
  };

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
    
    if (formData.selectedUnits.length === 0) {
      newErrors.selectedUnits = 'Please select at least one equipment unit';
    }

    if (!formData.assignedToName.trim()) {
      newErrors.assignedToName = 'Assigned to field is required';
    }

    if (formData.assignmentPeriod === 'TEMPORARY' && !formData.endDate) {
      newErrors.endDate = 'End date is required for temporary assignments';
    }

    if (formData.endDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
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
      // Create assignments for each selected unit
      const assignments = formData.selectedUnits.map(unitId => ({
        equipmentUnitId: parseInt(unitId),
        assignmentType: formData.assignmentType,
        assignedToName: formData.assignedToName.trim(),
        assignmentPeriod: formData.assignmentPeriod,
        startDate: formData.startDate + 'T00:00:00',
        endDate: formData.endDate ? formData.endDate + 'T23:59:59' : null
      }));

      // Submit all assignments
      for (const assignment of assignments) {
        await onSubmit(assignment);
      }
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  if (!show) return null;

  const selectedUnitsInfo = availableUnits.filter(unit => 
    formData.selectedUnits.includes(unit.id.toString())
  );

  return (
    <div className="modal-backdrop">
      <div className="modal-container large-modal">
        <div className="modal-header">
          <h3>Create Equipment Assignment</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-section">
              <h4>Equipment Selection</h4>
              
              <div className="form-group">
                <label>Equipment Type *</label>
                <select
                  value={formData.equipmentId}
                  onChange={(e) => handleEquipmentChange(e.target.value)}
                  className="form-control"
                >
                  <option value="">Select Equipment</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Equipment Units * (Select multiple)</label>
                <div className={`units-selection ${errors.selectedUnits ? 'error' : ''}`}>
                  {availableUnits.length > 0 ? (
                    <div className="units-list">
                      {availableUnits.map(unit => (
                        <div key={unit.id} className="unit-item">
                          <label className="unit-checkbox">
                            <input
                              type="checkbox"
                              checked={formData.selectedUnits.includes(unit.id.toString())}
                              onChange={() => handleUnitSelection(unit.id.toString())}
                            />
                            <span className="checkmark"></span>
                            <div className="unit-info">
                              <strong>{unit.serialNumber}</strong>
                              <span className="unit-condition">{unit.condition}</span>
                              {unit.purchaseDate && (
                                <span className="unit-date">
                                  Purchased: {new Date(unit.purchaseDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-units">
                      {formData.equipmentId ? 'No available units for this equipment' : 'Select equipment first'}
                    </div>
                  )}
                </div>
                {errors.selectedUnits && <div className="error-message">{errors.selectedUnits}</div>}
                
                {selectedUnitsInfo.length > 0 && (
                  <div className="selected-summary">
                    <strong>{selectedUnitsInfo.length} units selected:</strong>
                    <div className="selected-units">
                      {selectedUnitsInfo.map(unit => (
                        <span key={unit.id} className="selected-unit-tag">
                          {unit.serialNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h4>Assignment Details</h4>
              
              <div className="form-group">
                <label>Assignment Type *</label>
                <select
                  name="assignmentType"
                  value={formData.assignmentType}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="STAFF_ASSIGNMENT">Staff Assignment</option>
                  <option value="ROOM_ASSIGNMENT">Room Assignment</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  {formData.assignmentType === 'STAFF_ASSIGNMENT' ? 'Staff Name/ID' : 'Room Name/Number'} *
                </label>
                <input
                  type="text"
                  name="assignedToName"
                  value={formData.assignedToName}
                  onChange={handleChange}
                  className={`form-control ${errors.assignedToName ? 'error' : ''}`}
                  placeholder={
                    formData.assignmentType === 'STAFF_ASSIGNMENT' 
                      ? 'e.g., John Doe or Staff ID 123'
                      : 'e.g., Room 101 or Lab A'
                  }
                />
                {errors.assignedToName && <div className="error-message">{errors.assignedToName}</div>}
              </div>

              <div className="form-group">
                <label>Assignment Period *</label>
                <select
                  name="assignmentPeriod"
                  value={formData.assignmentPeriod}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="PERMANENT">Permanent</option>
                  <option value="TEMPORARY">Temporary</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                {formData.assignmentPeriod === 'TEMPORARY' && (
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className={`form-control ${errors.endDate ? 'error' : ''}`}
                    />
                    {errors.endDate && <div className="error-message">{errors.endDate}</div>}
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
                  Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Create Assignment{formData.selectedUnits.length > 1 ? 's' : ''}
                  {formData.selectedUnits.length > 1 && ` (${formData.selectedUnits.length})`}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Remove Assignment Modal Component
const RemoveAssignmentModal = ({ show, onClose, onSubmit, assignment, loading }) => {
  const [returnReason, setReturnReason] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      setReturnReason('');
      setErrors({});
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!returnReason.trim()) {
      setErrors({ reason: 'Return reason is required' });
      return;
    }

    try {
      await onSubmit(returnReason);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  if (!show || !assignment) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Remove Assignment</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="assignment-info">
              <h4>Assignment Details</h4>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Equipment:</strong> {assignment.equipmentName}
                </div>
                <div className="info-item">
                  <strong>Serial Number:</strong> {assignment.serialNumber}
                </div>
                <div className="info-item">
                  <strong>Assigned To:</strong> {assignment.assignedToName}
                </div>
                <div className="info-item">
                  <strong>Assignment Type:</strong> {formatAssignmentType(assignment.assignmentType)}
                </div>
                <div className="info-item">
                  <strong>Start Date:</strong> {new Date(assignment.startDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Reason for Removal *</label>
              <select
                value={returnReason}
                onChange={(e) => {
                  setReturnReason(e.target.value);
                  setErrors({});
                }}
                className={`form-control ${errors.reason ? 'error' : ''}`}
              >
                <option value="">Select a reason</option>
                <option value="Equipment maintenance required">Equipment maintenance required</option>
                <option value="Staff member left">Staff member left</option>
                <option value="Room change">Room change</option>
                <option value="Equipment upgrade">Equipment upgrade</option>
                <option value="Assignment period ended">Assignment period ended</option>
                <option value="Equipment reassignment">Equipment reassignment</option>
                <option value="Other">Other</option>
              </select>
              {errors.reason && <div className="error-message">{errors.reason}</div>}
            </div>

            {returnReason === 'Other' && (
              <div className="form-group">
                <label>Custom Reason</label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="form-control"
                  rows="3"
                  placeholder="Please specify the reason for removal"
                />
              </div>
            )}

            <div className="warning-message">
              <i className="fas fa-exclamation-triangle"></i>
              <p>This action will remove the assignment and make the equipment available for reassignment.</p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-warning" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Removing...
                </>
              ) : (
                <>
                  <i className="fas fa-user-minus"></i>
                  Remove Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentsPage;
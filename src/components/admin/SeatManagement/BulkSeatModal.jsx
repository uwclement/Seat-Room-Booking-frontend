import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../../hooks/useAdmin';

const BulkSeatModal = ({ isOpen, onClose, mode = 'create' }) => {
  const { 
    handleBulkCreateSeats, 
    handleBulkUpdate,
    selectedSeats,
    isLibrarian, 
    userLocation,
    loading 
  } = useAdmin();

  // Form state for bulk creation - EXACTLY like SeatModal
  const [createFormData, setCreateFormData] = useState({
    seatNumberPrefix: '',
    startNumber: 1,
    endNumber: 10,
    zoneType: '',
    hasDesktop: false,
    description: '',
    floar: ''
  });

  // Form state for bulk update
  const [updateFormData, setUpdateFormData] = useState({
    zoneType: '',
    hasDesktop: '',
    isDisabled: '',
    description: '',
    floar: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data - EXACTLY like SeatModal
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setCreateFormData({
          seatNumberPrefix: '',
          startNumber: 1,
          endNumber: 10,
          zoneType: 'SILENT',
          hasDesktop: false,
          description: '',
          floar: ''
        });
      } else {
        setUpdateFormData({
          zoneType: '',
          hasDesktop: '',
          isDisabled: '',
          description: '',
          floar: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, isLibrarian, userLocation]);

  // Handle input changes for create form
  const handleCreateInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle input changes for update form
  const handleUpdateInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdateFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' ? '' : value)
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate create form - EXACTLY like SeatModal
  const validateCreateForm = () => {
    const newErrors = {};

    if (!createFormData.seatNumberPrefix.trim()) {
      newErrors.seatNumberPrefix = 'Seat prefix is required (e.g., GS, MS)';
    }

    if (createFormData.startNumber < 1) {
      newErrors.startNumber = 'Start number must be at least 1';
    }

    if (createFormData.endNumber < createFormData.startNumber) {
      newErrors.endNumber = 'End number must be greater than start number';
    }

    if (!createFormData.zoneType) {
      newErrors.zoneType = 'Zone type is required';
    }

    if (createFormData.floar && (isNaN(createFormData.floar) || createFormData.floar < 1)) {
      newErrors.floar = 'Floor must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate update form
  const validateUpdateForm = () => {
    const newErrors = {};
    
    const hasUpdates = Object.values(updateFormData).some(value => value !== '');
    
    if (!hasUpdates) {
      newErrors.general = 'Please select at least one field to update';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission - EXACTLY like SeatModal
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = mode === 'create' ? validateCreateForm() : validateUpdateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    
    try {
      if (mode === 'create') {
        // EXACTLY like SeatModal - just add the bulk-specific fields
        const submitData = {
          ...createFormData,
          floar: createFormData.floar ? parseInt(createFormData.floar) : null
        };
        await handleBulkCreateSeats(submitData);
      } else {
        // Filter out empty values for update
        const submitData = Object.fromEntries(
          Object.entries(updateFormData).filter(([key, value]) => value !== '')
        );
        
        if (submitData.hasDesktop !== undefined) {
          submitData.hasDesktop = submitData.hasDesktop === 'true';
        }
        if (submitData.isDisabled !== undefined) {
          submitData.isDisabled = submitData.isDisabled === 'true';
        }
        if (submitData.floar) {
          submitData.floar = parseInt(submitData.floar);
        }
        
        await handleBulkUpdate(submitData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error in bulk operation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close - EXACTLY like SeatModal
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="seat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <i className="fas fa-layer-group"></i>
            {mode === 'create' ? 'Bulk Create Seats' : `Bulk Update ${selectedSeats.length} Seats`}
          </h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form className="seat-form" onSubmit={handleSubmit}>
          {mode === 'create' ? (
            // BULK CREATE FORM - Following SeatModal structure exactly
            <div className="form-grid">
              {/* Seat Number Prefix */}
              <div className="form-group">
                <label htmlFor="seatNumberPrefix" className="form-label">
                  Seat Prefix <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="seatNumberPrefix"
                  name="seatNumberPrefix"
                  value={createFormData.seatNumberPrefix}
                  onChange={handleCreateInputChange}
                  className={`form-input ${errors.seatNumberPrefix ? 'error' : ''}`}
                  placeholder="e.g., GS, MS, A"
                  disabled={isSubmitting}
                />
                {errors.seatNumberPrefix && (
                  <span className="error-text">{errors.seatNumberPrefix}</span>
                )}
                <small className="help-text">
                  Will create seats like: {createFormData.seatNumberPrefix}001, {createFormData.seatNumberPrefix}002, etc.
                </small>
              </div>

              {/* Start Number */}
              <div className="form-group">
                <label htmlFor="startNumber" className="form-label">
                  Start Number <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="startNumber"
                  name="startNumber"
                  value={createFormData.startNumber}
                  onChange={handleCreateInputChange}
                  className={`form-input ${errors.startNumber ? 'error' : ''}`}
                  min="1"
                  disabled={isSubmitting}
                />
                {errors.startNumber && (
                  <span className="error-text">{errors.startNumber}</span>
                )}
              </div>

              {/* End Number */}
              <div className="form-group">
                <label htmlFor="endNumber" className="form-label">
                  End Number <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="endNumber"
                  name="endNumber"
                  value={createFormData.endNumber}
                  onChange={handleCreateInputChange}
                  className={`form-input ${errors.endNumber ? 'error' : ''}`}
                  min="1"
                  disabled={isSubmitting}
                />
                {errors.endNumber && (
                  <span className="error-text">{errors.endNumber}</span>
                )}
                <small className="help-text">
                  Will create {Math.max(0, createFormData.endNumber - createFormData.startNumber + 1)} seats
                </small>
              </div>

              {/* Zone Type - EXACTLY like SeatModal */}
              <div className="form-group">
                <label htmlFor="zoneType" className="form-label">
                  Zone Type <span className="required">*</span>
                </label>
                <select
                  id="zoneType"
                  name="zoneType"
                  value={createFormData.zoneType}
                  onChange={handleCreateInputChange}
                  className={`form-input ${errors.zoneType ? 'error' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="SILENT">Silent Study</option>
                  <option value="COLLABORATION">Collaboration</option>
                </select>
                {errors.zoneType && (
                  <span className="error-text">{errors.zoneType}</span>
                )}
              </div>

              {/* Floor - EXACTLY like SeatModal */}
              <div className="form-group">
                <label htmlFor="floar" className="form-label">
                  Floor For Masoro Seats
                </label>
                <input
                  type="number"
                  id="floar"
                  name="floar"
                  value={createFormData.floar}
                  onChange={handleCreateInputChange}
                  className={`form-input ${errors.floar ? 'error' : ''}`}
                  placeholder="Floor number for Masoro Seats"
                  min="1"
                  disabled={isSubmitting}
                />
                {errors.floar && (
                  <span className="error-text">{errors.floar}</span>
                )}
              </div>
            </div>
          ) : (
            // BULK UPDATE FORM
            <div className="form-grid">
              <div className="bulk-update-info">
                <p><strong>{selectedSeats.length} seats selected for update</strong></p>
                <p>Select the fields you want to update. Empty fields will be ignored.</p>
              </div>

              {/* Zone Type */}
              <div className="form-group">
                <label htmlFor="zoneType" className="form-label">
                  Zone Type
                </label>
                <select
                  id="zoneType"
                  name="zoneType"
                  value={updateFormData.zoneType}
                  onChange={handleUpdateInputChange}
                  className="form-input"
                  disabled={isSubmitting}
                >
                  <option value="">Don't Change</option>
                  <option value="SILENT">Silent Study</option>
                  <option value="COLLABORATION">Collaboration</option>
                </select>
              </div>

              {/* Has Desktop */}
              <div className="form-group">
                <label htmlFor="hasDesktop" className="form-label">
                  Desktop Computer
                </label>
                <select
                  id="hasDesktop"
                  name="hasDesktop"
                  value={updateFormData.hasDesktop}
                  onChange={handleUpdateInputChange}
                  className="form-input"
                  disabled={isSubmitting}
                >
                  <option value="">Don't Change</option>
                  <option value="true">Has Desktop</option>
                  <option value="false">No Desktop</option>
                </select>
              </div>

              {/* Disabled Status */}
              <div className="form-group">
                <label htmlFor="isDisabled" className="form-label">
                  Status
                </label>
                <select
                  id="isDisabled"
                  name="isDisabled"
                  value={updateFormData.isDisabled}
                  onChange={handleUpdateInputChange}
                  className="form-input"
                  disabled={isSubmitting}
                >
                  <option value="">Don't Change</option>
                  <option value="false">Enable</option>
                  <option value="true">Disable</option>
                </select>
              </div>

              {/* Floor */}
              <div className="form-group">
                <label htmlFor="floar" className="form-label">
                  Floor For Masoro Seats
                </label>
                <input
                  type="number"
                  id="floar"
                  name="floar"
                  value={updateFormData.floar}
                  onChange={handleUpdateInputChange}
                  className="form-input"
                  placeholder="Leave empty to not change"
                  min="1"
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div className="form-group full-width">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={updateFormData.description}
                  onChange={handleUpdateInputChange}
                  className="form-textarea"
                  placeholder="Leave empty to not change description..."
                  rows="2"
                  disabled={isSubmitting}
                />
              </div>

              {errors.general && (
                <div className="form-group full-width">
                  <span className="error-text">{errors.general}</span>
                </div>
              )}
            </div>
          )}

          {/* Desktop Checkbox - EXACTLY like SeatModal, only for create mode */}
          {mode === 'create' && (
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="hasDesktop"
                  checked={createFormData.hasDesktop}
                  onChange={handleCreateInputChange}
                  className="checkbox-input"
                  disabled={isSubmitting}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">
                  <i className="fas fa-desktop"></i>
                  Has Desktop Computer
                </span>
              </label>
            </div>
          )}

          {/* Description - EXACTLY like SeatModal, only for create mode */}
          {mode === 'create' && (
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={createFormData.description}
                onChange={handleCreateInputChange}
                className="form-textarea"
                placeholder="Optional description for all seats..."
                rows="3"
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Form Actions - EXACTLY like SeatModal */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <i className={`fas ${mode === 'create' ? 'fa-plus' : 'fa-edit'}`}></i>
                  {mode === 'create' ? 'Create Seats' : 'Update Seats'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkSeatModal;
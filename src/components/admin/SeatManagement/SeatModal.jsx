import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../../hooks/useAdmin';
import '../../../assets/css/SeatModal.css';

const SeatModal = ({ isOpen, onClose, seatToEdit = null }) => {
  const { 
    handleCreateSeat, 
    handleUpdateSeat, 
    isLibrarian, 
    isAdmin, 
    userLocation,
    loading 
  } = useAdmin();

  // Form state
  const [formData, setFormData] = useState({
    seatNumber: '',
    location: '',
    zoneType: '',
    hasDesktop: false,
    description: '',
    floar: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (seatToEdit) {
      // Edit mode - populate with existing seat data
      setFormData({
        seatNumber: seatToEdit.seatNumber || '',
        location: seatToEdit.location || '',
        zoneType: seatToEdit.zoneType || '',
        hasDesktop: seatToEdit.hasDesktop || false,
        description: seatToEdit.description || '',
        floar: seatToEdit.floar || ''
      });
    } else {
      // Create mode - set defaults
      setFormData({
        seatNumber: '',
        location: isLibrarian ? userLocation : '',
        zoneType: 'SILENT',
        hasDesktop: false,
        description: '',
        floar: ''
      });
    }
    setErrors({});
  }, [seatToEdit, isLibrarian, userLocation, isOpen]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.seatNumber.trim()) {
      newErrors.seatNumber = 'Seat number is required';
    }

    if (!formData.zoneType) {
      newErrors.zoneType = 'Zone type is required';
    }

    if (formData.floar && (isNaN(formData.floar) || formData.floar < 1)) {
      newErrors.floar = 'Floor must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        floar: formData.floar ? parseInt(formData.floar) : null
      };

      if (seatToEdit) {
        await handleUpdateSeat(seatToEdit.id, submitData);
      } else {
        await handleCreateSeat(submitData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting seat:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        seatNumber: '',
        location: '',
        zoneType: '',
        hasDesktop: false,
        description: '',
        floar: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="seat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <i className="fas fa-chair"></i>
            {seatToEdit ? 'Edit Seat' : 'Create New Seat (Seat can only be created by Librarian)'}
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
          <div className="form-grid">
            {/* Seat Number */}
            <div className="form-group">
              <label htmlFor="seatNumber" className="form-label">
                Seat Number <span className="required">*</span>
              </label>
              <input
                type="text"
                id="seatNumber"
                name="seatNumber"
                value={formData.seatNumber}
                onChange={handleInputChange}
                className={`form-input ${errors.seatNumber ? 'error' : ''}`}
                placeholder="e.g., GS001, MS101"
                disabled={isSubmitting}
              />
              {errors.seatNumber && (
                <span className="error-text">{errors.seatNumber}</span>
              )}
            </div>

            {/* Location */}
            {/* <div className="form-group">
              <label htmlFor="location" className="form-label">
                Location 
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`form-input ${errors.location ? 'error' : ''} ${isLibrarian ? 'disabled' : ''}`}
                disabled={isLibrarian || isSubmitting}
              >
              </select>
              {isLibrarian && (
                <small className="location-note">
                  <i className="fas fa-info-circle"></i>
                  Location is automatically set to your assigned location
                </small>
              )}
              {errors.location && (
                <span className="error-text">{errors.location}</span>
              )}
            </div> */}

            {/* Zone Type */}
            <div className="form-group">
              <label htmlFor="zoneType" className="form-label">
                Zone Type <span className="required">*</span>
              </label>
              <select
                id="zoneType"
                name="zoneType"
                value={formData.zoneType}
                onChange={handleInputChange}
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

            {/* Floor */}
            <div className="form-group">
              <label htmlFor="floar" className="form-label">
                Floor For Masoro Seats
              </label>
              <input
                type="number"
                id="floar"
                name="floar"
                value={formData.floar}
                onChange={handleInputChange}
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

          {/* Desktop Checkbox */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hasDesktop"
                checked={formData.hasDesktop}
                onChange={handleInputChange}
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

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Optional description or notes about this seat..."
              rows="3"
              disabled={isSubmitting}
            />
          </div>

          {/* Form Actions */}
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
                  {seatToEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <i className={`fas ${seatToEdit ? 'fa-save' : 'fa-plus'}`}></i>
                  {seatToEdit ? 'Update Seat' : 'Create Seat'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeatModal;
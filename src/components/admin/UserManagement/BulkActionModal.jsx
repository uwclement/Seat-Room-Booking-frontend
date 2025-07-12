import React, { useState } from 'react';
import { useUserManagement } from '../../../hooks/useUserManagement';

const BulkActionModal = ({ show, selectedUsers, onClose }) => {
  const { users, handleBulkAction, loading } = useUserManagement();
  const [selectedAction, setSelectedAction] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const getSelectedUserDetails = () => {
    return users.filter(user => selectedUsers.includes(user.id));
  };

  const bulkActions = [
    {
      value: 'ENABLE',
      label: 'Enable Users',
      description: 'Activate selected user accounts',
      icon: 'fa-check-circle',
      color: 'success',
      confirmText: 'ENABLE',
      destructive: false
    },
    {
      value: 'DISABLE',
      label: 'Disable Users',
      description: 'Deactivate selected user accounts',
      icon: 'fa-ban',
      color: 'warning',
      confirmText: 'DISABLE',
      destructive: true
    },
    {
      value: 'RESET_PASSWORD',
      label: 'Reset Passwords',
      description: 'Reset passwords for selected staff users',
      icon: 'fa-key',
      color: 'info',
      confirmText: 'RESET',
      destructive: false
    },
    {
      value: 'DELETE',
      label: 'Delete Users',
      description: 'Permanently delete selected users (Staff only)',
      icon: 'fa-trash',
      color: 'danger',
      confirmText: 'DELETE',
      destructive: true
    }
  ];

  const selectedUserDetails = getSelectedUserDetails();
  const selectedActionDetails = bulkActions.find(action => action.value === selectedAction);

  const canPerformAction = () => {
    if (!selectedAction || selectedUsers.length === 0) return false;
    
    // Check specific action constraints
    switch (selectedAction) {
      case 'DELETE':
        // Only allow deletion of staff users
        return selectedUserDetails.every(user => user.userType === 'STAFF');
      case 'RESET_PASSWORD':
        // Only allow password reset for staff users
        return selectedUserDetails.every(user => user.userType === 'STAFF');
      default:
        return true;
    }
  };

  const getActionValidationMessage = () => {
    if (!selectedAction) return '';
    
    switch (selectedAction) {
      case 'DELETE':
        const studentCount = selectedUserDetails.filter(user => user.userType === 'STUDENT').length;
        if (studentCount > 0) {
          return `Cannot delete ${studentCount} student account(s). Only staff accounts can be deleted.`;
        }
        break;
      case 'RESET_PASSWORD':
        const studentPasswordCount = selectedUserDetails.filter(user => user.userType === 'STUDENT').length;
        if (studentPasswordCount > 0) {
          return `Cannot reset passwords for ${studentPasswordCount} student account(s). Only staff passwords can be reset by admin.`;
        }
        break;
      default:
        return '';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canPerformAction()) return;
    
    if (selectedActionDetails?.destructive && confirmText !== selectedActionDetails.confirmText) {
      return;
    }
    
    try {
      await handleBulkAction(selectedAction);
      onClose();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const isFormValid = () => {
    if (!canPerformAction()) return false;
    
    if (selectedActionDetails?.destructive) {
      return confirmText === selectedActionDetails.confirmText;
    }
    
    return true;
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Bulk Actions</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Selected Users Summary */}
            <div className="selected-users-summary">
              <h4>Selected Users ({selectedUsers.length})</h4>
              <div className="user-summary">
                {selectedUserDetails.map(user => (
                  <div key={user.id} className="user-summary-item">
                    <span className="user-name">{user.fullName}</span>
                    <span className="user-type">{user.userType}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Selection */}
            <div className="action-selection">
              <h4>Select Action</h4>
              <div className="action-grid">
                {bulkActions.map(action => (
                  <label 
                    key={action.value}
                    className={`action-option ${selectedAction === action.value ? 'selected' : ''} ${action.color}`}
                  >
                    <input
                      type="radio"
                      name="bulkAction"
                      value={action.value}
                      checked={selectedAction === action.value}
                      onChange={(e) => setSelectedAction(e.target.value)}
                    />
                    <div className="action-content">
                      <div className="action-icon">
                        <i className={`fas ${action.icon}`}></i>
                      </div>
                      <div className="action-details">
                        <div className="action-label">{action.label}</div>
                        <div className="action-description">{action.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Validation Message */}
            {selectedAction && getActionValidationMessage() && (
              <div className="validation-message error">
                <i className="fas fa-exclamation-triangle"></i>
                {getActionValidationMessage()}
              </div>
            )}

            {/* Confirmation for Destructive Actions */}
            {selectedActionDetails && selectedActionDetails.destructive && canPerformAction() && (
              <div className="confirmation-section">
                <h4>Confirmation Required</h4>
                <p>
                  This action is <strong>irreversible</strong>. Please type{' '}
                  <code>{selectedActionDetails.confirmText}</code> to confirm.
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={`Type "${selectedActionDetails.confirmText}" to confirm`}
                  className="form-control"
                />
              </div>
            )}

            {/* Action Preview */}
            {selectedActionDetails && canPerformAction() && (
              <div className="action-preview">
                <h4>Action Preview</h4>
                <div className={`preview-card ${selectedActionDetails.color}`}>
                  <div className="preview-icon">
                    <i className={`fas ${selectedActionDetails.icon}`}></i>
                  </div>
                  <div className="preview-content">
                    <div className="preview-title">{selectedActionDetails.label}</div>
                    <div className="preview-description">
                      {selectedActionDetails.description}
                    </div>
                    <div className="preview-count">
                      Affects {selectedUsers.length} user(s)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn btn-${selectedActionDetails?.color || 'primary'}`}
              disabled={!isFormValid() || loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className={`fas ${selectedActionDetails?.icon || 'fa-check'}`}></i>
                  {selectedActionDetails?.label || 'Execute Action'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkActionModal;
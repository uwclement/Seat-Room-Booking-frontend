import React, { useState, useEffect } from 'react';
import { useUserManagement } from '../../../hooks/useUserManagement';
import Input from '../../common/Input';
import Button from '../../common/Button';

const EditUserModal = ({ show, user, onClose }) => {
  const { handleUpdateStaff, loading } = useUserManagement();
  
  const [formData, setFormData] = useState({
    identifier: '',
    fullName: '',
    email: '',
    phone: '',
    location: '',
    workingDay: '',
    activeToday: false,
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        identifier: user.identifier || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        workingDay: user.workingDay || '',
        activeToday: user.activeToday || false,
        isDefault: user.isDefault || false
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleUpdateStaff(user.id, formData);
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (!show) return null;

  const isLibrarian = user?.roles?.includes('ROLE_LIBRARIAN');

  return (
    <div className="modal-backdrop">
      <div className="modal-container large">
        <div className="modal-header">
          <h3>User: {user?.identifier}</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <Input
                label="Full Name"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                disabled
              />
            </div>

            <div className="form-row">
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <div className="form-group">
                <label>Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="form-control"
                >
                  <option value="GISHUSHU">Gishushu Campus</option>
                  <option value="MASORO">Masoro Campus</option>
                </select>
              </div>
            </div>

            {isLibrarian && (
              <>
                <div className="form-row">
                  <Input
                    label="Working Day"
                    type="date"
                    value={formData.workingDay}
                    onChange={(e) => setFormData({...formData, workingDay: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.activeToday}
                      onChange={(e) => setFormData({...formData, activeToday: e.target.checked})}
                    />
                    Active Today
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                    />
                    Default Librarian
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
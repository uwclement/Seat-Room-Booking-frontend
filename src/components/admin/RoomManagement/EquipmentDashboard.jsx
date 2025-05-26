import React, { useState, useEffect } from 'react';
import { 
  getAllEquipment, 
  createEquipment, 
  updateEquipment, 
  deleteEquipment, 
  toggleEquipmentAvailability,
  searchEquipment 
} from '../../../api/rooms';
import Alert from '../../common/Alert';
import LoadingSpinner from '../../common/LoadingSpinner';
import ToastNotification from '../../common/ToastNotification';

const EquipmentDashboard = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const data = searchKeyword ? await searchEquipment(searchKeyword) : await getAllEquipment();
      setEquipment(data);
    } catch (err) {
      setError('Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [searchKeyword]);

  const handleCreate = async (equipmentData) => {
    setLoading(true);
    try {
      const newEquipment = await createEquipment(equipmentData);
      setEquipment(prev => [newEquipment, ...prev]);
      setSuccess('Equipment created successfully');
      setShowCreateModal(false);
    } catch (err) {
      setError('Failed to create equipment');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleUpdate = async (equipmentData) => {
    if (!selectedEquipment) return;
    
    setLoading(true);
    try {
      const updatedEquipment = await updateEquipment(selectedEquipment.id, equipmentData);
      setEquipment(prev => prev.map(eq => eq.id === selectedEquipment.id ? updatedEquipment : eq));
      setSuccess('Equipment updated successfully');
      setShowEditModal(false);
      setSelectedEquipment(null);
    } catch (err) {
      setError('Failed to update equipment');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      setLoading(true);
      try {
        await deleteEquipment(id);
        setEquipment(prev => prev.filter(eq => eq.id !== id));
        setSuccess('Equipment deleted successfully');
      } catch (err) {
        setError('Failed to delete equipment');
      } finally {
        setLoading(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    }
  };

  const handleToggleAvailability = async (id) => {
    setLoading(true);
    try {
      const updatedEquipment = await toggleEquipmentAvailability(id);
      setEquipment(prev => prev.map(eq => eq.id === id ? updatedEquipment : eq));
      setSuccess('Equipment status updated successfully');
    } catch (err) {
      setError('Failed to update equipment status');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>Equipment Management</h1>
            <p className="admin-subtitle">
              Manage equipment inventory and availability
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

      {error && (
        <Alert
          type="danger"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {success && (
        <ToastNotification
          type="success"
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      {/* Search */}
      <div className="admin-card">
        <div className="card-body">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="form-control"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {/* Equipment List */}
      <div className="admin-card">
        <div className="card-body">
          {equipment.length === 0 ? (
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
              {equipment.map(eq => (
                <div key={eq.id} className="equipment-card">
                  <div className="equipment-header">
                    <h3>{eq.name}</h3>
                    <span className={`status-badge ${eq.available ? 'green' : 'red'}`}>
                      {eq.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  
                  {eq.description && (
                    <p className="equipment-description">{eq.description}</p>
                  )}
                  
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
                    >
                      <i className={`fas ${eq.available ? 'fa-pause' : 'fa-play'}`}></i>
                      {eq.available ? 'Disable' : 'Enable'}
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(eq.id)}
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Equipment Form Modal */}
      <EquipmentFormModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        title="Create Equipment"
        loading={loading}
      />

      <EquipmentFormModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEquipment(null);
        }}
        onSubmit={handleUpdate}
        equipment={selectedEquipment}
        title="Edit Equipment"
        loading={loading}
      />
    </div>
  );
};

// Equipment Form Modal Component
const EquipmentFormModal = ({ 
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
    available: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        description: equipment.description || '',
        available: equipment.available !== false
      });
    } else {
      setFormData({
        name: '',
        description: '',
        available: true
      });
    }
    setErrors({});
  }, [equipment, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      <div className="modal-container">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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

export default EquipmentDashboard;
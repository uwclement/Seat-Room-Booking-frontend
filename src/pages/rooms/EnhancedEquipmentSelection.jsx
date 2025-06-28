import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getPublicStudentEquipment, getPublicAvailableEquipment } from '../../api/equipmentRequests';

const EnhancedEquipmentSelection = ({ selectedEquipment, onEquipmentChange, disabled = false }) => {
  const { isProfessor } = useAuth();
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAvailableEquipment();
  }, [isProfessor]);

  const loadAvailableEquipment = async () => {
    setLoading(true);
    try {
      const equipment = isProfessor() 
        ? await getPublicAvailableEquipment()
        : await getPublicStudentEquipment();
      setAvailableEquipment(equipment);
    } catch (err) {
      setError('Failed to load available equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentToggle = (equipmentId) => {
    if (disabled) return;
    
    const newSelection = selectedEquipment.includes(equipmentId)
      ? selectedEquipment.filter(id => id !== equipmentId)
      : [...selectedEquipment, equipmentId];
    
    onEquipmentChange(newSelection);
  };

  if (loading) {
    return (
      <div className="equipment-loading">
        <i className="fas fa-spinner fa-spin"></i>
        Loading equipment...
      </div>
    );
  }

  if (error) {
    return (
      <div className="equipment-error">
        <i className="fas fa-exclamation-triangle"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="enhanced-equipment-selection">
      <div className="equipment-header">
        <h4>Request Equipment</h4>
        <div className="equipment-info">
          {isProfessor() ? (
            <span className="info-text">
              <i className="fas fa-info-circle"></i>
              As a professor, you can request any available equipment
            </span>
          ) : (
            <span className="info-text">
              <i className="fas fa-info-circle"></i>
              Only student-approved equipment can be requested
            </span>
          )}
        </div>
      </div>

      {availableEquipment.length === 0 ? (
        <div className="no-equipment">
          <i className="fas fa-tools"></i>
          <p>No equipment available for your role.</p>
        </div>
      ) : (
        <div className="equipment-grid">
          {availableEquipment.map(equipment => (
            <div 
              key={equipment.id} 
              className={`equipment-item ${selectedEquipment.includes(equipment.id) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            >
              <label className="equipment-checkbox">
                <input
                  type="checkbox"
                  checked={selectedEquipment.includes(equipment.id)}
                  onChange={() => handleEquipmentToggle(equipment.id)}
                  disabled={disabled || !equipment.available}
                />
                <div className="equipment-info">
                  <div className="equipment-name">{equipment.name}</div>
                  {equipment.description && (
                    <div className="equipment-description">{equipment.description}</div>
                  )}
                  
                  <div className="equipment-availability">
                    {equipment.quantity && (
                      <span className="quantity-info">
                        <i className="fas fa-cubes"></i>
                        {equipment.availableQuantity}/{equipment.quantity} available
                      </span>
                    )}
                    
                    {!equipment.available && (
                      <span className="unavailable-notice">
                        <i className="fas fa-times-circle"></i>
                        Currently unavailable
                      </span>
                    )}
                    
                    {equipment.availableQuantity === 0 && equipment.available && (
                      <span className="out-of-stock">
                        <i className="fas fa-exclamation-triangle"></i>
                        Out of stock
                      </span>
                    )}
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
      )}

      {selectedEquipment.length > 0 && (
        <div className="selection-summary">
          <h5>Selected Equipment ({selectedEquipment.length})</h5>
          <div className="selected-items">
            {selectedEquipment.map(equipmentId => {
              const equipment = availableEquipment.find(eq => eq.id === equipmentId);
              return equipment ? (
                <span key={equipmentId} className="selected-item">
                  {equipment.name}
                  <button 
                    type="button"
                    onClick={() => handleEquipmentToggle(equipmentId)}
                    disabled={disabled}
                    className="remove-item"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ) : null;
            })}
          </div>
          
          <div className="equipment-notice">
            <i className="fas fa-info-circle"></i>
            Equipment requests require separate approval from the Equipment Admin
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedEquipmentSelection;
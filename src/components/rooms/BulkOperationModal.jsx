import React, { useState } from 'react';

const BulkOperationModal = ({ show, onClose, onSubmit, selectedCount, loading }) => {
  const [operation, setOperation] = useState('enable');
  const [maintenanceData, setMaintenanceData] = useState({
    startTime: '',
    endTime: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    switch (operation) {
      case 'enable':
        onSubmit('enable');
        break;
      case 'disable':
        onSubmit('disable');
        break;
      case 'set_maintenance':
        if (maintenanceData.startTime && maintenanceData.endTime) {
          onSubmit('set_maintenance', {
            maintenanceStart: maintenanceData.startTime,
            maintenanceEnd: maintenanceData.endTime,
            maintenanceNotes: maintenanceData.notes
          });
        }
        break;
      case 'clear_maintenance':
        onSubmit('clear_maintenance');
        break;
      default:
        break;
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Bulk Operation ({selectedCount} rooms)</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Select Operation</label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="form-control"
              >
                <option value="enable">Enable All Rooms</option>
                <option value="disable">Disable All Rooms</option>
                <option value="set_maintenance">Set Maintenance Window</option>
                <option value="clear_maintenance">Clear Maintenance Window</option>
              </select>
            </div>

            {operation === 'set_maintenance' && (
              <div className="maintenance-fields">
                <div className="form-group">
                  <label>Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={maintenanceData.startTime}
                    onChange={(e) => setMaintenanceData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={maintenanceData.endTime}
                    onChange={(e) => setMaintenanceData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="form-control"
                    required
                    min={maintenanceData.startTime}
                  />
                </div>

                <div className="form-group">
                  <label>Maintenance Notes</label>
                  <textarea
                    value={maintenanceData.notes}
                    onChange={(e) => setMaintenanceData(prev => ({ ...prev, notes: e.target.value }))}
                    className="form-control"
                    rows="3"
                    placeholder="Optional notes about the maintenance work"
                  />
                </div>
              </div>
            )}

            <div className="operation-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <span>This operation will affect {selectedCount} rooms.</span>
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
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  Apply Operation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
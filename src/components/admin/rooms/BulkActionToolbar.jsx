import React from 'react';

const BulkActionToolbar = ({ selectedCount, onBulkEnable, onBulkDisable, onBulkMaintenance, onBulkDelete, onClearSelection }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-action-toolbar">
      <div className="bulk-info">
        <span className="selection-count">
          {selectedCount} room{selectedCount > 1 ? 's' : ''} selected
        </span>
        <button className="btn btn-sm btn-outline" onClick={onClearSelection}>
          Clear Selection
        </button>
      </div>
      
      <div className="bulk-actions">
        <button className="btn btn-sm btn-success" onClick={onBulkEnable}>
          <i className="fas fa-play"></i>
          Enable All
        </button>
        <button className="btn btn-sm btn-warning" onClick={onBulkDisable}>
          <i className="fas fa-pause"></i>
          Disable All
        </button>
        <button className="btn btn-sm btn-secondary" onClick={onBulkMaintenance}>
          <i className="fas fa-tools"></i>
          Set Maintenance
        </button>
        <button className="btn btn-sm btn-danger" onClick={onBulkDelete}>
          <i className="fas fa-trash"></i>
          Delete All
        </button>
      </div>
    </div>
  );
};
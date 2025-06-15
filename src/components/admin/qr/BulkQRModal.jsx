import React, { useState } from 'react';
import { useQRCode } from '../../../context/QRCodeContext';

const BulkQRModal = ({ show, onClose, type, selectedIds = [] }) => {
  const { bulkGenerateQR, loading } = useQRCode();
  const [options, setOptions] = useState({
    generateForAll: false,
    generateForMissing: true,
    regenerateExisting: false,
    generateAndDownload: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const request = {
      ...options,
      resourceIds: selectedIds.length > 0 ? selectedIds : null
    };

    try {
      await bulkGenerateQR(type, request);
      onClose();
    } catch (error) {
      console.error('Bulk generation failed:', error);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Bulk Generate QR Codes</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {selectedIds.length > 0 ? (
              <p className="info-message">
                <i className="fas fa-info-circle"></i>
                Generating QR codes for {selectedIds.length} selected {type}
              </p>
            ) : (
              <div className="form-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="generateOption"
                    checked={options.generateForAll}
                    onChange={() => setOptions({
                      ...options,
                      generateForAll: true,
                      generateForMissing: false
                    })}
                  />
                  <span>Generate for all {type}</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="generateOption"
                    checked={options.generateForMissing}
                    onChange={() => setOptions({
                      ...options,
                      generateForAll: false,
                      generateForMissing: true
                    })}
                  />
                  <span>Generate only for {type} without QR codes</span>
                </label>
              </div>
            )}

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.regenerateExisting}
                  onChange={(e) => setOptions({
                    ...options,
                    regenerateExisting: e.target.checked
                  })}
                />
                <span>Regenerate existing QR codes</span>
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={options.generateAndDownload}
                  onChange={(e) => setOptions({
                    ...options,
                    generateAndDownload: e.target.checked
                  })}
                />
                <span>Download QR codes after generation</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate QR Codes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkQRModal;


import React, { useState } from 'react';
import { useQRCode } from '../../../context/QRCodeContext';

const BulkQRModal = ({ show, onClose, type, selectedIds = [] }) => {
  const { bulkGenerateQR, loading } = useQRCode();
  const [options, setOptions] = useState({
    scope: 'missing', // 'missing', 'all', 'selected'
    regenerateExisting: false,
    generateAndDownload: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // SIMPLIFIED: Build clear request based on user choice
    const request = {
      generateForAll: false,
      generateForMissing: false,
      regenerateExisting: options.regenerateExisting,
      generateAndDownload: options.generateAndDownload
    };

    // Set the scope based on user selection
    if (selectedIds && selectedIds.length > 0) {
      // If specific items selected, use those
      request.resourceIds = selectedIds;
    } else if (options.scope === 'all') {
      request.generateForAll = true;
    } else if (options.scope === 'missing') {
      request.generateForMissing = true;
    }

    try {
      await bulkGenerateQR(type, request);
      onClose();
    } catch (error) {
      console.error('Bulk generation failed:', error);
      // Error is handled in context
    }
  };

  // Reset options when modal opens
  React.useEffect(() => {
    if (show) {
      setOptions({
        scope: selectedIds.length > 0 ? 'selected' : 'missing',
        regenerateExisting: false,
        generateAndDownload: true
      });
    }
  }, [show, selectedIds.length]);

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Generate QR Codes</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* SIMPLIFIED: Clear scope selection */}
            <div className="form-group">
              <label className="form-label">What do you want to generate?</label>
              
              {selectedIds.length > 0 ? (
                <div className="selected-info">
                  <div className="info-badge">
                    <i className="fas fa-check-circle"></i>
                    Generate for {selectedIds.length} selected {type}
                  </div>
                </div>
              ) : (
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="scope"
                      value="missing"
                      checked={options.scope === 'missing'}
                      onChange={(e) => setOptions({...options, scope: e.target.value})}
                    />
                    <div className="radio-content">
                      <span className="radio-title">Only missing QR codes</span>
                      <span className="radio-desc">Generate for {type} that don't have QR codes yet</span>
                    </div>
                  </label>
                  
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="scope"
                      value="all"
                      checked={options.scope === 'all'}
                      onChange={(e) => setOptions({...options, scope: e.target.value})}
                    />
                    <div className="radio-content">
                      <span className="radio-title">All {type}</span>
                      <span className="radio-desc">Generate for every {type.slice(0, -1)} (may replace existing)</span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* SIMPLIFIED: Clear regenerate option */}
            <div className="form-group">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={options.regenerateExisting}
                  onChange={(e) => setOptions({
                    ...options,
                    regenerateExisting: e.target.checked
                  })}
                />
                <div className="checkbox-content">
                  <span className="checkbox-title">Replace existing QR codes</span>
                  <span className="checkbox-desc">Generate new QR codes even if they already exist</span>
                </div>
              </label>
            </div>

            {/* SIMPLIFIED: Clear download option */}
            <div className="form-group">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={options.generateAndDownload}
                  onChange={(e) => setOptions({
                    ...options,
                    generateAndDownload: e.target.checked
                  })}
                />
                <div className="checkbox-content">
                  <span className="checkbox-title">Download after generation</span>
                  <span className="checkbox-desc">Automatically download all generated QR codes as ZIP file</span>
                </div>
              </label>
            </div>

            {/* Preview what will happen */}
            <div className="preview-section">
              <h4>Summary:</h4>
              <ul className="preview-list">
                {selectedIds.length > 0 ? (
                  <li>✓ Generate QR codes for {selectedIds.length} selected {type}</li>
                ) : (
                  <>
                    {options.scope === 'missing' && (
                      <li>✓ Generate QR codes only for {type} without existing codes</li>
                    )}
                    {options.scope === 'all' && (
                      <li>✓ Generate QR codes for ALL {type}</li>
                    )}
                  </>
                )}
                {options.regenerateExisting ? (
                  <li>✓ Replace existing QR codes with new ones</li>
                ) : (
                  <li>✓ Skip {type} that already have QR codes</li>
                )}
                {options.generateAndDownload ? (
                  <li>✓ Download generated QR codes as ZIP file</li>
                ) : (
                  <li>✓ QR codes will be stored in system only</li>
                )}
              </ul>
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
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-qrcode"></i>
                  Generate QR Codes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkQRModal;
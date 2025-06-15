import React from 'react';
import { useQRCode } from '../../../context/QRCodeContext'; // ✅ Correct import

const QRCodeButton = ({ type, resourceId, resourceName, hasQR = false, onGenerated }) => {
  const { generateQR, handleSingleDownload, loading } = useQRCode(); // ✅ Use hook directly

  const handleGenerate = async () => {
    try {
      const response = await generateQR(type, resourceId);
      if (onGenerated) {
        onGenerated(response);
      }
    } catch (error) {
      console.error('Failed to generate QR:', error);
    }
  };

  const handleDownload = () => {
    handleSingleDownload(type, resourceId);
  };

  return (
    <div className="qr-code-actions">
      {!hasQR ? (
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={handleGenerate}
          disabled={loading}
          title="Generate QR Code"
        >
          <i className="fas fa-qrcode"></i>
          {loading ? ' Generating...' : ' Generate QR'}
        </button>
      ) : (
        <>
          <button
            className="btn btn-sm btn-success"
            onClick={handleDownload}
            disabled={loading}
            title="Download QR Code"
          >
            <i className="fas fa-download"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={handleGenerate}
            disabled={loading}
            title="Regenerate QR Code"
          >
            <i className="fas fa-sync"></i>
          </button>
        </>
      )}
    </div>
  );
};

export default QRCodeButton; // ✅ Default export
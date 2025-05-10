import React, { useState, useEffect } from 'react';
import { previewClosureMessage } from '../../../api/schedule';

const MessagePreview = ({ closureData }) => {
  const [previewMessage, setPreviewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only generate preview if we have a valid closure data
    if (!closureData || !closureData.reason) {
      setPreviewMessage('');
      return;
    }

    const generatePreview = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await previewClosureMessage(closureData);
        setPreviewMessage(data.message);
      } catch (err) {
        setError('Failed to generate preview');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    generatePreview();
  }, [closureData]);

  if (loading) {
    return <div className="message-preview-loading">Generating preview...</div>;
  }

  if (error) {
    return <div className="message-preview-error">{error}</div>;
  }

  if (!previewMessage) {
    return null;
  }

  return (
    <div className="message-preview">
      <h4>Message Preview</h4>
      <div className="preview-container">
        <div className="preview-header">
          This is how the message will appear to users:
        </div>
        <div className="preview-content">
          <div className="alert alert-info">
            <i className="fas fa-info-circle"></i> {previewMessage}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePreview;
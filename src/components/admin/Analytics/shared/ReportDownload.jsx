import React from 'react';
import { useAnalytics } from '../../../../context/AnalyticsContext';

const ReportDownload = ({ module }) => {
  const { downloadReport, downloading } = useAnalytics();

  const handleDownload = async (type) => {
    try {
      await downloadReport(module, type);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="reports-section">
      <div className="reports-header">
        <div className="reports-title">Download Reports</div>
        <div className="reports-subtitle">
          Generate comprehensive reports for the current analytics view
        </div>
      </div>
      
      <div className="reports-buttons">
        <button
          className="report-btn primary"
          onClick={() => handleDownload('simple')}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Generating...
            </>
          ) : (
            <>
              <i className="fas fa-file-alt"></i>
              Simple Report
            </>
          )}
        </button>

        <button
          className="report-btn success"
          onClick={() => handleDownload('detailed')}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Generating...
            </>
          ) : (
            <>
              <i className="fas fa-file-pdf"></i>
              Detailed Report
            </>
          )}
        </button>

        <button className="report-btn secondary" disabled>
          <i className="fas fa-download"></i>
          Export Data
        </button>
      </div>
    </div>
  );
};

export default ReportDownload;
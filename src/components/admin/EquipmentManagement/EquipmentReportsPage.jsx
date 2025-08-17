import React, { useState } from 'react';
import { downloadEquipmentReport, previewEquipmentReport, downloadAdminEquipmentReport } from '../../../api/equipmentUnits';
import { useAuth } from '../../../hooks/useAuth';

const EquipmentReportsPage = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Fixed: Use single state object for report configuration
  const [reportConfig, setReportConfig] = useState({
    reportType: 'INVENTORY',
    detailed: false,
    location: 'current'
  });

  const handleDownload = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      let result;
      
      // Use admin endpoint if admin is selecting a different location
      if (isAdmin() && reportConfig.location !== 'current') {
        result = await downloadAdminEquipmentReport(
          reportConfig.location,
          reportConfig.reportType,
          reportConfig.detailed
        );
      } else {
        result = await downloadEquipmentReport(
          reportConfig.reportType,
          reportConfig.detailed
        );
      }
      
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      // Note: Preview only works for current user's location
      // For admin previewing other locations, you might need to implement a separate function
      const result = await previewEquipmentReport(
        reportConfig.reportType,
        reportConfig.detailed
      );
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getReportDescription = () => {
    const baseDesc = reportConfig.detailed ? 'Detailed' : 'Summary';
    const typeDesc = reportConfig.reportType === 'INVENTORY' ? 'Inventory' : 'Assignment';
    const locationDesc = isAdmin() && reportConfig.location !== 'current' 
      ? ` for ${reportConfig.location}` 
      : '';
    
    return `${baseDesc} ${typeDesc} Report${locationDesc}`;
  };

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReportConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const clearMessages = () => {
    setMessage('');
    setError('');
  };

  return (
    <div className="admin-content">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>Equipment Reports</h1>
            <p className="admin-subtitle">
              Generate equipment reports for {user?.location}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={clearMessages}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {message && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={clearMessages}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Report Configuration */}
      <div className="admin-card">
        <div className="card-header">
          <h3>Report Settings</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label>Report Type</label>
                <select
                  name="reportType"
                  value={reportConfig.reportType}
                  onChange={handleConfigChange}
                  className="form-control"
                >
                  <option value="INVENTORY">Inventory Report</option>
                  <option value="ASSIGNMENT">Assignment Report</option>
                  <option value="MAINTENANCE">Maintenance Report</option>
                </select>
              </div>
            </div>

            {isAdmin() && (
              <div className="col-md-4">
                <div className="form-group">
                  <label>Location</label>
                  <select
                    name="location"
                    value={reportConfig.location}
                    onChange={handleConfigChange}
                    className="form-control"
                  >
                    <option value="current">My Location ({user?.location})</option>
                    <option value="GISHUSHU">Gishushu</option>
                    <option value="MASORO">Masoro</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className={isAdmin() ? "col-md-4" : "col-md-6 col-md-offset-3"}>
              <div className="form-group">
                <label>Detail Level</label>
                <select
                  name="detailed"
                  value={reportConfig.detailed}
                  onChange={(e) => setReportConfig(prev => ({ 
                    ...prev, 
                    detailed: e.target.value === 'true' 
                  }))}
                  className="form-control"
                >
                  <option value="false">Summary</option>
                  <option value="true">Detailed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="report-info">
            <h4>Report Preview</h4>
            <ul>
              <li><strong>Type:</strong> {reportConfig.reportType}</li>
              <li><strong>Detail:</strong> {reportConfig.detailed ? 'Detailed' : 'Summary'}</li>
              <li><strong>Location:</strong> {
                reportConfig.location === 'current' ? user?.location : reportConfig.location
              }</li>
              <li><strong>Date:</strong> {new Date().toLocaleDateString()}</li>
              <li><strong>Description:</strong> {getReportDescription()}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="admin-card">
        <div className="card-body text-center">
          <h4>Generate Report</h4>
          <p>Choose an action to generate your equipment report:</p>
          
          <div className="button-group">
            <button
              className="btn btn-primary btn-lg"
              onClick={handlePreview}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Loading...
                </>
              ) : (
                <>
                  <i className="fas fa-eye"></i>
                  Preview Report
                </>
              )}
            </button>

            <button
              className="btn btn-success btn-lg"
              onClick={handleDownload}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Loading...
                </>
              ) : (
                <>
                  <i className="fas fa-download"></i>
                  Download PDF
                </>
              )}
            </button>
          </div>

          {isAdmin() && reportConfig.location !== 'current' && (
            <div className="admin-notice">
              <i className="fas fa-info-circle"></i>
              <small>As an admin, you're generating a report for {reportConfig.location}</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentReportsPage;
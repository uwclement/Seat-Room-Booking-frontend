// src/components/admin/UserManagement/AdminPasswordManagement.js
import React, { useState, useEffect } from 'react';
import { useUserManagement } from '../../../hooks/useUserManagement';
import { 
  getStaffWithDefaultPasswords,
  getDefaultPassword,
  resetUserPassword,
  sendPasswordEmail
} from '../../../api/user';
import Alert from '../../common/Alert';
import LoadingSpinner from '../../common/LoadingSpinner';

const AdminPasswordManagement = ({ show, onClose }) => {
  const { loading: contextLoading } = useUserManagement();
  
  // Initialize as empty array to prevent filter errors
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordData, setPasswordData] = useState({});
  const [showPasswords, setShowPasswords] = useState({});
  const [processingUsers, setProcessingUsers] = useState(new Set());

  useEffect(() => {
    if (show) {
      fetchStaffWithDefaultPasswords();
    }
  }, [show]);

  const fetchStaffWithDefaultPasswords = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getStaffWithDefaultPasswords();
      
      // Ensure data is always an array
      const staffArray = Array.isArray(data) ? data : [];
      setStaffUsers(staffArray);
      
      // Pre-load passwords for users who haven't changed them
      const passwords = {};
      for (const user of staffArray) {
        if (user.mustChangePassword) {
          try {
            const passwordInfo = await getDefaultPassword(user.id);
            passwords[user.id] = passwordInfo.defaultPassword;
          } catch (err) {
            console.error(`Failed to get password for user ${user.id}:`, err);
          }
        }
      }
      setPasswordData(passwords);
      
    } catch (err) {
      setError('Failed to fetch staff users. Please try again.');
      console.error(err);
      // Set empty array on error
      setStaffUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    setProcessingUsers(prev => new Set(prev).add(userId));
    setError('');
    setSuccess('');
    
    try {
      const result = await resetUserPassword(userId);
      setPasswordData(prev => ({
        ...prev,
        [userId]: result.newPassword
      }));
      
      // Update the user's mustChangePassword status
      setStaffUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, mustChangePassword: true }
            : user
        )
      );
      
      const userName = staffUsers.find(u => u.id === userId)?.fullName || 'User';
      setSuccess(`Password reset successfully for ${userName}`);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // const handleSendPasswordEmail = async (userId) => {
  //   setProcessingUsers(prev => new Set(prev).add(userId));
  //   setError('');
  //   setSuccess('');
    
  //   try {
  //     await sendPasswordEmail(userId);
  //     const userName = staffUsers.find(u => u.id === userId)?.fullName || 'User';
  //     setSuccess(`Password email sent successfully to ${userName}`);
  //   } catch (err) {
  //     setError(err.response?.data?.message || 'Failed to send password email');
  //   } finally {
  //     setProcessingUsers(prev => {
  //       const newSet = new Set(prev);
  //       newSet.delete(userId);
  //       return newSet;
  //     });
  //   }
  // };

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const copyToClipboard = async (text, userId) => {
    try {
      await navigator.clipboard.writeText(text);
      const userName = staffUsers.find(u => u.id === userId)?.fullName || 'User';
      setSuccess(`Password copied to clipboard for ${userName}`);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const getStatusBadge = (user) => {
    if (user.mustChangePassword) {
      return <span className="status-badge status-warning">Needs Password Change</span>;
    }
    return <span className="status-badge status-success">Password Changed</span>;
  };

  // Safe filter functions with array checks
  const getUsersNeedingPasswordChange = () => {
    return staffUsers.filter(user => user.mustChangePassword);
  };

  const getUsersWithChangedPassword = () => {
    return staffUsers.filter(user => !user.mustChangePassword);
  };

  if (!show) return null;

  // Safe access to filtered arrays
  const needingChange = getUsersNeedingPasswordChange();
  const changedPassword = getUsersWithChangedPassword();

  return (
    <div className="modal-backdrop">
      <div className="modal-container extra-large">
        <div className="modal-header">
          <h3>Password Management</h3>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Statistics */}
          <div className="password-stats">
            <div className="stat-card warning">
              <div className="stat-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">{needingChange.length}</div>
                <div className="stat-label">Need Password Change</div>
              </div>
            </div>
            
            <div className="stat-card success">
              <div className="stat-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">{changedPassword.length}</div>
                <div className="stat-label">Password Changed</div>
              </div>
            </div>
            
            <div className="stat-card info">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">{staffUsers.length}</div>
                <div className="stat-label">Total Staff</div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert type="danger" message={error} onClose={() => setError('')} />
          )}
          {success && (
            <Alert type="success" message={success} onClose={() => setSuccess('')} />
          )}

          {loading && <LoadingSpinner />}

          {/* Users Needing Password Change */}
          {needingChange.length > 0 && (
            <div className="password-section">
              <div className="section-header warning">
                <h4>
                  <i className="fas fa-exclamation-triangle"></i>
                  Staff Members Who Need to Change Password ({needingChange.length})
                </h4>
                <p>These staff members have default passwords and must change them on first login.</p>
              </div>
              
              <div className="password-table-container">
                <table className="password-table">
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Role</th>
                      <th>Location</th>
                      <th>Default Password</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {needingChange.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-info">
                            <div className="user-name">{user.fullName}</div>
                            <div className="user-email">{user.email}</div>
                            <div className="user-employee-id">{user.employeeId}</div>
                          </div>
                        </td>
                        <td>
                          <span className="role-badge">
                            {user.roles?.map(role => role.replace('ROLE_', '')).join(', ') || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`location-badge location-${user.location?.toLowerCase() || 'default'}`}>
                            {user.location || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="password-field">
                            {passwordData[user.id] ? (
                              <div className="password-display">
                                <input
                                  type={showPasswords[user.id] ? 'text' : 'password'}
                                  value={passwordData[user.id]}
                                  readOnly
                                  className="password-input"
                                />
                                <div className="password-actions">
                                  <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => togglePasswordVisibility(user.id)}
                                    title={showPasswords[user.id] ? 'Hide password' : 'Show password'}
                                  >
                                    <i className={`fas ${showPasswords[user.id] ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-info"
                                    onClick={() => copyToClipboard(passwordData[user.id], user.id)}
                                    title="Copy to clipboard"
                                  >
                                    <i className="fas fa-copy"></i>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="no-password">Loading...</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => handleResetPassword(user.id)}
                              disabled={processingUsers.has(user.id)}
                              title="Generate new password"
                            >
                              {processingUsers.has(user.id) ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-redo"></i>
                              )}
                              Reset
                            </button>
                            
                            {/* <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleSendPasswordEmail(user.id)}
                              disabled={processingUsers.has(user.id)}
                              title="Send password via email"
                            >
                              {processingUsers.has(user.id) ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-envelope"></i>
                              )}
                              Email
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Who Changed Password */}
          {changedPassword.length > 0 && (
            <div className="password-section">
              <div className="section-header success">
                <h4>
                  <i className="fas fa-check-circle"></i>
                  Staff Members Who Changed Password ({changedPassword.length})
                </h4>
                <p>These staff members have successfully changed their passwords.</p>
              </div>
              
              <div className="password-table-container">
                <table className="password-table">
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Role</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changedPassword.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-info">
                            <div className="user-name">{user.fullName}</div>
                            <div className="user-email">{user.email}</div>
                            <div className="user-employee-id">{user.employeeId}</div>
                          </div>
                        </td>
                        <td>
                          <span className="role-badge">
                            {user.roles?.map(role => role.replace('ROLE_', '')).join(', ') || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`location-badge location-${user.location?.toLowerCase() || 'default'}`}>
                            {user.location || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge status-success">
                            <i className="fas fa-check"></i>
                            Password Changed
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleResetPassword(user.id)}
                            disabled={processingUsers.has(user.id)}
                            title="Reset password (will require change on next login)"
                          >
                            {processingUsers.has(user.id) ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-key"></i>
                            )}
                            Reset Password
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {staffUsers.length === 0 && !loading && (
            <div className="empty-state">
              <i className="fas fa-users"></i>
              <h4>No Staff Members Found</h4>
              <p>No staff members found in the system.</p>
            </div>
          )}

          {/* Security Notice */}
          <div className="security-notice">
            <div className="notice-header">
              <i className="fas fa-shield-alt"></i>
              <h4>Security Guidelines</h4>
            </div>
            <ul>
              <li>Default passwords are automatically generated and secure</li>
              <li>Staff members must change their password on first login</li>
              <li>Passwords are not stored in plain text after first change</li>
              <li>Use "Reset Password" to generate a new temporary password</li>
              <li>Always share passwords through secure channels</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button 
            className="btn btn-primary" 
            onClick={fetchStaffWithDefaultPasswords}
            disabled={loading}
          >
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPasswordManagement;
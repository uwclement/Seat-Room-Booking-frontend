import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const ChangePassword = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Real-time password validation
    if (name === 'newPassword') {
      const passwordErrors = validatePassword(value);
      setErrors(prev => ({
        ...prev,
        newPassword: passwordErrors.length > 0 ? passwordErrors : ''
      }));
    }

    // Real-time confirm password validation
    if (name === 'confirmPassword' || (name === 'newPassword' && formData.confirmPassword)) {
      const newPasswordValue = name === 'newPassword' ? value : formData.newPassword;
      const confirmPasswordValue = name === 'confirmPassword' ? value : formData.confirmPassword;
      
      if (newPasswordValue !== confirmPasswordValue) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors;
      }
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) return;

    setLoading(true);

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      
      setMessage({ 
        type: 'success', 
        text: 'Password changed successfully! Please login again with your new password.' 
      });

      // Log out user after successful password change to force re-login
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);

    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Failed to change password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/(?=.*[a-z])/.test(password)) score++;
    if (/(?=.*[A-Z])/.test(password)) score++;
    if (/(?=.*\d)/.test(password)) score++;
    if (/(?=.*[@$!%*?&])/.test(password)) score++;
    
    const strengthMap = {
      0: { label: 'Very Weak', color: '#dc3545' },
      1: { label: 'Weak', color: '#fd7e14' },
      2: { label: 'Fair', color: '#ffc107' },
      3: { label: 'Good', color: '#20c997' },
      4: { label: 'Strong', color: '#28a745' },
      5: { label: 'Very Strong', color: '#198754' }
    };
    
    return { 
      strength: (score / 5) * 100, 
      label: strengthMap[score].label,
      color: strengthMap[score].color
    };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="password-change-header">
          <div className="warning-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="auth-heading">Password Change Required</h2>
          <p className="auth-subtitle">
            Welcome, <strong>{user?.fullName}</strong>
          </p>
        </div>

        {message.text && (
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage({ type: '', text: '' })}
          />
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="Current Password"
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
            required
            placeholder="Enter your temporary password"
          />

          <div className="password-input-group">
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              required
              placeholder="Enter your new secure password"
            />
            
            {formData.newPassword && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{ 
                      width: `${passwordStrength.strength}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  ></div>
                </div>
                <span 
                  className="strength-label"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
            placeholder="Confirm your new password"
          />

          <div className="password-requirements">
            <h4>Password Requirements:</h4>
            <ul>
              <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
                <i className={`fas ${formData.newPassword.length >= 8 ? 'fa-check' : 'fa-times'}`}></i>
                At least 8 characters long
              </li>
              <li className={/(?=.*[a-z])/.test(formData.newPassword) ? 'valid' : ''}>
                <i className={`fas ${/(?=.*[a-z])/.test(formData.newPassword) ? 'fa-check' : 'fa-times'}`}></i>
                One lowercase letter
              </li>
              <li className={/(?=.*[A-Z])/.test(formData.newPassword) ? 'valid' : ''}>
                <i className={`fas ${/(?=.*[A-Z])/.test(formData.newPassword) ? 'fa-check' : 'fa-times'}`}></i>
                One uppercase letter
              </li>
              <li className={/(?=.*\d)/.test(formData.newPassword) ? 'valid' : ''}>
                <i className={`fas ${/(?=.*\d)/.test(formData.newPassword) ? 'fa-check' : 'fa-times'}`}></i>
                One number
              </li>
              <li className={/(?=.*[@$!%*?&])/.test(formData.newPassword) ? 'valid' : ''}>
                <i className={`fas ${/(?=.*[@$!%*?&])/.test(formData.newPassword) ? 'fa-check' : 'fa-times'}`}></i>
                One special character (@$!%*?&)
              </li>
            </ul>
          </div>

          <div className="form-actions">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || Object.keys(errors).some(key => errors[key])}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </Button>
            
            <Button
              type="button"
              variant="secondary" 
              fullWidth
              onClick={handleLogout}
              className="logout-button"
            >
              Logout and Login Later
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
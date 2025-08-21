import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  checkEmailAvailability, 
  checkStudentIdAvailability 
} from '../../api/user';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import '../../assets/css/auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    location: 'GISHUSHU', // Default location
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState({});
  const [step, setStep] = useState(1); // Step 1: Form, Step 2: Verification message
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: 'Enter a password',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    }
  });

  const navigate = useNavigate();
  const { register } = useAuth();

  const locationOptions = [
    { value: 'GISHUSHU', label: 'Gishushu Campus' },
    { value: 'MASORO', label: 'Masoro Campus' },
  ];

  // Password strength checking
  const checkPasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?!]/.test(password),
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    let score = metRequirements * 20;
    let text = 'Enter a password';

    if (score >= 100) {
      text = 'Strong';
    } else if (score >= 80) {
      text = 'Good';
    } else if (score >= 60) {
      text = 'Fair';
    } else if (score > 0) {
      text = 'Weak';
    }

    return { score, text, requirements };
  };

  const validateField = async (field, value) => {
    const newErrors = { ...errors };
    setValidating(prev => ({ ...prev, [field]: true }));

    try {
      switch (field) {
        case 'fullName':
          if (!value.trim()) {
            newErrors.fullName = 'Full name is required';
          } else if (value.trim().length < 3) {
            newErrors.fullName = 'Full name must be at least 3 characters';
          } else {
            delete newErrors.fullName;
          }
          break;

        case 'email':
          if (!value) {
            newErrors.email = 'Email is required';
          } else if (!/\S+@\S+\.\S+/.test(value)) {
            newErrors.email = 'Email format is invalid';
          } else {
            try {
              const response = await checkEmailAvailability(value);
              if (response.exists) {
                newErrors.email = 'Email is already in use';
              } else {
                delete newErrors.email;
              }
            } catch (error) {
              delete newErrors.email;
              console.warn('Email availability check failed:', error);
            }
          }
          break;

        case 'studentId':
          if (!value) {
            newErrors.studentId = 'Student ID is required';
          } else if (value.length < 3) {
            newErrors.studentId = 'Student ID must be at least 3 characters';
          } else {
            try {
              const response = await checkStudentIdAvailability(value);
              if (response.exists) {
                newErrors.studentId = 'Student ID is already in use';
              } else {
                delete newErrors.studentId;
              }
            } catch (error) {
              delete newErrors.studentId;
              console.warn('Student ID availability check failed:', error);
            }
          }
          break;

        case 'password':
          const strength = checkPasswordStrength(value);
          setPasswordStrength(strength);
          
          if (!value) {
            newErrors.password = 'Password is required';
          } else if (strength.score < 100) {
            newErrors.password = 'Password must meet all security requirements';
          } else {
            delete newErrors.password;
          }
          break;

        case 'confirmPassword':
          if (!value) {
            newErrors.confirmPassword = 'Please confirm your password';
          } else if (value !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match';
          } else {
            delete newErrors.confirmPassword;
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(`Validation error for ${field}:`, error);
    }

    setErrors(newErrors);
    setValidating(prev => ({ ...prev, [field]: false }));
  };

  const validateForm = async () => {
    const fields = ['fullName', 'email', 'studentId', 'password', 'confirmPassword'];
    
    await Promise.all(
      fields.map(field => validateField(field, formData[field]))
    );
    
    const hasErrors = Object.values(errors).some(error => error && error.length > 0);
    return !hasErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear general message when user makes changes
    if (message.text) {
      setMessage({ type: '', text: '' });
    }

    // Real-time password strength checking
    if (name === 'password') {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    const isValid = await validateForm();
    if (!isValid) {
      setMessage({ 
        type: 'danger', 
        text: 'Please fix the errors above before submitting.' 
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register({
        fullName: formData.fullName,
        email: formData.email,
        studentId: formData.studentId,
        location: formData.location,
        password: formData.password,
      });
      
      if (result.success) {
        setStep(2);
      } else {
        setMessage({ type: 'danger', text: result.message || 'Registration failed. Please try again.' });
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: 'An error occurred during registration. Please try again.',
      });
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const isFormValid = () => {
    return formData.fullName.trim() && 
           formData.email && 
           formData.studentId && 
           formData.password && 
           formData.confirmPassword &&
           passwordStrength.score === 100 &&
           formData.password === formData.confirmPassword &&
           Object.keys(errors).length === 0;
  };

  const getSubmitButtonText = () => {
    if (loading) return 'Creating account...';
    if (!formData.password) return 'Enter password';
    if (passwordStrength.score < 100) return 'Password requirements not met';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.fullName || !formData.email || !formData.studentId) return 'Please fill all fields';
    return 'Create Student Account';
  };

  if (step === 2) {
    return (
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="auth-success-container">
            <div className="auth-success-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <h3 className="auth-success-heading">Verify your email</h3>
            <p className="auth-success-message">
              We've sent a verification email to <span className="auth-success-email">{formData.email}</span>.
              Please check your email and click on the verification link to activate your account.
            </p>
            <div className="registration-summary">
              <h4>Registration Summary:</h4>
              <ul>
                <li><strong>Name:</strong> {formData.fullName}</li>
                <li><strong>Student ID:</strong> {formData.studentId}</li>
                <li><strong>Location:</strong> {locationOptions.find(l => l.value === formData.location)?.label}</li>
              </ul>
            </div>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container register-form">
        <h2 className="auth-heading">Create a new student account</h2>
        
        {message.text && (
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage({ type: '', text: '' })}
          />
        )}
        
        <form className="auth-form register-grid" onSubmit={handleSubmit}>
          {/* Row 1: Full Name and Student ID */}
          <Input
            label="Full Name *"
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.fullName}
            required
          />

          <Input
            label="Student ID *"
            type="text"
            id="studentId"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.studentId}
            loading={validating.studentId}
            placeholder="e.g., STU001, 12345"
            required
          />

          {/* Row 2: Email and Location */}
          <Input
            label="Email Address *"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            loading={validating.email}
            required
          />

          <div className="form-group">
            <label htmlFor="location">Location/Campus *</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-control"
              required
            >
              {locationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small className="form-text">
              Select your primary campus or location
            </small>
          </div>

          {/* Row 3: Password fields with strength indicator */}
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <div className="password-field-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Enter password"
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => togglePasswordVisibility('password')}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            
            <div className="password-strength">
              <div className="password-strength-label">
                Password Strength: <span className={`strength-${passwordStrength.text.toLowerCase()}`}>
                  {passwordStrength.text}
                </span>
              </div>
              <div className="password-strength-bar">
                <div 
                  className={`password-strength-progress ${passwordStrength.text.toLowerCase()}`}
                  style={{ width: `${passwordStrength.score}%` }}
                ></div>
              </div>
              
              <div className="password-requirements">
                <div className={`password-requirement ${passwordStrength.requirements.length ? 'met' : 'unmet'}`}>
                  <i className={`fas ${passwordStrength.requirements.length ? 'fa-check' : 'fa-times'}`}></i>
                  <span>At least 8 characters</span>
                </div>
                <div className={`password-requirement ${passwordStrength.requirements.uppercase ? 'met' : 'unmet'}`}>
                  <i className={`fas ${passwordStrength.requirements.uppercase ? 'fa-check' : 'fa-times'}`}></i>
                  <span>At least one uppercase letter</span>
                </div>
                <div className={`password-requirement ${passwordStrength.requirements.lowercase ? 'met' : 'unmet'}`}>
                  <i className={`fas ${passwordStrength.requirements.lowercase ? 'fa-check' : 'fa-times'}`}></i>
                  <span>At least one lowercase letter</span>
                </div>
                <div className={`password-requirement ${passwordStrength.requirements.number ? 'met' : 'unmet'}`}>
                  <i className={`fas ${passwordStrength.requirements.number ? 'fa-check' : 'fa-times'}`}></i>
                  <span>At least one number</span>
                </div>
                <div className={`password-requirement ${passwordStrength.requirements.special ? 'met' : 'unmet'}`}>
                  <i className={`fas ${passwordStrength.requirements.special ? 'fa-check' : 'fa-times'}`}></i>
                  <span>At least one special character (@, #, $, %, etc.)</span>
                </div>
              </div>
            </div>
            
            {errors.password && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <div className="password-field-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control ${errors.confirmPassword ? 'error' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'success' : ''}`}
                placeholder="Confirm password"
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => togglePasswordVisibility('confirmPassword')}
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            
            {errors.confirmPassword && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{errors.confirmPassword}</span>
              </div>
            )}
          </div>

          {/* Submit button spans full width */}
          <div className="full-width">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={!isFormValid() || loading}
            >
              {getSubmitButtonText()}
            </Button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign in instead</Link>
          </p>
          <div className="staff-info">
            <p>
              <strong>Staff Members:</strong> Contact your administrator to create your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
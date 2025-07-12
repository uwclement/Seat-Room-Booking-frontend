// src/pages/auth/Register.js
import React, { useState } from 'react';
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

  const navigate = useNavigate();
  const { register } = useAuth();

  const locationOptions = [
    { value: 'GISHUSHU', label: 'Gishushu Campus' },
    { value: 'MASORO', label: 'Masoro Campus' },
    { value: 'KIGALI', label: 'Kigali' },
    { value: 'NYANZA', label: 'Nyanza' },
    { value: 'MUSANZE', label: 'Musanze' }
  ];

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
              // If check fails, assume available but show warning
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
              // If check fails, assume available but show warning
              delete newErrors.studentId;
              console.warn('Student ID availability check failed:', error);
            }
          }
          break;

        case 'password':
          if (!value) {
            newErrors.password = 'Password is required';
          } else if (value.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
          } else {
            delete newErrors.password;
          }
          break;

        case 'confirmPassword':
          if (value !== formData.password) {
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
    
    for (const field of fields) {
      await validateField(field, formData[field]);
    }
    
    return Object.keys(errors).length === 0;
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
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    const isValid = await validateForm();
    if (!isValid) return;
    
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
        setStep(2); // Move to verification message
      } else {
        setMessage({ type: 'danger', text: result.message });
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
      <div className="auth-form-container">
        <h2 className="auth-heading">Create a new student account</h2>
        
        <div className="registration-info">
          <div className="info-card">
            <h4>Student Registration</h4>
            <p>Create your student account to access library services, book seats, and manage your bookings.</p>
            <p><strong>Note:</strong> Staff accounts are created by administrators.</p>
          </div>
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

          <Input
            label="Password *"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            required
          />

          <Input
            label="Confirm Password *"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.confirmPassword}
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading || Object.keys(errors).length > 0}
          >
            {loading ? 'Creating account...' : 'Create Student Account'}
          </Button>
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
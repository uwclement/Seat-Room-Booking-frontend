import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { checkEmailExists } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import '../../assets/css/auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Form, Step 2: Verification message

  const navigate = useNavigate();
  const { register } = useAuth();

  const validateForm = async () => {
    const newErrors = {};
    
    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    } else {
      // Check if email already exists
      try {
        const response = await checkEmailExists(formData.email);
        if (response.message === 'Email exists') {
          newErrors.email = 'Email is already in use';
        }
      } catch (error) {
        console.error('Error checking email:', error);
      }
    }
    
    // Validate student ID
    if (!formData.studentId) {
      newErrors.studentId = 'Student ID is required';
    } else if (formData.studentId.length < 3) {
      newErrors.studentId = 'Student ID must be at least 3 characters';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
      console.error(err);
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
        <h2 className="auth-heading">Create a new account</h2>
        
        {message.text && (
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage({ type: '', text: '' })}
          />
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            required
          />

          <Input
            label="Email address"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <Input
            label="Student ID"
            type="text"
            id="studentId"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            error={errors.studentId}
            required
          />

          <Input
            label="Password"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign in instead</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
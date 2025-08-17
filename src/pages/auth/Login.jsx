// src/pages/auth/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import '../../assets/css/auth.css';

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // Changed from email to identifier
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // redirect logic with librarian location consideration
  const getRedirectPath = (userRoles, userLocation, userType) => {
    if (!userRoles || !Array.isArray(userRoles)) {
      return '/seats'; // Default for regular users
    }

    // Role priority order (highest to lowest)
    if (userRoles.includes('ROLE_HOD')) {
      return '/hod/dashboard';
    }
    
    if (userRoles.includes('ROLE_EQUIPMENT_ADMIN')) {
      return '/admin/equipment-management';
    }
    
    if (userRoles.includes('ROLE_PROFESSOR')) {
      return '/professor/dashboard';
    }
    
    if (userRoles.includes('ROLE_ADMIN')) {
      return '/admin/analytics'; // Direct to user management for admins
    }
    
    // Location-based routing for librarians
    if (userRoles.includes('ROLE_LIBRARIAN')) {
      return '/admin/seats'; // Redirect to Admin page with only Librarian features
    }
    
    // Default for ROLE_USER or any other role
    return '/seats';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(identifier, password);
      if (result.success) {
        // Get the user data directly from local storage to ensure it's up to date
        const userData = JSON.parse(localStorage.getItem('user'));
        
        // Check if user must change password
        if (userData?.mustChangePassword) {
          navigate('/change-password');
          return; 
        }
        
        // redirect path determination (only if password change not required)
        const redirectPath = getRedirectPath(
          userData?.roles, 
          userData?.location,
          userData?.userType
        );
        
        // Navigate to the appropriate dashboard
        navigate(redirectPath);
        
        // Enhanced welcome message
        const roleMessage = getRoleWelcomeMessage(userData?.roles, userData?.location);
        if (roleMessage) {
          console.log(roleMessage); // You can replace this with a toast notification
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced welcome message with location awareness
  const getRoleWelcomeMessage = (userRoles, location) => {
    if (!userRoles || !Array.isArray(userRoles)) {
      return 'Welcome to the Library Management System!';
    }

    if (userRoles.includes('ROLE_HOD')) {
      return 'Welcome, Head of Department!';
    }
    
    if (userRoles.includes('ROLE_EQUIPMENT_ADMIN')) {
      return 'Welcome to Equipment Management Dashboard!';
    }
    
    if (userRoles.includes('ROLE_PROFESSOR')) {
      return 'Welcome, Professor!';
    }
    
    if (userRoles.includes('ROLE_ADMIN')) {
      return 'Welcome to Admin Dashboard!';
    }
    
    if (userRoles.includes('ROLE_LIBRARIAN')) {
      const locationName = location === 'GISHUSHU' ? 'Gishushu Campus' : 
                          location === 'MASORO' ? 'Masoro Campus' : location;
      return `Welcome, ${locationName} Librarian!`;
    }
    
    return 'Welcome to the Library Management System!';
  };

  // Helper function to determine input placeholder based on what user is typing
  const getInputPlaceholder = () => {
    if (!identifier) {
      return 'Email, Student ID, or Employee ID';
    }
    
    // Simple detection logic
    if (identifier.includes('@')) {
      return 'Email address';
    } else if (identifier.toLowerCase().startsWith('stu') || /^\d+$/.test(identifier)) {
      return 'Student ID';
    } else if (identifier.toLowerCase().includes('emp') || identifier.toLowerCase().includes('lib')) {
      return 'Employee ID';
    }
    
    return 'Email, Student ID, or Employee ID';
  };

  // Helper function to show what type of login is being attempted
  const getLoginType = () => {
    if (!identifier) return '';
    
    if (identifier.includes('@')) {
      return 'Signing in with email';
    } else if (identifier.toLowerCase().startsWith('stu') || /^\d+$/.test(identifier)) {
      return 'Signing in as student';
    } else {
      return 'Signing in as staff';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2 className="auth-heading">Sign in to your account</h2>
        
        {error && (
          <Alert
            type="danger"
            message={error}
            onClose={() => setError('')}
          />
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="Login"
            type="text"
            id="identifier"
            name="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={getInputPlaceholder()}
            required
            autoComplete="username"
          />
          
          {/* Show login type hint */}
          {identifier && (
            <div className="login-type-hint">
              <small className="text-muted">
                <i className="fas fa-info-circle"></i> {getLoginType()}
              </small>
            </div>
          )}

          <Input
            label="Password"
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register">Create a new account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import '../../assets/css/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Function to determine redirect path based on user roles
  const getRedirectPath = (userRoles) => {
    if (!userRoles || !Array.isArray(userRoles)) {
      return '/seats'; // Default for regular users
    }

    // Role priority order (highest to lowest)
    if (userRoles.includes('ROLE_HOD')) {
      return '/hod/dashboard';
    }
    
    if (userRoles.includes('ROLE_EQUIPMENT_ADMIN')) {
      return '/equipment-admin/dashboard';
    }
    
    if (userRoles.includes('ROLE_PROFESSOR')) {
      return '/professor/dashboard';
    }
    
    if (userRoles.includes('ROLE_ADMIN')) {
      return '/admin';
    }
    
    // Default for ROLE_USER or any other role
    return '/seats';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Get the user data directly from local storage to ensure it's up to date
        const userData = JSON.parse(localStorage.getItem('user'));
        
        // Determine redirect path based on user roles
        const redirectPath = getRedirectPath(userData?.roles);
        
        // Navigate to the appropriate dashboard
        navigate(redirectPath);
        
        // Optional: Show welcome message based on role
        const roleMessage = getRoleWelcomeMessage(userData?.roles);
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

  // Optional: Function to get role-specific welcome message
  const getRoleWelcomeMessage = (userRoles) => {
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
    
    return 'Welcome to the Library Management System!';
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
            label="Email address"
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

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
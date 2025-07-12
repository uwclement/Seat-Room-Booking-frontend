import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ChangePassword from './ChangePassword';

const PasswordProtectedRoute = ({ children }) => {
  const { isAuthenticated, mustChangePassword, user } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If user must change password, show change password component
  if (mustChangePassword()) {
    return <ChangePassword />;
  }

  // If everything is good, render the protected content
  return children;
};

export default PasswordProtectedRoute;
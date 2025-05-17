import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';
import NotificationComponent from './../../components/common/NotificationComponent';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="navbar-brand">AUCA Library</Link>
        </div>
        <div className="navbar-menu">
          
          
          {isAuthenticated() && !isAdmin() && (
            <>
              <Link to="/" className="navbar-item">Home</Link>
              <Link to="/seats" className="navbar-item">Seats</Link>
              <Link to="/bookings" className="navbar-item">My Bookings</Link>
              <Link to="/waitlist" className="navbar-item">My Waitlist</Link>
            </>
          )}
        </div>

        <div className="navbar-auth">
          {isAuthenticated() ? (
            <div className="navbar-user">
              {!isAdmin() && (
              <div className="navbar-notification">
                 <NotificationComponent />
              </div> 
              )}
              <span className="navbar-username">{user.studentId}</span>
              <button onClick={handleLogout} className="navbar-logout">Logout</button>
            </div>
          ) : (
            <div className="navbar-login">
              <Link to="/login" className="navbar-login-link">Login</Link>
              <Link to="/register" className="btn btn-primary navbar-register-btn">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
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
              {/* Seat Booking Section */}
              <div className="navbar-dropdown">
                <span className="navbar-item navbar-dropdown-trigger">
                  Seats <i className="fas fa-chevron-down"></i>
                </span>
                <div className="navbar-dropdown-menu">
                  <Link to="/seats" className="navbar-dropdown-item">Browse Seats</Link>
                  <Link to="/bookings" className="navbar-dropdown-item">My Seat Bookings</Link>
                  <Link to="/waitlist" className="navbar-dropdown-item">My Waitlist</Link>
                </div>
              </div>
              
              {/* Room Booking Section */}
              <div className="navbar-dropdown">
                <span className="navbar-item navbar-dropdown-trigger">
                  Rooms <i className="fas fa-chevron-down"></i>
                </span>
                <div className="navbar-dropdown-menu">
                  <Link to="/rooms" className="navbar-dropdown-item">Browse Rooms</Link>
                  <Link to="/room-bookings" className="navbar-dropdown-item">My Room Bookings</Link>
                  <Link to="/join-bookings" className="navbar-dropdown-item">Join Public Bookings</Link>
                </div>
              </div>
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
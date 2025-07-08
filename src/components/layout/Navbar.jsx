import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';
import NotificationComponent from './../../components/common/NotificationComponent';
import logo from '../../assets/images/logo.jpeg';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isProfessor, isEquipmentAdmin, isHOD } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveDropdown(null); // Close any open dropdowns when toggling menu
  };

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && 
          !event.target.closest('.navbar-mobile-menu') && 
          !event.target.closest('.navbar-hamburger')) {
        closeMobileMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-container">
          <div className="navbar-logo">
            <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
              <img src={logo} alt="Logo" className="navbar-logo-img" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="navbar-menu">
            {isAuthenticated() && !isAdmin() && !isProfessor () && !isEquipmentAdmin () && !isHOD () && (
              <>
                <Link to="/seats" className="navbar-item">Home</Link>
                
                {/* Seat Booking Section */}
                <div className="navbar-dropdown">
                  <span className="navbar-item navbar-dropdown-trigger">
                    Seats <i className="fas fa-chevron-down"></i>
                  </span>
                  <div className="navbar-dropdown-menu">
                    <Link to="/seats" className="navbar-dropdown-item">Seats</Link>
                    <Link to="/bookings" className="navbar-dropdown-item">My Bookings</Link>
                    <Link to="/waitlist" className="navbar-dropdown-item">My Waitlist</Link>
                  </div>
                </div>
                
                {/* Room Booking Section */}
                <div className="navbar-dropdown">
                  <span className="navbar-item navbar-dropdown-trigger">
                    Rooms <i className="fas fa-chevron-down"></i>
                  </span>
                  <div className="navbar-dropdown-menu">
                    <Link to="/rooms" className="navbar-dropdown-item">Rooms</Link>
                    <Link to="/room-bookings" className="navbar-dropdown-item">My Bookings</Link>
                    <Link to="/join-bookings" className="navbar-dropdown-item">Join Public Bookings</Link>
                  </div>
                </div>

                {/* Masoro Section */}
                <div className="navbar-dropdown">
                  <span className="navbar-item navbar-dropdown-trigger">
                    Masoro <i className="fas fa-chevron-down"></i>
                  </span>
                  <div className="navbar-dropdown-menu">
                    <Link to="/rooms" className="navbar-dropdown-item">Seats</Link>
                    <Link to="/room-bookings" className="navbar-dropdown-item">My Bookings</Link>
                    <Link to="/join-bookings" className="navbar-dropdown-item">My Waitlist</Link>
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

            {/* Hamburger Menu Button */}
            {isAuthenticated() && !isAdmin() && (
              <button 
                className={`navbar-hamburger ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isAuthenticated() && !isAdmin() && (
        <div className={`navbar-mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {/* Close Button */}
          <button 
            className="navbar-mobile-close"
            onClick={closeMobileMenu}
            aria-label="Close mobile menu"
          >
            <i className="fas fa-times"></i>
          </button>

          <div className="navbar-mobile-content">
            <div className="navbar-mobile-navigation">
              <Link 
                to="/seats" 
                className="navbar-mobile-item"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              
              {/* Mobile Seat Booking Section */}
              <div className="navbar-mobile-dropdown">
                <div 
                  className={`navbar-mobile-dropdown-trigger ${activeDropdown === 'seats' ? 'active' : ''}`}
                  onClick={() => toggleDropdown('seats')}
                >
                  Seats
                  <i className="fas fa-chevron-down"></i>
                </div>
                <div className={`navbar-mobile-dropdown-menu ${activeDropdown === 'seats' ? 'active' : ''}`}>
                  <Link 
                    to="/seats" 
                    className="navbar-mobile-dropdown-item"
                    onClick={closeMobileMenu}
                  >
                    Seats
                  </Link>
                  <Link 
                    to="/bookings" 
                    className="navbar-mobile-dropdown-item"
                    onClick={closeMobileMenu}
                  >
                    My Bookings
                  </Link>
                  <Link 
                    to="/waitlist" 
                    className="navbar-mobile-dropdown-item"
                    onClick={closeMobileMenu}
                  >
                    My Waitlist
                  </Link>
                </div>
              </div>
              
              {/* Mobile Room Booking Section */}
              <div className="navbar-mobile-dropdown">
                <div 
                  className={`navbar-mobile-dropdown-trigger ${activeDropdown === 'rooms' ? 'active' : ''}`}
                  onClick={() => toggleDropdown('rooms')}
                >
                  Rooms
                  <i className="fas fa-chevron-down"></i>
                </div>
                <div className={`navbar-mobile-dropdown-menu ${activeDropdown === 'rooms' ? 'active' : ''}`}>
                  <Link 
                    to="/rooms" 
                    className="navbar-mobile-dropdown-item"
                    onClick={closeMobileMenu}
                  >
                    Rooms
                  </Link>
                  <Link 
                    to="/room-bookings" 
                    className="navbar-mobile-dropdown-item"
                    onClick={closeMobileMenu}
                  >
                    My Bookings
                  </Link>
                  <Link 
                    to="/join-bookings" 
                    className="navbar-mobile-dropdown-item"
                    onClick={closeMobileMenu}
                  >
                    Join Public Bookings
                  </Link>
                </div>
              </div>
            </div>

             {/* Mobile Masoro Booking Section */}
              <div className="navbar-mobile-dropdown">
                <div 
                  className={`navbar-mobile-dropdown-trigger ${activeDropdown === 'Masoro' ? 'active' : ''}`}
                  onClick={() => toggleDropdown('Masoro')}
                >
                  Masoro
                  <i className="fas fa-chevron-down"></i>
                </div>
                <div className={`navbar-mobile-dropdown-menu ${activeDropdown === 'Masoro' ? 'active' : ''}`}>
                  <Link 
                    to="/Masoro" 
                    className="navbar-mobile-dropdown-item"
                    onClick={closeMobileMenu}
                  >
                    Seats
                  </Link>
                  <Link 
                    to="/bookings" 
                    className="navbar-mobile-dropdown-item"
                    onClick={closeMobileMenu}
                  >
                    My Bookings
                  </Link>
                  <Link 
                    to="/waitlist" 
                    className="navbar-mobile-dropdown-item"
                    onClick={closeMobileMenu}
                  >
                    My Waitlist
                  </Link>
                </div>
              </div>

            {/* Mobile Auth Section - Now always visible */}
            <div className="navbar-mobile-auth">
              <div className="navbar-mobile-user">
                <div className="navbar-mobile-username">{user.studentId}</div>
                <button onClick={handleLogout} className="navbar-mobile-logout">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
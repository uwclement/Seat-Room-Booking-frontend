import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';
import NotificationComponent from './../../components/common/NotificationComponent';
import logo from '../../assets/images/logo.jpeg';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isProfessor, isEquipmentAdmin, isHOD, isLibrarian, getUserRole, getUserLocation } = useAuth();
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
    setActiveDropdown(null);
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

  // Get admin menu items
  const getAdminMenuItems = () => {
    let menuItems = [];

    if (isAdmin()) {
      menuItems = [
        { id: 'seats', label: 'Seat Management', icon: 'fa-chair', path: '/admin/seats' },
        { id: 'seatsBooking', label: 'Seat Bookings', icon: 'fa-calendar-check', path: '/admin/seat-bookings' },
        { id: 'rooms', label: 'Room Management', icon: 'fa-door-open', path: '/admin/rooms' },
        { id: 'schedule', label: 'Schedule Management', icon: 'fa-calendar-alt', path: '/admin/schedule' },
        { id: 'bookings', label: 'Room Bookings', icon: 'fa-bookmark', path: '/admin/Roombookings' },
        { id: 'users', label: 'User Management', icon: 'fa-users', path: '/admin/users' },
        { id: 'passwords', label: 'Password Management', icon: 'fa-key', path: '/admin/passwords' }
      ];
    }

    if (isEquipmentAdmin()) {
      menuItems = [
        ...menuItems,
        { id: 'equipment-management', label: 'Equipment Management', icon: 'fa-tools', path: '/admin/equipment-management' },
        { id: 'courses', label: 'Course Management', icon: 'fa-book', path: '/admin/courses' },
        { id: 'lab-classes', label: 'Lab Classes', icon: 'fa-flask', path: '/admin/lab-classes' },
        { id: 'equipment-requests', label: 'Equipment Requests', icon: 'fa-clipboard-list', path: '/admin/equipment-requests' }
      ];
    }

    if (isHOD()) {
      menuItems = [
        ...menuItems,
        { id: 'professor-approvals', label: 'Professor Approvals', icon: 'fa-user-check', path: '/admin/professor-approvals' },
        { id: 'course-approvals', label: 'Course Approvals', icon: 'fa-book-open', path: '/admin/course-approvals' },
        { id: 'escalated-requests', label: 'Escalated Requests', icon: 'fa-exclamation-triangle', path: '/admin/escalated-requests' }
      ];
    }

    if (isProfessor()) {
      menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt', path: '/professor/dashboard' },
        { id: 'request-equipment', label: 'Request Equipment', icon: 'fa-tools', path: '/professor/request-equipment' },
        { id: 'request-courses', label: 'Request Courses', icon: 'fa-book', path: '/professor/request-courses' },
        { id: 'my-requests', label: 'My Requests', icon: 'fa-list', path: '/professor/my-requests' },
        { id: 'my-courses', label: 'My Courses', icon: 'fa-graduation-cap', path: '/professor/my-courses' },
        { id: 'lab-classes', label: 'Lab Request', icon: 'fa-flask', path: '/professor/request-lab' }
      ];
    }

    if (isLibrarian()) {
      const userLocation = getUserLocation();
      if (userLocation === "GISHUSHU") {
        menuItems = [
          ...menuItems,
          { id: 'seats', label: 'Seat Management', icon: 'fa-chair', path: '/admin/seats' },
          { id: 'seatsBooking', label: 'Seat Bookings', icon: 'fa-calendar-check', path: '/admin/seat-bookings' },
          { id: 'rooms', label: 'Room Management', icon: 'fa-door-open', path: '/admin/rooms' },
          { id: 'schedule', label: 'Schedule Management', icon: 'fa-calendar-alt', path: '/admin/schedule' },
          { id: 'bookings', label: 'Room Bookings', icon: 'fa-bookmark', path: '/admin/Roombookings' }
        ];
      } else {
        menuItems = [
          ...menuItems,
          { id: 'seats', label: 'Seat Management', icon: 'fa-chair', path: '/admin/seats' },
          { id: 'seatsBooking', label: 'Seat Bookings', icon: 'fa-calendar-check', path: '/admin/seat-bookings' },
          { id: 'schedule', label: 'Schedule Management', icon: 'fa-calendar-alt', path: '/admin/schedule' }
        ];
      }
    }

    return menuItems;
  };

  const isRegularUser = () => {
    return isAuthenticated() && !isAdmin() && !isProfessor() && !isEquipmentAdmin() && !isHOD() && !isLibrarian();
  };

  const isAdminUser = () => {
    return isAuthenticated() && (isAdmin() || isProfessor() || isEquipmentAdmin() || isHOD() || isLibrarian());
  };

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
            {isRegularUser() && (
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
                    <Link to="/Masoro-Seats" className="navbar-dropdown-item">Seats</Link>
                    <Link to="/bookings" className="navbar-dropdown-item">My Bookings</Link>
                    <Link to="/waitlist" className="navbar-dropdown-item">My Waitlist</Link>
                  </div>
                </div>

                <Link to="/Schedule" className="navbar-item">Schedule</Link>

              </>
            )}
          </div>

          <div className="navbar-auth">
            {isAuthenticated() ? (
              <div className="navbar-user">
                {!isAdminUser() && (
                  <div className="navbar-notification">
                    <NotificationComponent />
                  </div> 
                )}
                <span className="navbar-username">{user.identifier}</span>
                <button onClick={handleLogout} className="navbar-logout">Logout</button>
              </div>
            ) : (
              <div className="navbar-login">
                <Link to="/login" className="navbar-login-link">Login</Link>
                <Link to="/register" className="btn btn-primary navbar-register-btn">Register</Link>
              </div>
            )}

            {/* Hamburger Menu Button */}
            {isAuthenticated() && (
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
      {isAuthenticated() && (
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
              {/* Regular User Navigation */}
              {isRegularUser() && (
                <>
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
                        to="/Masoro-Seats" 
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
                </>
              )}

              {/* Admin User Navigation */}
              {isAdminUser() && (
                <>
                  <div className="navbar-mobile-admin-header">
                    <div className="admin-role-badge">{getUserRole()}</div>
                  </div>
                  {getAdminMenuItems().map(item => (
                    <Link
                      key={item.id}
                      to={item.path}
                      className="navbar-mobile-item admin-menu-item"
                      onClick={closeMobileMenu}
                    >
                      <i className={`fas ${item.icon}`}></i>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Mobile Auth Section */}
            <div className="navbar-mobile-auth">
              <div className="navbar-mobile-user">
                <div className="navbar-mobile-username">{user.identifier}</div>
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
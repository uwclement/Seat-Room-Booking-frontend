import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminSidebar = ({ activePage }) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt', path: '/admin' },
    { id: 'seats', label: 'Seat Management', icon: 'fa-chair', path: '/admin/seats' },
    { id: 'rooms', label: 'Room Management', icon: 'fa-door-open', path: '/admin/rooms' },
    { id: 'equipment', label: 'Equipment', icon: 'fa-tools', path: '/admin/equipment' },
    { id: 'schedule', label: 'Schedule Management', icon: 'fa-calendar-alt', path: '/admin/schedule' },
    { id: 'bookings', label: 'Booking Management', icon: 'fa-bookmark', path: '/admin/Roombookings' },
    { id: 'users', label: 'User Management', icon: 'fa-users', path: '/admin/users' },
    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line', path: '/admin/analytics' },
    { id: 'logs', label: 'Admin Logs', icon: 'fa-history', path: '/admin/logs' }
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <div className="admin-avatar">
          <i className="fas fa-user-shield"></i>
        </div>
        <div className="admin-info">
          <div className="admin-name">{user?.fullName}</div>
          <div className="admin-role">Administrator</div>
        </div>
      </div>

      <div className="sidebar-menu">
        {menuItems.map(item => (
          <Link
            key={item.id}
            to={item.path}
            className={`sidebar-menu-item ${activePage === item.id ? 'active' : ''}`}
          >
            <i className={`fas ${item.icon}`}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
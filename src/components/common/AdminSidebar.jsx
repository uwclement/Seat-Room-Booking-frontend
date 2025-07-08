import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminSidebar = ({ activePage }) => {
  const { user, isAdmin, isEquipmentAdmin, isHOD, getUserRole } = useAuth();

  // Base menu items for all admin types
  const baseMenuItems = [
    // { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt', path: '/admin' }
  ];

  // Room Admin specific items
  const roomAdminItems = [
    { id: 'seats', label: 'Seat Management', icon: 'fa-chair', path: '/admin/seats' },
    { id: 'seatsBooking', label: 'Seat Bookings', icon: 'fa-calendar-check', path: '/admin/seat-bookings' },
    { id: 'rooms', label: 'Room Management', icon: 'fa-door-open', path: '/admin/rooms' },
    { id: 'schedule', label: 'Schedule Management', icon: 'fa-calendar-alt', path: '/admin/schedule' },
    { id: 'bookings', label: 'Room Bookings', icon: 'fa-bookmark', path: '/admin/Roombookings' },
    { id: 'users', label: 'User Management', icon: 'fa-users', path: '/admin/users' }
  ];

  // Equipment Admin specific items
  const equipmentAdminItems = [
    { id: 'equipment-management', label: 'Equipment Management', icon: 'fa-tools', path: '/admin/equipment-management' },
    { id: 'courses', label: 'Course Management', icon: 'fa-book', path: '/admin/courses' },
    { id: 'lab-classes', label: 'Lab Classes', icon: 'fa-flask', path: '/admin/lab-classes' },
    { id: 'equipment-requests', label: 'Equipment Requests', icon: 'fa-clipboard-list', path: '/admin/equipment-requests' },
    { id: 'equipment-analytics', label: 'Analytics', icon: 'fa-chart-line', path: '/admin/equipment-analytics' }
  ];

  // HOD specific items
  const hodItems = [
    { id: 'professor-approvals', label: 'Professor Approvals', icon: 'fa-user-check', path: '/admin/professor-approvals' },
    { id: 'course-approvals', label: 'Course Approvals', icon: 'fa-book-open', path: '/admin/course-approvals' },
    { id: 'escalated-requests', label: 'Escalated Requests', icon: 'fa-exclamation-triangle', path: '/admin/escalated-requests' },
    { id: 'department-overview', label: 'Department Overview', icon: 'fa-building', path: '/admin/department-overview' }
  ];

  // Build menu items based on user roles
  let menuItems = [...baseMenuItems];
  
  if (isAdmin()) {
    menuItems = [...menuItems, ...roomAdminItems];
  }
  
  if (isEquipmentAdmin()) {
    menuItems = [...menuItems, ...equipmentAdminItems];
  }
  
  if (isHOD()) {
    menuItems = [...menuItems, ...hodItems];
  }

  // Add common items for all admin types
  const commonItems = [
    { id: 'analytics', label: 'System Analytics', icon: 'fa-chart-bar', path: '/admin/analytics' },
    { id: 'logs', label: 'Activity Logs', icon: 'fa-history', path: '/admin/logs' }
  ];
  
  menuItems = [...menuItems, ...commonItems];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <div className="admin-avatar">
          <i className={`fas ${isHOD() ? 'fa-user-tie' : isEquipmentAdmin() ? 'fa-tools' : 'fa-user-shield'}`}></i>
        </div>
        <div className="admin-info">
          <div className="admin-name">{user?.fullName}</div>
          <div className="admin-role">{getUserRole()}</div>
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
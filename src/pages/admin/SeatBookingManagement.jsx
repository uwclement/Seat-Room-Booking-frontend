import React from 'react';
import { useAdminSeatBooking } from '../../hooks/useAdminSeatBooking';
import BookingFilters from '../../components/admin/SeatBookingManagement/BookingFilters';
import BookingActions from '../../components/admin/SeatBookingManagement/BookingActions';
import BookingList from '../../components/admin/SeatBookingManagement/BookingList';
import Alert from '../../components/common/Alert';
import AdminSidebar from '../../components/common/AdminSidebar';
import '../../assets/css/admin.css';

const SeatBookingManagement = () => {
  const { 
    error, 
    success, 
    setError, 
    setSuccess, 
    getBookingStats,
    viewMode 
  } = useAdminSeatBooking();

  const stats = getBookingStats();

  const getViewModeTitle = () => {
    switch (viewMode) {
      case 'current':
        return 'Current Active Bookings';
      case 'date':
        return 'Bookings by Date';
      case 'range':
        return 'Bookings by Date Range';
      default:
        return 'Seat Bookings';
    }
  };

  return (
    <div className="admin-page-container">
      <AdminSidebar activePage="seat-bookings" />
      
      <div className="admin-content">
        <div className="admin-header">
          <div className="header-content">
            <div>
              <h1>Seat Booking Management</h1>
              <p className="admin-subtitle">
                Monitor and manage seat bookings, check-ins, and cancellations
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-item available">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-item library">
            <div className="stat-value">{stats.reserved}</div>
            <div className="stat-label">Reserved</div>
          </div>
          <div className="stat-item study">
            <div className="stat-value">{stats.checkedIn}</div>
            <div className="stat-label">Checked In</div>
          </div>
          <div className="stat-item maintenance">
            <div className="stat-value">{stats.cancelled}</div>
            <div className="stat-label">Cancelled</div>
          </div>
          <div className="stat-item disabled">
            <div className="stat-value">{stats.noShow}</div>
            <div className="stat-label">No Show</div>
          </div>
          <div className="stat-item completed">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            type="danger"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess('')}
            autoClose={true}
          />
        )}

        {/* Filters Section */}
        <div className="admin-card">
          <div className="card-header">
            <h3>Search & Filter Bookings</h3>
          </div>
          <div className="card-body">
            <BookingFilters />
          </div>
        </div>

        {/* Actions Section */}
        <div className="admin-card">
          <div className="card-header">
            <h3>Booking Actions</h3>
          </div>
          <div className="card-body">
            <BookingActions />
          </div>
        </div>

        {/* Bookings List */}
        <div className="admin-card">
          <div className="card-header">
            <h3>{getViewModeTitle()}</h3>
            <p className="card-subtitle">
              {stats.total} booking{stats.total !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="card-body">
            <BookingList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatBookingManagement;
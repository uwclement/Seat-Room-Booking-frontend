import React from 'react';
import { useAdminSeatBooking } from '../../../hooks/useAdminSeatBooking';

const BookingFilters = () => {
  const {
    filters,
    viewMode,
    updateFilters,
    clearFilters,
    fetchCurrentBookings,
    fetchBookingsByDate,
    fetchBookingsInRange,
    setViewMode
  } = useAdminSeatBooking();

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    clearFilters();
    
    if (mode === 'current') {
      fetchCurrentBookings();
    }
  };

  const handleDateSearch = () => {
    if (filters.date) {
      fetchBookingsByDate(filters.date);
    }
  };

  const handleRangeSearch = () => {
    if (filters.startDate && filters.endDate) {
      fetchBookingsInRange(filters.startDate, filters.endDate);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-filters">
      {/* View Mode Selection */}
      <div className="filter-section">
        <h4>View Mode</h4>
        <div className="view-mode-buttons">
          <button
            className={`btn ${viewMode === 'current' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleViewModeChange('current')}
          >
            Current Bookings
          </button>
          <button
            className={`btn ${viewMode === 'date' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleViewModeChange('date')}
          >
            By Date
          </button>
          <button
            className={`btn ${viewMode === 'range' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleViewModeChange('range')}
          >
            Date Range
          </button>
        </div>
      </div>

      {/* Date Filters */}
      {viewMode === 'date' && (
        <div className="filter-section">
          <h4>Select Date</h4>
          <div className="filter-row">
            <input
              type="date"
              value={filters.date}
              onChange={(e) => updateFilters({ date: e.target.value })}
              className="form-control"
              max={today}
            />
            <button
              className="btn btn-primary"
              onClick={handleDateSearch}
              disabled={!filters.date}
            >
              Search
            </button>
          </div>
        </div>
      )}

      {viewMode === 'range' && (
        <div className="filter-section">
          <h4>Select Date Range</h4>
          <div className="filter-row">
            <input
              type="date"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => updateFilters({ startDate: e.target.value })}
              className="form-control"
              max={today}
            />
            <input
              type="date"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => updateFilters({ endDate: e.target.value })}
              className="form-control"
              min={filters.startDate}
              max={today}
            />
            <button
              className="btn btn-primary"
              onClick={handleRangeSearch}
              disabled={!filters.startDate || !filters.endDate}
            >
              Search
            </button>
          </div>
        </div>
      )}

      {/* Content Filters */}
      <div className="filter-section">
        <h4>Filter Results</h4>
        <div className="filter-grid">
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="form-control"
            >
              <option value="">All Statuses</option>
              <option value="RESERVED">Reserved</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>

          <div className="filter-group">
            <label>User</label>
            <input
              type="text"
              placeholder="Search by user name or ID..."
              value={filters.user}
              onChange={(e) => updateFilters({ user: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="filter-group">
            <label>Seat</label>
            <input
              type="text"
              placeholder="Search by seat number or ID..."
              value={filters.seat}
              onChange={(e) => updateFilters({ seat: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="filter-group">
            <label>&nbsp;</label>
            <button
              className="btn btn-outline-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFilters;
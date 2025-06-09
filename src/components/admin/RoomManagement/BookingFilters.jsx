import React, { useState } from 'react';
import { useAdminRoomBooking } from '../../../context/AdminRoomBookingContext';

const BookingFilters = () => {
  const {
    filters,
    updateFilters,
    clearFilters,
    loadAllBookings
  } = useAdminRoomBooking();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    updateFilters({ [field]: value });
  };

  const handleDateRangeChange = (field, value) => {
    const newDateRange = { ...localFilters.dateRange, [field]: value };
    const newFilters = { ...localFilters, dateRange: newDateRange };
    setLocalFilters(newFilters);
    updateFilters({ dateRange: newDateRange });
    
    // Auto-load bookings when date range changes
    if (newDateRange.start && newDateRange.end) {
      loadAllBookings(newDateRange);
    }
  };

  const handleClearFilters = () => {
    setLocalFilters({
      status: '',
      building: '',
      dateRange: { start: '', end: '' },
      roomCategory: '',
      hasCapacityWarning: false,
      hasEquipmentRequests: false
    });
    clearFilters();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.building) count++;
    if (filters.roomCategory) count++;
    if (filters.dateRange.start && filters.dateRange.end) count++;
    if (filters.hasCapacityWarning) count++;
    if (filters.hasEquipmentRequests) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="booking-filters">
      <div className="filters-header">
        <h3>
          <i className="fas fa-filter"></i>
          Filters
          {activeFilterCount > 0 && (
            <span className="filter-count">{activeFilterCount}</span>
          )}
        </h3>
        
        <div className="filter-actions">
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'}`}></i>
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
          
          {activeFilterCount > 0 && (
            <button 
              className="btn btn-sm btn-secondary"
              onClick={handleClearFilters}
            >
              <i className="fas fa-times"></i>
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="filters-content">
        {/* Basic Filters - Always Visible */}
        <div className="filter-row basic-filters">
          <div className="filter-group">
            <label>Status</label>
            <select 
              value={localFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-control"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date Range</label>
            <div className="date-range-inputs">
              <input 
                type="date"
                value={localFilters.dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="form-control"
                placeholder="Start Date"
              />
              <span className="date-separator">to</span>
              <input 
                type="date"
                value={localFilters.dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="form-control"
                placeholder="End Date"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Building</label>
            <select 
              value={localFilters.building}
              onChange={(e) => handleFilterChange('building', e.target.value)}
              className="form-control"
            >
              <option value="">All Buildings</option>
              <option value="Main Building">Main Building</option>
              <option value="Library">Library</option>
              <option value="Science Block">Science Block</option>
              <option value="Engineering Block">Engineering Block</option>
              <option value="Business School">Business School</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {showAdvanced && (
          <div className="filter-row advanced-filters">
            <div className="filter-group">
              <label>Room Category</label>
              <select 
                value={localFilters.roomCategory}
                onChange={(e) => handleFilterChange('roomCategory', e.target.value)}
                className="form-control"
              >
                <option value="">All Categories</option>
                <option value="LIBRARY_ROOM">Library Room</option>
                <option value="STUDY_ROOM">Study Room</option>
                <option value="CLASS_ROOM">Class Room</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="CONFERENCE_ROOM">Conference Room</option>
              </select>
            </div>

            <div className="filter-group checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={localFilters.hasCapacityWarning}
                  onChange={(e) => handleFilterChange('hasCapacityWarning', e.target.checked)}
                />
                <span className="checkmark"></span>
                Only Capacity Warnings
              </label>
            </div>

            <div className="filter-group checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={localFilters.hasEquipmentRequests}
                  onChange={(e) => handleFilterChange('hasEquipmentRequests', e.target.checked)}
                />
                <span className="checkmark"></span>
                Only Equipment Requests
              </label>
            </div>

            <div className="filter-group quick-filters">
              <label>Quick Filters</label>
              <div className="quick-filter-buttons">
                <button 
                  className={`btn btn-sm ${localFilters.status === 'PENDING' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleFilterChange('status', localFilters.status === 'PENDING' ? '' : 'PENDING')}
                >
                  Pending Only
                </button>
                
                <button 
                  className={`btn btn-sm ${localFilters.hasCapacityWarning ? 'btn-warning' : 'btn-outline'}`}
                  onClick={() => handleFilterChange('hasCapacityWarning', !localFilters.hasCapacityWarning)}
                >
                  Capacity Issues
                </button>
                
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    handleDateRangeChange('start', today);
                    handleDateRangeChange('end', today);
                  }}
                >
                  Today Only
                </button>
                
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => {
                    const today = new Date();
                    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
                    handleDateRangeChange('start', weekStart.toISOString().split('T')[0]);
                    handleDateRangeChange('end', weekEnd.toISOString().split('T')[0]);
                  }}
                >
                  This Week
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="active-filters">
          <span className="active-filters-label">Active filters:</span>
          <div className="active-filter-tags">
            {filters.status && (
              <span className="filter-tag">
                Status: {filters.status}
                <button onClick={() => handleFilterChange('status', '')}>
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            
            {filters.building && (
              <span className="filter-tag">
                Building: {filters.building}
                <button onClick={() => handleFilterChange('building', '')}>
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            
            {filters.roomCategory && (
              <span className="filter-tag">
                Category: {filters.roomCategory}
                <button onClick={() => handleFilterChange('roomCategory', '')}>
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            
            {filters.dateRange.start && filters.dateRange.end && (
              <span className="filter-tag">
                Date: {filters.dateRange.start} to {filters.dateRange.end}
                <button onClick={() => {
                  handleDateRangeChange('start', '');
                  handleDateRangeChange('end', '');
                }}>
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            
            {filters.hasCapacityWarning && (
              <span className="filter-tag">
                Capacity Warnings
                <button onClick={() => handleFilterChange('hasCapacityWarning', false)}>
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            
            {filters.hasEquipmentRequests && (
              <span className="filter-tag">
                Equipment Requests
                <button onClick={() => handleFilterChange('hasEquipmentRequests', false)}>
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingFilters;
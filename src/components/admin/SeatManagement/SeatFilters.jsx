import React from 'react';
import { useAdmin } from '../../../hooks/useAdmin';

const SeatFilters = () => {
  const { filters, setFilters } = useAdmin();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="seat-filters">
      <div className="filter-title">Filter Seats</div>
      <div className="filters-container">
        <div className="filter-item">
          <label htmlFor="zone-filter">Zone</label>
          <select
            id="zone-filter"
            name="zoneType"
            value={filters.zoneType}
            onChange={handleFilterChange}
          >
            <option value="">All Zones</option>
            <option value="SILENT">Silent Zone</option>
            <option value="COLLABORATION">Collaboration Zone</option>
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="desktop-filter">Desktop</label>
          <select
            id="desktop-filter"
            name="hasDesktop"
            value={filters.hasDesktop}
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            <option value="true">With Desktop</option>
            <option value="false">Without Desktop</option>
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled (Maintenance)</option>
          </select>
        </div>

        <button 
          className="btn btn-outline-secondary" 
          onClick={() => setFilters({
            zoneType: '',
            hasDesktop: '',
            status: ''
          })}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default SeatFilters;
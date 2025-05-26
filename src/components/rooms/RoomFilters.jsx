import React from 'react';

const RoomFilters = ({ filters, setFilters, searchKeyword, setSearchKeyword, onClearFilters }) => {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: '',
      available: '',
      minCapacity: '',
      maxCapacity: '',
      building: '',
      floor: '',
      department: '',
      requiresApproval: ''
    });
    setSearchKeyword('');
    onClearFilters && onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchKeyword !== '';

  return (
    <div className="room-filters">
      <div className="filter-header">
        <h3 className="filter-title">Search & Filter Rooms</h3>
        {hasActiveFilters && (
          <button className="btn btn-sm btn-outline" onClick={clearAllFilters}>
            <i className="fas fa-times"></i>
            Clear All
          </button>
        )}
      </div>

      <div className="filters-container">
        {/* Search */}
        <div className="filter-item search-filter">
          <label>Search</label>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search rooms by name, number, or description..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="form-control"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
        </div>

        {/* Category Filter */}
        <div className="filter-item">
          <label>Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="form-control"
          >
            <option value="">All Categories</option>
            <option value="LIBRARY_ROOM">Library Room</option>
            <option value="STUDY_ROOM">Study Room</option>
            <option value="CLASS_ROOM">Class Room</option>
          </select>
        </div>

        {/* Availability Filter */}
        <div className="filter-item">
          <label>Status</label>
          <select
            value={filters.available}
            onChange={(e) => handleFilterChange('available', e.target.value)}
            className="form-control"
          >
            <option value="">All Status</option>
            <option value="true">Available</option>
            <option value="false">Disabled</option>
          </select>
        </div>

        {/* Capacity Filters */}
        <div className="filter-item">
          <label>Min Capacity</label>
          <input
            type="number"
            placeholder="Min"
            value={filters.minCapacity}
            onChange={(e) => handleFilterChange('minCapacity', e.target.value)}
            className="form-control"
            min="1"
          />
        </div>

        <div className="filter-item">
          <label>Max Capacity</label>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxCapacity}
            onChange={(e) => handleFilterChange('maxCapacity', e.target.value)}
            className="form-control"
            min="1"
          />
        </div>

        {/* Location Filters */}
        <div className="filter-item">
          <label>Building</label>
          <input
            type="text"
            placeholder="Building name"
            value={filters.building}
            onChange={(e) => handleFilterChange('building', e.target.value)}
            className="form-control"
          />
        </div>

        <div className="filter-item">
          <label>Floor</label>
          <input
            type="text"
            placeholder="Floor"
            value={filters.floor}
            onChange={(e) => handleFilterChange('floor', e.target.value)}
            className="form-control"
          />
        </div>

        <div className="filter-item">
          <label>Department</label>
          <input
            type="text"
            placeholder="Department"
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="form-control"
          />
        </div>

        {/* Approval Filter */}
        <div className="filter-item">
          <label>Requires Approval</label>
          <select
            value={filters.requiresApproval}
            onChange={(e) => handleFilterChange('requiresApproval', e.target.value)}
            className="form-control"
          >
            <option value="">All</option>
            <option value="true">Requires Approval</option>
            <option value="false">No Approval Required</option>
          </select>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="active-filters">
          <div className="filter-tags">
            {searchKeyword && (
              <span className="filter-tag">
                Search: "{searchKeyword}"
                <button onClick={() => setSearchKeyword('')}>
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            {Object.entries(filters).map(([key, value]) => 
              value && (
                <span key={key} className="filter-tag">
                  {key}: {value}
                  <button onClick={() => handleFilterChange(key, '')}>
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
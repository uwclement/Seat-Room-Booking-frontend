import React, { useState } from 'react';
import { useUserManagement } from '../../../hooks/useUserManagement';

const UserFilters = ({ activeTab }) => {
  const {
    filters,
    handleApplyFilters,
    handleClearFilters,
    handleSearch
  } = useUserManagement();

  const [localFilters, setLocalFilters] = useState(filters);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    handleApplyFilters(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      userType: '',
      role: '',
      location: '',
      active: '',
      search: ''
    };
    setLocalFilters(clearedFilters);
    setSearchQuery('');
    handleClearFilters();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const getAvailableRoles = () => {
    switch (activeTab) {
      case 'staff':
        return [
          { value: 'ROLE_LIBRARIAN', label: 'Librarian' },
          { value: 'ROLE_PROFESSOR', label: 'Professor' },
          { value: 'ROLE_ADMIN', label: 'Admin' },
          { value: 'ROLE_EQUIPMENT_ADMIN', label: 'Equipment Admin' },
          { value: 'ROLE_HOD', label: 'HOD' }
        ];
      case 'librarians':
        return [{ value: 'ROLE_LIBRARIAN', label: 'Librarian' }];
      case 'professors':
        return [{ value: 'ROLE_PROFESSOR', label: 'Professor' }];
      case 'admins':
        return [
          { value: 'ROLE_ADMIN', label: 'Admin' },
          { value: 'ROLE_EQUIPMENT_ADMIN', label: 'Equipment Admin' },
          { value: 'ROLE_HOD', label: 'HOD' }
        ];
      default:
        return [
          { value: 'ROLE_USER', label: 'Student' },
          { value: 'ROLE_LIBRARIAN', label: 'Librarian' },
          { value: 'ROLE_PROFESSOR', label: 'Professor' },
          { value: 'ROLE_ADMIN', label: 'Admin' },
          { value: 'ROLE_EQUIPMENT_ADMIN', label: 'Equipment Admin' },
          { value: 'ROLE_HOD', label: 'HOD' }
        ];
    }
  };

  return (
    <div className="user-filters">
      <div className="filters-row">
        {/* Search */}
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </form>

        {/* User Type Filter (only show if not in specific tab) */}
        {activeTab === 'all' && (
          <select
            value={localFilters.userType}
            onChange={(e) => handleFilterChange('userType', e.target.value)}
            className="filter-select"
          >
            <option value="">All User Types</option>
            <option value="STUDENT">Students</option>
            <option value="STAFF">Staff</option>
          </select>
        )}

        {/* Role Filter */}
        <select
          value={localFilters.role}
          onChange={(e) => handleFilterChange('role', e.target.value)}
          className="filter-select"
        >
          <option value="">All Roles</option>
          {getAvailableRoles().map(role => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>

        {/* Location Filter */}
        <select
          value={localFilters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          className="filter-select"
        >
          <option value="">All Locations</option>
          <option value="GISHUSHU">Gishushu Campus</option>
          <option value="MASORO">Masoro Campus</option>
          <option value="KIGALI">Kigali</option>
          <option value="NYANZA">Nyanza</option>
          <option value="MUSANZE">Musanze</option>
        </select>

        {/* Status Filter */}
        <select
          value={localFilters.active}
          onChange={(e) => handleFilterChange('active', e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        {/* Filter Actions */}
        <div className="filter-actions">
          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={applyFilters}
          >
            <i className="fas fa-filter"></i>
            Apply
          </button>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={clearFilters}
          >
            <i className="fas fa-times"></i>
            Clear
          </button>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="quick-filters">
        <span className="quick-filter-label">Quick filters:</span>
        <button 
          className="quick-filter-chip"
          onClick={() => {
            setLocalFilters(prev => ({ ...prev, location: 'GISHUSHU', role: 'ROLE_LIBRARIAN' }));
            handleApplyFilters({ ...localFilters, location: 'GISHUSHU', role: 'ROLE_LIBRARIAN' });
          }}
        >
          Gishushu Librarians
        </button>
        <button 
          className="quick-filter-chip"
          onClick={() => {
            setLocalFilters(prev => ({ ...prev, location: 'MASORO', role: 'ROLE_LIBRARIAN' }));
            handleApplyFilters({ ...localFilters, location: 'MASORO', role: 'ROLE_LIBRARIAN' });
          }}
        >
          Masoro Librarians
        </button>
        <button 
          className="quick-filter-chip"
          onClick={() => {
            setLocalFilters(prev => ({ ...prev, role: 'ROLE_PROFESSOR' }));
            handleApplyFilters({ ...localFilters, role: 'ROLE_PROFESSOR' });
          }}
        >
          Professors
        </button>
        <button 
          className="quick-filter-chip"
          onClick={() => {
            setLocalFilters(prev => ({ ...prev, active: 'false' }));
            handleApplyFilters({ ...localFilters, active: 'false' });
          }}
        >
          Inactive Users
        </button>
      </div>
    </div>
  );
};

export default UserFilters;
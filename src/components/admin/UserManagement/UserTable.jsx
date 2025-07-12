import React, { useState } from 'react';
import { useUserManagement } from '../../../hooks/useUserManagement';

const UserTable = ({ users, onEditUser, activeTab }) => {
  const {
    selectedUsers,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    handleUpdateUserStatus,
    handleDeleteUser
  } = useUserManagement();

  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedUsers = () => {
    if (!sortConfig.key) return users;
    
    return [...users].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      clearSelection();
    } else {
      selectAllUsers();
    }
  };

  const formatRole = (roles) => {
    if (!roles || roles.length === 0) return 'No roles';
    
    const roleNames = roles.map(role => {
      switch (role) {
        case 'ROLE_USER': return 'Student';
        case 'ROLE_ADMIN': return 'Admin';
        case 'ROLE_LIBRARIAN': return 'Librarian';
        case 'ROLE_PROFESSOR': return 'Professor';
        case 'ROLE_EQUIPMENT_ADMIN': return 'Equipment Admin';
        case 'ROLE_HOD': return 'HOD';
        default: return role.replace('ROLE_', '');
      }
    });
    
    return roleNames.join(', ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (user) => {
    if (user.active === false) {
      return <span className="status-badge status-inactive">Inactive</span>;
    }
    if (!user.emailVerified) {
      return <span className="status-badge status-pending">Unverified</span>;
    }
    if (user.mustChangePassword) {
      return <span className="status-badge status-warning">Must Change Password</span>;
    }
    return <span className="status-badge status-active">Active</span>;
  };

  const getLocationBadge = (location) => {
    const locationColors = {
      'GISHUSHU': 'location-gishushu',
      'MASORO': 'location-masoro',
      'KIGALI': 'location-kigali',
      'NYANZA': 'location-nyanza',
      'MUSANZE': 'location-musanze'
    };
    
    return (
      <span className={`location-badge ${locationColors[location] || 'location-default'}`}>
        {location}
      </span>
    );
  };

  const sortedUsers = getSortedUsers();

  if (users.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-users"></i>
        <h4>No Users Found</h4>
        <p>No users match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="user-table-container">
      <div className="table-header">
        <div className="table-info">
          <span>{users.length} users found</span>
          {selectedUsers.length > 0 && (
            <span className="selection-info">
              ({selectedUsers.length} selected)
            </span>
          )}
        </div>
      </div>

      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('fullName')}
              >
                Name
                {sortConfig.key === 'fullName' && (
                  <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                )}
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('email')}
              >
                Email
                {sortConfig.key === 'email' && (
                  <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                )}
              </th>
              <th>Identifier</th>
              <th>Role(s)</th>
              <th 
                className="sortable"
                onClick={() => handleSort('location')}
              >
                Location
                {sortConfig.key === 'location' && (
                  <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                )}
              </th>
              <th>Status</th>
              {activeTab === 'librarians' && (
                <>
                  <th>Working Day</th>
                  <th>Active Today</th>
                  <th>Default</th>
                </>
              )}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                  />
                </td>
                <td>
                  <div className="user-info">
                    <div className="user-name">{user.fullName}</div>
                    <div className="user-type">{user.userType}</div>
                  </div>
                </td>
                <td>
                  <div className="user-email">
                    {user.email}
                    {!user.emailVerified && (
                      <i className="fas fa-exclamation-triangle text-warning" title="Email not verified"></i>
                    )}
                  </div>
                </td>
                <td>
                  <span className="user-identifier">
                    {user.identifier }
                  </span>
                </td>
                <td>
                  <div className="user-roles">
                    {formatRole(user.roles)}
                  </div>
                </td>
                <td>
                  {getLocationBadge(user.location)}
                </td>
                <td>
                  {getStatusBadge(user)}
                </td>
                {activeTab === 'librarians' && (
                  <>
                    <td>{formatDate(user.workingDay)}</td>
                    <td>
                      {user.activeToday ? (
                        <span className="status-badge status-active">Yes</span>
                      ) : (
                        <span className="status-badge status-inactive">No</span>
                      )}
                    </td>
                    <td>
                      {user.isDefault ? (
                        <span className="status-badge status-default">Default</span>
                      ) : (
                        <span className="status-badge status-regular">Regular</span>
                      )}
                    </td>
                  </>
                )}
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => onEditUser(user)}
                      title="Edit user"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    
                    {user.active !== false ? (
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleUpdateUserStatus(user.id, 'DISABLED')}
                        title="Disable user"
                      >
                        <i className="fas fa-ban"></i>
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleUpdateUserStatus(user.id, 'ENABLED')}
                        title="Enable user"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    )}
                    
                    {user.userType === 'STAFF' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setConfirmDelete(user.id)}
                        title="Delete user"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button 
                className="close-button" 
                onClick={() => setConfirmDelete(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => {
                  handleDeleteUser(confirmDelete);
                  setConfirmDelete(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
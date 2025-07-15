// src/components/admin/UserManagement/UserManagementDashboard.js
import React, { useState, useEffect } from 'react';
import { useUserManagement } from '../../../hooks/useUserManagement';
import { useAuth } from '../../../hooks/useAuth';
import UserTable from './UserTable';
import UserFilters from './UserFilters';
import CreateStaffModal from './CreateStaffModal';
import EditUserModal from './EditUserModal';
import BulkActionModal from './BulkActionModal';
import UserStatsCards from './UserStatsCards';
import LibrarianManagement from './LibrarianManagement';
import Alert from '../../common/Alert';
import LoadingSpinner from '../../common/LoadingSpinner';
import AdminPasswordManagement from './AdminPasswordManagement';

const UserManagementDashboard = () => {
  const { user } = useAuth();
  const {
    users,
    loading,
    error,
    success,
    selectedUsers,
    userStats,
    fetchUsers,
    fetchUserStats,
    clearSelection,
    setError,
    setSuccess
  } = useUserManagement();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showLibrarianModal, setShowLibrarianModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, []);

  const handleCreateStaff = () => {
    setShowCreateModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleBulkAction = () => {
    if (selectedUsers.length === 0) {
      setError('Please select users first');
      return;
    }
    setShowBulkModal(true);
  };

  const handleRefresh = () => {
    fetchUsers();
    fetchUserStats();
    clearSelection();
  };

  const getFilteredUsers = () => {
    switch (activeTab) {
      case 'students':
        return users.filter(user => user.userType === 'STUDENT');
      case 'staff':
        return users.filter(user => user.userType === 'STAFF');
      case 'librarians':
        return users.filter(user => user.roles?.includes('ROLE_LIBRARIAN'));
      case 'professors':
        return users.filter(user => user.roles?.includes('ROLE_PROFESSOR'));
      case 'admins':
        return users.filter(user => user.roles?.includes('ROLE_ADMIN'));
      default:
        return users;
    }
  };

  const tabCounts = {
    all: users.length,
    students: users.filter(u => u.userType === 'STUDENT').length,
    staff: users.filter(u => u.userType === 'STAFF').length,
    librarians: users.filter(u => u.roles?.includes('ROLE_LIBRARIAN')).length,
    professors: users.filter(u => u.roles?.includes('ROLE_PROFESSOR')).length,
    admins: users.filter(u => u.roles?.includes('ROLE_ADMIN')).length
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>User Management</h1>
            <p className="admin-subtitle">
              Manage students, staff, and system users
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={handleRefresh}
              disabled={loading}
            >
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleCreateStaff}
            >
              <i className="fas fa-user-plus"></i>
              Add Staff
            </button>
            <button 
              className="btn btn-info"
              onClick={() => setShowLibrarianModal(true)}
            >
              <i className="fas fa-book-reader"></i>
              Manage Librarians
            </button>
            <button 
             className="btn btn-warning"
             onClick={() => setShowPasswordModal(true)}
            >
               <i className="fas fa-key"></i>
                Password Management
            </button>
            {selectedUsers.length > 0 && (
              <button 
                className="btn btn-warning"
                onClick={handleBulkAction}
              >
                <i className="fas fa-tasks"></i>
                Bulk Actions ({selectedUsers.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Statistics Cards */}
      <UserStatsCards stats={userStats} />

      {/* Alerts */}
      {error && (
        <Alert type="danger" message={error} onClose={() => setError('')} />
      )}
      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}

      {loading && <LoadingSpinner />}

      
      {/* User Management Tabs */}
      <div className="admin-card">
        <div className="card-header">
          <div className="user-management-tabs">
            <button 
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Users ({tabCounts.all})
            </button>
            <button 
              className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              Students ({tabCounts.students})
            </button>
            <button 
              className={`tab-button ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => setActiveTab('staff')}
            >
              Staff ({tabCounts.staff})
            </button>
            <button 
              className={`tab-button ${activeTab === 'librarians' ? 'active' : ''}`}
              onClick={() => setActiveTab('librarians')}
            >
              Librarians ({tabCounts.librarians})
            </button>
            <button 
              className={`tab-button ${activeTab === 'professors' ? 'active' : ''}`}
              onClick={() => setActiveTab('professors')}
            >
              Professors ({tabCounts.professors})
            </button>
            <button 
              className={`tab-button ${activeTab === 'admins' ? 'active' : ''}`}
              onClick={() => setActiveTab('admins')}
            >
              Admins ({tabCounts.admins})
            </button>
          </div>
        </div>

        <div className="card-body">
          {/* Filters */}
          <UserFilters activeTab={activeTab} />

          {/* User Table */}
          <UserTable 
            users={getFilteredUsers()}
            onEditUser={handleEditUser}
            activeTab={activeTab}
          />
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateStaffModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && editingUser && (
        <EditUserModal
          show={showEditModal}
          user={editingUser}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
        />
      )}

       
       {showPasswordModal && (
        <AdminPasswordManagement
       show={showPasswordModal}
       onClose={() => setShowPasswordModal(false)}
      />
     )}

      {showBulkModal && (
        <BulkActionModal
          show={showBulkModal}
          selectedUsers={selectedUsers}
          onClose={() => setShowBulkModal(false)}
        />
      )}

      {showLibrarianModal && (
        <LibrarianManagement
          show={showLibrarianModal}
          onClose={() => setShowLibrarianModal(false)}
        />
      )}
    </div>
  );
};

export default UserManagementDashboard;
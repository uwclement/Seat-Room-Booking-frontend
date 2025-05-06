import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAllUsers } from '../../api/user';
import Alert from '../../components/common/Alert';
import '../../assets/css/dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        setError('Failed to fetch users. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome, {user?.fullName}. You have admin access to the system.
          </p>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">System Overview</h2>
          </div>
          
          <div className="dashboard-stats">
            {/* Total Users */}
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon blue">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-card-info">
                  <div className="stat-card-title">Total Users</div>
                  <div className="stat-card-value">{loading ? "Loading..." : users.length}</div>
                </div>
              </div>
            </div>

            {/* Total Seats */}
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon green">
                  <i className="fas fa-chair"></i>
                </div>
                <div className="stat-card-info">
                  <div className="stat-card-title">Total Seats</div>
                  <div className="stat-card-value">36</div>
                </div>
              </div>
            </div>

            {/* Total Rooms */}
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon yellow">
                  <i className="fas fa-door-open"></i>
                </div>
                <div className="stat-card-info">
                  <div className="stat-card-title">Total Rooms</div>
                  <div className="stat-card-value">6</div>
                </div>
              </div>
            </div>

            {/* Active Reservations */}
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon purple">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="stat-card-info">
                  <div className="stat-card-title">Active Reservations</div>
                  <div className="stat-card-value">12</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">User Management</h2>
          </div>
          
          {error && (
            <Alert
              type="danger"
              message={error}
              onClose={() => setError('')}
            />
          )}
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Student ID</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center">Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.studentId}</td>
                      <td>{user.roles.includes('ROLE_ADMIN') ? 'Admin' : 'User'}</td>
                      <td>
                        <span className={`status-badge ${user.emailVerified ? 'active' : 'pending'}`}>
                          {user.emailVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
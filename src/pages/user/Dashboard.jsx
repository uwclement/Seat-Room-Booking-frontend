import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../assets/css/dashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome, {user?.fullName}</h1>
        </div>

        <div className="dashboard-section">
          <div className="card-grid">
            {/* Seats Card */}
            <div className="feature-card">
              <div className="feature-card-header">
                <div className="feature-card-icon blue">
                  <i className="fas fa-chair"></i>
                </div>
                <h3 className="feature-card-title">Book a Seat</h3>
              </div>
              <div className="feature-card-content">
                <p>Reserve a library seat for your study sessions.</p>
              </div>
              <div className="feature-card-footer">
                <Link to="/seats" className="btn btn-primary">View available seats</Link>
              </div>
            </div>

            {/* Rooms Card */}
            <div className="feature-card">
              <div className="feature-card-header">
                <div className="feature-card-icon green">
                  <i className="fas fa-door-open"></i>
                </div>
                <h3 className="feature-card-title">Book a Room</h3>
              </div>
              <div className="feature-card-content">
                <p>Reserve a study room for group work or private study.</p>
              </div>
              <div className="feature-card-footer">
                <Link to="/rooms" className="btn btn-primary">View available rooms</Link>
              </div>
            </div>

            {/* My Reservations Card */}
            <div className="feature-card">
              <div className="feature-card-header">
                <div className="feature-card-icon yellow">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <h3 className="feature-card-title">My Reservations</h3>
              </div>
              <div className="feature-card-content">
                <p>Manage your active reservations and booking history.</p>
              </div>
              <div className="feature-card-footer">
                <Link to="/reservations" className="btn btn-primary">Manage reservations</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Your Active Reservations</h2>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Type</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Seat C3</td>
                  <td>Seat</td>
                  <td>Today, 2:00 PM - 4:00 PM</td>
                  <td>
                    <span className="status-badge active">Active</span>
                  </td>
                  <td>
                    <Link to="/check-in" className="btn btn-secondary">Check in</Link>
                  </td>
                </tr>
                <tr>
                  <td>Room 101</td>
                  <td>Room</td>
                  <td>Tomorrow, 10:00 AM - 12:00 PM</td>
                  <td>
                    <span className="status-badge pending">Upcoming</span>
                  </td>
                  <td>
                    <button className="btn btn-secondary">Cancel</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
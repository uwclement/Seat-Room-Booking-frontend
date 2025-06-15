import React from 'react';
import { useAdmin } from '../../../hooks/useAdmin';
import SeatFilters from '../SeatManagement/SeatFilters';
import SeatActions from '../SeatManagement/SeatActions';
import SeatList from '../SeatManagement/SeatList';
import Alert from '../../common/Alert';
import ActionButton from '../../common/ActionButton';

const SeatDashboard = () => {
  const { error, success, setError, seats, loading } = useAdmin();

  // Seat statistics
  const seatStats = {
    total: seats?.length || 0,
    available: seats?.filter(seat => !seat.disabled)?.length || 0,
    disabled: seats?.filter(seat => seat.disabled)?.length || 0,
    withDesktop: seats?.filter(seat => seat.hasDesktop)?.length || 0,
    withQR: seats?.filter(seat => seat.hasQRCode)?.length || 0,
    withoutQR: seats?.filter(seat => !seat.hasQRCode)?.length || 0
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>Seat Management</h1>
            <p className="admin-subtitle">
              Manage library seats, QR codes, and maintenance status
            </p>
          </div>
        </div>
      </div>

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
          onClose={() => {}}
          autoClose={true}
        />
      )}

      {/* Seat Statistics */}
      <div className="admin-card">
        <div className="card-header">
          <h2>Seat Statistics</h2>
        </div>
        <div className="card-body">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{seatStats.total}</div>
              <div className="stat-label">Total Seats</div>
            </div>
            <div className="stat-item available">
              <div className="stat-value">{seatStats.available}</div>
              <div className="stat-label">Available</div>
            </div>
            <div className="stat-item disabled">
              <div className="stat-value">{seatStats.disabled}</div>
              <div className="stat-label">Disabled</div>
            </div>
            <div className="stat-item desktop">
              <div className="stat-value">{seatStats.withDesktop}</div>
              <div className="stat-label">With Desktop</div>
            </div>
            <div className="stat-item qr-enabled">
              <div className="stat-value">{seatStats.withQR}</div>
              <div className="stat-label">With QR Code</div>
            </div>
            <div className="stat-item qr-missing">
              <div className="stat-value">{seatStats.withoutQR}</div>
              <div className="stat-label">Missing QR Code</div>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Management */}
      <div className="admin-card">
        <div className="card-header">
          <h2>Seat Operations</h2>
        </div>
        <div className="card-body">
          <SeatFilters />
          <SeatActions />
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading seats...</p>
            </div>
          ) : (
            <SeatList />
          )}
        </div>
      </div>
      
      <ActionButton />
    </div>
  );
};

export default SeatDashboard;
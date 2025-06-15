import React, { useEffect } from 'react';
import { useQRCode } from '../../../context/QRCodeContext';

const QRCodeStatistics = () => {
  const { statistics, fetchStatistics, loading } = useQRCode();

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading && !statistics) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (!statistics) {
    return null;
  }

  return (
    <div className="qr-statistics">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon seats">
            <i className="fas fa-chair"></i>
          </div>
          <div className="stat-content">
            <h4>Seats</h4>
            <div className="stat-numbers">
              <span className="stat-value">{statistics.seatsWithQRCode}</span>
              <span className="stat-total">/ {statistics.totalSeats}</span>
            </div>
            <div className="stat-label">QR Codes Generated</div>
            {statistics.seatsWithoutQRCode > 0 && (
              <div className="stat-warning">
                {statistics.seatsWithoutQRCode} missing QR codes
              </div>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rooms">
            <i className="fas fa-door-open"></i>
          </div>
          <div className="stat-content">
            <h4>Rooms</h4>
            <div className="stat-numbers">
              <span className="stat-value">{statistics.roomsWithQRCode}</span>
              <span className="stat-total">/ {statistics.totalRooms}</span>
            </div>
            <div className="stat-label">QR Codes Generated</div>
            {statistics.roomsWithoutQRCode > 0 && (
              <div className="stat-warning">
                {statistics.roomsWithoutQRCode} missing QR codes
              </div>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon activity">
            <i className="fas fa-history"></i>
          </div>
          <div className="stat-content">
            <h4>Recent Activity</h4>
            <div className="stat-value">{statistics.qrCodesGeneratedLastWeek}</div>
            <div className="stat-label">Generated This Week</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeStatistics;

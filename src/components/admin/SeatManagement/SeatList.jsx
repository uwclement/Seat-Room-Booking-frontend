import React from 'react';
import { useAdmin } from '../../../hooks/useAdmin';
import SeatStatusBadge from './SeatStatusBadge';
import QRCodeButton from '../qr/QRCodeButton';

const SeatList = () => {
  const { 
    seats, 
    loading, 
    error, 
    applyFilters, 
    selectedSeats,
    toggleSeatSelection,
    handleToggleDesktop,
    updateSeat
  } = useAdmin();

  if (loading) {
    return <div className="loading">Loading seats...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const filteredSeats = applyFilters(seats);

  // Group seats by zone for better organization
  const groupedSeats = filteredSeats.reduce((acc, seat) => {
    const zone = seat.zoneType || 'UNCATEGORIZED';
    if (!acc[zone]) {
      acc[zone] = [];
    }
    acc[zone].push(seat);
    return acc;
  }, {});

  // Zone display names mapping
  const zoneNames = {
    'SILENT': 'Silent Zone',
    'COLLABORATION': 'Collaboration Zone',
  };

  const handleQRGenerated = (seatId, qrData) => {
    // Update seat data with QR info
    updateSeat(seatId, {
      hasQRCode: true,
      qrCodeUrl: qrData.qrCodeUrl,
      qrImageUrl: qrData.imagePath,
      qrGeneratedAt: qrData.generatedAt
    });
  };

  return (
    <div className="seat-list">
      {Object.keys(groupedSeats).length === 0 ? (
        <div className="no-seats">No seats found matching the filters.</div>
      ) : (
        Object.keys(groupedSeats).map(zoneType => (
          <div key={zoneType} className="seat-zone-group">
            <h3 className="zone-title">{zoneNames[zoneType] || zoneType}</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      <input 
                        type="checkbox" 
                        onChange={() => {}} 
                        checked={false} 
                        className="hidden-checkbox" 
                      />
                    </th>
                    <th>Seat #</th>
                    <th>Status</th>
                    <th>Desktop</th>
                    <th>Description</th>
                    <th>QR Code</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedSeats[zoneType].map(seat => (
                    <tr 
                      key={seat.id}
                      className={selectedSeats.includes(seat.id) ? 'selected-row' : ''}
                    >
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedSeats.includes(seat.id)}
                          onChange={() => toggleSeatSelection(seat.id)}
                        />
                      </td>
                      <td>{seat.seatNumber}</td>
                      <td>
                        <SeatStatusBadge seatId={seat.id} />
                      </td>
                      <td>
                        <span className={`desktop-badge ${seat.hasDesktop ? 'has-desktop' : 'no-desktop'}`}>
                          {seat.hasDesktop ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>{seat.description || '-'}</td>
                      <td>
                        <QRCodeButton
                          type="seat"
                          resourceId={seat.id}
                          resourceName={seat.seatNumber}
                          hasQR={seat.hasQRCode}
                          onGenerated={(response) => handleQRGenerated(seat.id, response)}
                        />
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleToggleDesktop(seat.id)}
                            title="Toggle Desktop"
                          >
                            <i className="fas fa-desktop"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SeatList;
import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../../hooks/useAdmin';
import SeatStatusBadge from './SeatStatusBadge';
import QRCodeButton from '../qr/QRCodeButton';

const SeatList = () => {
  const { 
    seats: originalSeats, 
    loading, 
    error, 
    applyFilters, 
    selectedSeats,
    toggleSeatSelection,
    handleToggleDesktop,
    updateSeat
  } = useAdmin();

  // Local state to manage seat updates immediately (like rooms do)
  const [seats, setSeats] = useState([]);

  // Initialize and sync with useAdmin seats
  useEffect(() => {
    setSeats(originalSeats || []);
  }, [originalSeats]);

  // QR Generation handler - exactly like rooms
  const createQRHandler = (seatId) => (response) => {
    console.log('💺 QR Generated for seat:', seatId, response);
    
    const updates = {
      hasQRCode: true,
      qrCodeUrl: response.qrCodeUrl,
      qrImageUrl: response.imagePath,
      qrGeneratedAt: response.generatedAt
    };
    
    console.log('💺 Updating seat with:', updates);
    
    // Update local state immediately for UI responsiveness (like rooms)
    setSeats(prevSeats => 
      prevSeats.map(seat => 
        seat.id === seatId 
          ? { ...seat, ...updates }
          : seat
      )
    );

    // Also update via useAdmin hook if available
    if (updateSeat && typeof updateSeat === 'function') {
      try {
        updateSeat(seatId, updates);
        console.log('💺 updateSeat called successfully');
      } catch (error) {
        console.error('💺 Error calling updateSeat:', error);
      }
    } else {
      console.warn('💺 updateSeat function not available');
    }
  };

  if (loading) {
    return <div className="loading">Loading seats...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Use local seats state for filtering
  const filteredSeats = seats ? applyFilters(seats) : [];

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
                      className={selectedSeats?.includes(seat.id) ? 'selected-row' : ''}
                    >
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedSeats?.includes(seat.id) || false}
                          onChange={() => toggleSeatSelection && toggleSeatSelection(seat.id)}
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
                          onGenerated={createQRHandler(seat.id)}
                        />
                        {seat.qrGeneratedAt && (
                          <small className="qr-info">
                            QR generated: {new Date(seat.qrGeneratedAt).toLocaleDateString()}
                          </small>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleToggleDesktop && handleToggleDesktop(seat.id)}
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
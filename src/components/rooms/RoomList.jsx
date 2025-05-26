import React from 'react';

const RoomList = ({ rooms, selectedRooms, onSelect, onSelectAll, onEdit, onToggleStatus, onSetMaintenance, onDuplicate }) => {
  return (
    <div className="room-list">
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedRooms.length === rooms.length && rooms.length > 0}
                  onChange={onSelectAll}
                />
              </th>
              <th>Room</th>
              <th>Category</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Equipment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id} className={selectedRooms.includes(room.id) ? 'selected-row' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRooms.includes(room.id)}
                    onChange={() => onSelect(room.id)}
                  />
                </td>
                <td>
                  <div className="room-info">
                    <div className="room-name">{room.name}</div>
                    <div className="room-number">{room.roomNumber}</div>
                    {room.building && <div className="room-location">{room.building} - {room.floor}</div>}
                  </div>
                </td>
                <td>
                  <span className={`category-badge ${room.category.toLowerCase().replace('_', '-')}`}>
                    {room.category.replace('_', ' ')}
                  </span>
                </td>
                <td>{room.capacity}</td>
                <td>
                  <div className="room-status">
                    <span className={`status-dot ${room.underMaintenance ? 'maintenance' : room.available ? 'available' : 'disabled'}`}></span>
                    <span>{room.underMaintenance ? 'Under Maintenance' : room.available ? 'Available' : 'Disabled'}</span>
                  </div>
                </td>
                <td>
                  <div className="equipment-count">
                    {room.equipment?.length || 0} items
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => onEdit(room)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className={`btn btn-sm ${room.available ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => onToggleStatus(room.id)}
                    >
                      <i className={`fas ${room.available ? 'fa-pause' : 'fa-play'}`}></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => onSetMaintenance(room)}
                    >
                      <i className="fas fa-tools"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => onDuplicate(room)}
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

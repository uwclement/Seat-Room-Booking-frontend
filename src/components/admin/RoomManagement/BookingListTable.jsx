import React from 'react';
import { useAdminRoomBooking } from '../../../context/AdminRoomBookingContext';
import { 
  formatBookingStatus, 
  formatDateTime, 
  formatDuration,
  getCapacityWarningLevel,
  calculateCapacityPercentage
} from '../../../api/adminroombooking';
import {
  approveRejectBooking
} from '../../../api/adminroombooking';

const BookingListTable = ({ bookings, onViewDetails, onManageEquipment, onCancelBooking }) => {
  const {
    selectedBookings,
    toggleBookingSelection,
    selectAllBookings,
    clearSelection,
    isBookingSelected,
    updateBookingInState,
    showSuccess,
    showError,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder
  } = useAdminRoomBooking();

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedBookings.length === bookings.length) {
      clearSelection();
    } else {
      selectAllBookings();
    }
  };

  const handleQuickApproval = async (booking, approved) => {
    try {
      await approveRejectBooking(booking.id, approved);
      updateBookingInState(booking.id, { 
        status: approved ? 'CONFIRMED' : 'REJECTED',
        approvedAt: new Date().toISOString()
      });
      showSuccess(`Booking ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      showError(`Failed to ${approved ? 'approve' : 'reject'} booking`);
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return 'fas fa-sort';
    return sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'CONFIRMED': return 'green';
      case 'CHECKED_IN': return 'blue';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      case 'REJECTED': return 'red';
      case 'NO_SHOW': return 'gray';
      default: return 'gray';
    }
  };

  const renderCapacityIndicator = (booking) => {
    if (!booking.participantSummary) return null;
    
    const { totalAccepted, roomCapacity } = booking.participantSummary;
    const confirmedCount = totalAccepted + 1; // +1 for organizer
    const percentage = calculateCapacityPercentage(confirmedCount, roomCapacity);
    const warningLevel = getCapacityWarningLevel(confirmedCount, roomCapacity);
    
    return (
      <div className={`capacity-indicator ${warningLevel}`} title={`${confirmedCount}/${roomCapacity} participants`}>
        <div className="capacity-bar">
          <div 
            className="capacity-fill" 
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        <span className="capacity-text">{confirmedCount}/{roomCapacity}</span>
      </div>
    );
  };

  const renderEquipmentStatus = (booking) => {
    if (!booking.hasEquipmentRequests) {
      return <span className="equipment-status none">None</span>;
    }
    
    const pendingCount = booking.pendingEquipmentCount || 0;
    
    return (
      <div className="equipment-status-container">
        <span className={`status-badge ${pendingCount > 0 ? 'pending' : 'approved'}`}>
          {pendingCount > 0 ? `${pendingCount} Pending` : 'Approved'}
        </span>
        <button 
          className="btn btn-sm btn-outline"
          onClick={() => onManageEquipment(booking)}
          title="Manage Equipment"
        >
          <i className="fas fa-tools"></i>
        </button>
      </div>
    );
  };

  const renderActionButtons = (booking) => {
    const isPending = booking.status === 'PENDING';
    const canCancel = !['CANCELLED', 'COMPLETED'].includes(booking.status);
    
    return (
      <div className="action-buttons">
        {isPending && (
          <>
            <button 
              className="btn btn-sm btn-success"
              onClick={() => handleQuickApproval(booking, true)}
              title="Quick Approve"
            >
              <i className="fas fa-check"></i>
            </button>
            <button 
              className="btn btn-sm btn-danger"
              onClick={() => handleQuickApproval(booking, false)}
              title="Quick Reject"
            >
              <i className="fas fa-times"></i>
            </button>
          </>
        )}
        
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => onViewDetails(booking)}
          title="View Details"
        >
          <i className="fas fa-eye"></i>
        </button>
        
        {booking.hasEquipmentRequests && (
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => onManageEquipment(booking)}
            title="Manage Equipment"
          >
            <i className="fas fa-tools"></i>
          </button>
        )}
        
        {canCancel && (
          <button 
            className="btn btn-sm btn-warning"
            onClick={() => onCancelBooking(booking)}
            title="Cancel Booking"
          >
            <i className="fas fa-ban"></i>
          </button>
        )}
      </div>
    );
  };

  if (bookings.length === 0) {
    return (
      <div className="no-bookings">
        <div className="no-bookings-icon">
          <i className="fas fa-calendar-times"></i>
        </div>
        <h3>No bookings found</h3>
        <p>There are no bookings matching your current filters.</p>
      </div>
    );
  }

  return (
    <div className="booking-list-table-container">
      <div className="table-header">
        <div className="table-info">
          <span className="booking-count">{bookings.length} bookings found</span>
          {selectedBookings.length > 0 && (
            <span className="selection-count">
              {selectedBookings.length} selected
            </span>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox"
                  checked={selectedBookings.length === bookings.length && bookings.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              
              <th 
                className="sortable"
                onClick={() => handleSort('title')}
              >
                Booking Details
                <i className={getSortIcon('title')}></i>
              </th>
              
              <th 
                className="sortable"
                onClick={() => handleSort('startTime')}
              >
                Date & Time
                <i className={getSortIcon('startTime')}></i>
              </th>
              
              <th>Room</th>
              
              <th 
                className="sortable"
                onClick={() => handleSort('user.fullName')}
              >
                Organizer
                <i className={getSortIcon('user.fullName')}></i>
              </th>
              
              <th>Capacity</th>
              
              <th>Equipment</th>
              
              <th 
                className="sortable"
                onClick={() => handleSort('status')}
              >
                Status
                <i className={getSortIcon('status')}></i>
              </th>
              
              <th>Actions</th>
            </tr>
          </thead>
          
          <tbody>
            {bookings.map((booking) => {
              const statusInfo = formatBookingStatus(booking.status);
              const dateTime = formatDateTime(booking.startTime);
              const endDateTime = formatDateTime(booking.endTime);
              
              return (
                <tr 
                  key={booking.id}
                  className={`${isBookingSelected(booking.id) ? 'selected-row' : ''} ${booking.hasCapacityWarning ? 'capacity-warning' : ''}`}
                >
                  <td>
                    <input 
                      type="checkbox"
                      checked={isBookingSelected(booking.id)}
                      onChange={() => toggleBookingSelection(booking.id)}
                    />
                  </td>
                  
                  <td>
                    <div className="booking-info">
                      <div className="booking-title">{booking.title}</div>
                      {booking.description && (
                        <div className="booking-description">{booking.description}</div>
                      )}
                      <div className="booking-meta">
                        Duration: {formatDuration(booking.durationHours)}
                        {booking.publicBooking && (
                          <span className="category-badge blue">Public</span>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td>
                    <div className="datetime-info">
                      <div className="date-text">{dateTime.date}</div>
                      <div className="time-text">{dateTime.time} - {endDateTime.time}</div>
                    </div>
                  </td>
                  
                  <td>
                    <div className="room-info">
                      <div className="room-name">{booking.room.name}</div>
                      <div className="room-location">
                        {booking.room.roomNumber} • {booking.building}
                        {booking.floor && <span> • Floor {booking.floor}</span>}
                      </div>
                    </div>
                  </td>
                  
                  <td>
                    <div className="organizer-info">
                      <div className="organizer-name">{booking.user.fullName}</div>
                      <div className="organizer-email">{booking.user.email}</div>
                    </div>
                  </td>
                  
                  <td>
                    {renderCapacityIndicator(booking)}
                    {booking.hasCapacityWarning && (
                      <div className="capacity-warning-text">
                        <i className="fas fa-exclamation-triangle"></i>
                        Under capacity
                      </div>
                    )}
                  </td>
                  
                  <td>
                    {renderEquipmentStatus(booking)}
                  </td>
                  
                  <td>
                    <div className="booking-status">
                      <span className={`status-badge ${getStatusColor(booking.status)}`}>
                        <i className="fas fa-circle status-dot"></i>
                        {statusInfo.label}
                      </span>
                      {booking.approvedAt && (
                        <div className="approval-info">
                          Approved {formatDateTime(booking.approvedAt).date}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td>
                    {renderActionButtons(booking)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingListTable;
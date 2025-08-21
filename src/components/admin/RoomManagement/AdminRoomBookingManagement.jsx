import React, { useState, useEffect } from 'react';
import { useAdminRoomBooking } from '../../../context/AdminRoomBookingContext';
import BookingListTable from './BookingListTable';
import BookingFilters from './BookingFilters';
import BookingActions from './BookingActions';
import BookingDetailsModal from './BookingDetailsModal';
import EquipmentApprovalModal from './EquipmentApprovalModal';
import CancellationModal from './CancellationModal';
import Alert from '../../../components/common/Alert';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import '../../../assets/css/admin-room-booking.css';

const AdminRoomBookingManagement = () => {
  const {
    allBookings,
    pendingBookings,
    capacityWarningBookings,
    selectedBookings,
    loadingBookings,
    loadingPending,
    loadingCapacityWarnings,
    error,
    successMessage,
    viewMode,
    setViewMode,
    getFilteredBookings,
    getQuickStats,
    loadAllBookings,
    loadPendingBookings,
    loadCapacityWarnings,
    clearMessages,
    refreshAll
  } = useAdminRoomBooking();

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Component states
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load initial data
    refreshAll();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setViewMode(tab);
    clearMessages();
  };

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleManageEquipment = (booking) => {
    setSelectedBooking(booking);
    setShowEquipmentModal(true);
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setShowCancellationModal(true);
  };

  const quickStats = getQuickStats();
  const filteredBookings = getFilteredBookings();

  const isLoading = loadingBookings || loadingPending || loadingCapacityWarnings;

  return (
    <div className="admin-room-booking-management">
      {/* Header */}
      <div className="admin-booking-header">
       <div className="header-content">
          <div>
            <h1>Room Booking Management</h1>
            <p className="admin-subtitle">
              Manage room bookings, approvals, and capacity utilization
            </p>
          </div>
          </div>
        
        <div className="admin-booking-actions">
          <button 
            className="btn btn-outline refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <i className={`fas fa-sync-alt ${refreshing ? 'spinning' : ''}`}></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {/* <div className="admin-booking-stats">
        <div className="stat-card">
          <div className="stat-card-icon pending">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{quickStats.pendingApprovals}</div>
            <div className="stat-card-label">Pending Approvals</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon today">
            <i className="fas fa-calendar-day"></i>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{quickStats.todayBookings}</div>
            <div className="stat-card-label">Today's Bookings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon warning">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{quickStats.capacityWarnings}</div>
            <div className="stat-card-label">Capacity Warnings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon equipment">
            <i className="fas fa-tools"></i>
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{quickStats.equipmentRequests}</div>
            <div className="stat-card-label">Equipment Requests</div>
          </div>
        </div>
      </div> */}

      {/* Alerts */}
      {error && (
        <Alert
          type="danger"
          message={error}
          onClose={clearMessages}
        />
      )}

      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={clearMessages}
        />
      )}

      {/* Navigation Tabs */}
      <div className="room-controls">
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          All Bookings ({allBookings.length})
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => handleTabChange('pending')}
        >
          Pending Approval ({pendingBookings.length})
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'warnings' ? 'active' : ''}`}
          onClick={() => handleTabChange('warnings')}
        >
          Capacity Warnings ({capacityWarningBookings.length})
        </button>
      </div>

      {/* Filters */}
      <BookingFilters />

      {/* Bulk Actions */}
      {selectedBookings.length > 0 && (
        <BookingActions 
          selectedBookings={selectedBookings}
          onEquipmentManage={() => setShowEquipmentModal(true)}
          onCancelBookings={() => setShowCancellationModal(true)}
        />
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner />
          <p>Loading bookings...</p>
        </div>
      ) : (
        /* Booking List */
        <BookingListTable 
          bookings={filteredBookings}
          onViewDetails={handleViewBookingDetails}
          onManageEquipment={handleManageEquipment}
          onCancelBooking={handleCancelBooking}
        />
      )}

      {/* Modals */}
      {showDetailsModal && selectedBooking && (
        <BookingDetailsModal 
          booking={selectedBooking}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {showEquipmentModal && (
        <EquipmentApprovalModal 
          booking={selectedBooking}
          selectedBookings={selectedBookings}
          onClose={() => {
            setShowEquipmentModal(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {showCancellationModal && (
        <CancellationModal 
          booking={selectedBooking}
          selectedBookings={selectedBookings}
          onClose={() => {
            setShowCancellationModal(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminRoomBookingManagement;
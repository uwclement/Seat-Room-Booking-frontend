import React, { useContext, useState } from 'react';
import { RoomContext } from '../../../context/RoomContext';
import { 
  RoomCard, 
  RoomList, 
  RoomFilters, 
  BulkActionToolbar, 
  RoomFormModal 
} from './RoomComponents';
import { 
  MaintenanceModal, 
  BulkOperationModal, 
  TemplateModal, 
} from './RoomModals';
import Alert from '../../common/Alert';
import LoadingSpinner from '../../common/LoadingSpinner';
import ToastNotification from '../../common/ToastNotification';
import MaintenanceCalendar  from './MaintenanceCalendar'

const RoomDashboard = () => {
  const {
    rooms,
    equipment,
    templates,
    selectedRooms,
    loading,
    error,
    success,
    filters,
    searchKeyword,
    showCreateModal,
    showEditModal,
    showTemplateModal,
    showMaintenanceModal,
    showBulkModal,
    selectedRoom,
    viewMode,
    roomDraft,
    isDraftSaved,
    
    // QR Code state
    qrProcessing,
    qrError,
    qrSuccess,
    
    // Functions
    handleCreateRoom,
    handleUpdateRoom,
    handleDeleteRoom,
    handleDuplicateRoom,
    handleToggleAvailability,
    handleSetMaintenance,
    handleClearMaintenance,
    handleCreateTemplate,
    handleBulkOperation,
    
    toggleRoomSelection,
    selectAllRooms,
    clearSelection,
    
    setShowCreateModal,
    setShowEditModal,
    setShowTemplateModal,
    setShowMaintenanceModal,
    setShowBulkModal,
    setSelectedRoom,
    setViewMode,
    setFilters,
    setSearchKeyword,
    setError,
    setSuccess,
    
    saveDraft,
    clearDraft,
    
    // QR Code functions
    handleQRUpdate,
    handleBulkQRUpdate,
    setQRError,
    setQRSuccess,
    clearQRMessages
  } = useContext(RoomContext);

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarRoom, setCalendarRoom] = useState(null);

  // Room statistics
  const roomStats = {
    total: rooms.length,
    available: rooms.filter(room => room.available && !room.underMaintenance).length,
    disabled: rooms.filter(room => !room.available).length,
    maintenance: rooms.filter(room => room.underMaintenance).length,
    libraryRooms: rooms.filter(room => room.category === 'LIBRARY_ROOM').length,
    studyRooms: rooms.filter(room => room.category === 'STUDY_ROOM').length,
    classRooms: rooms.filter(room => room.category === 'CLASS_ROOM').length,
    withQR: rooms.filter(room => room.qrCodeToken).length,
    withoutQR: rooms.filter(room => !room.qrCodeToken).length
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setShowEditModal(true);
  };

  const handleMaintenanceClick = (room) => {
    setSelectedRoom(room);
    setShowMaintenanceModal(true);
  };

  const handleCalendarClick = (room) => {
    setCalendarRoom(room);
    setShowCalendar(true);
  };

  const handleDeleteConfirm = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      handleDeleteRoom(roomId);
    }
  };

  const handleBulkOperationSubmit = (operation, additionalData) => {
    handleBulkOperation(operation, additionalData);
  };

  const handleDraftRestore = () => {
    if (roomDraft) {
      setShowCreateModal(true);
    }
  };

  // QR Code event handlers
  const handleQRUpdated = (roomId, qrData) => {
    handleQRUpdate(roomId, qrData);
    setQRSuccess('QR code updated successfully');
  };

  const handleQRGenerated = (roomId, qrData) => {
    handleQRUpdate(roomId, qrData);
    setQRSuccess('QR code generated successfully');
  };

  const handleQRError = (error) => {
    setQRError(error);
  };

  const handleBulkQRGeneration = (results) => {
    if (results && results.length > 0) {
      handleBulkQRUpdate(results);
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        setQRSuccess(`${successCount} QR codes generated successfully`);
      }
      if (failureCount > 0) {
        setQRError(`${failureCount} QR codes failed to generate`);
      }
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>Room Management</h1>
            <p className="admin-subtitle">
              Manage library rooms, study spaces, and equipment assignments
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={() => setShowTemplateModal(true)}
            >
              <i className="fas fa-layer-group"></i>
              Templates
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <i className="fas fa-plus"></i>
              Add Room
            </button>
          </div>
        </div>

        {/* Draft restoration banner */}
        {roomDraft && !isDraftSaved && (
          <div className="draft-banner">
            <div className="draft-info">
              <i className="fas fa-save"></i>
              <span>You have an unsaved room draft</span>
            </div>
            <div className="draft-actions">
              <button className="btn btn-sm btn-primary" onClick={handleDraftRestore}>
                Restore Draft
              </button>
              <button className="btn btn-sm btn-outline" onClick={clearDraft}>
                Discard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <Alert
          type="danger"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* QR Error Alert */}
      {qrError && (
        <Alert
          type="danger"
          message={qrError}
          onClose={() => clearQRMessages()}
        />
      )}

      {/* Toast Notifications */}
      {success && (
        <ToastNotification
          type="success"
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      {/* QR Success Toast */}
      {qrSuccess && (
        <ToastNotification
          type="success"
          message={qrSuccess}
          onClose={() => clearQRMessages()}
        />
      )}

      {/* Room Statistics */}
      <div className="admin-card">
        <div className="card-header">
          <h2>Room Statistics</h2>
        </div>
        <div className="card-body">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{roomStats.total}</div>
              <div className="stat-label">Total Rooms</div>
            </div>
            <div className="stat-item available">
              <div className="stat-value">{roomStats.available}</div>
              <div className="stat-label">Available</div>
            </div>
            <div className="stat-item disabled">
              <div className="stat-value">{roomStats.disabled}</div>
              <div className="stat-label">Disabled</div>
            </div>
            <div className="stat-item maintenance">
              <div className="stat-value">{roomStats.maintenance}</div>
              <div className="stat-label">Under Maintenance</div>
            </div>
            <div className="stat-item library">
              <div className="stat-value">{roomStats.libraryRooms}</div>
              <div className="stat-label">Library Rooms</div>
            </div>
            <div className="stat-item study">
              <div className="stat-value">{roomStats.studyRooms}</div>
              <div className="stat-label">Study Rooms</div>
            </div>
            <div className="stat-item class">
              <div className="stat-value">{roomStats.classRooms}</div>
              <div className="stat-label">Class Rooms</div>
            </div>
            <div className="stat-item qr-enabled">
              <div className="stat-value">{roomStats.withQR}</div>
              <div className="stat-label">With QR Code</div>
            </div>
            <div className="stat-item qr-missing">
              <div className="stat-value">{roomStats.withoutQR}</div>
              <div className="stat-label">Missing QR Code</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="card-body">
          <RoomFilters
            filters={filters}
            setFilters={setFilters}
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
          />
        </div>
      </div>

      {/* View Toggle and Bulk Actions */}
      <div className="room-controls">
        <div className="view-controls">
          <div className="view-toggle">
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewMode('grid')}
            >
              <i className="fas fa-th-large"></i>
              Grid
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewMode('list')}
            >
              <i className="fas fa-list"></i>
              List
            </button>
          </div>
          
          <div className="results-info">
            Showing {rooms.length} room{rooms.length !== 1 ? 's' : ''}
            {qrProcessing && (
              <span className="qr-status">
                <i className="fas fa-qrcode fa-spin"></i>
                Processing QR codes...
              </span>
            )}
          </div>
        </div>

        <BulkActionToolbar
          selectedCount={selectedRooms.length}
          onBulkEnable={() => setShowBulkModal(true)}
          onBulkDisable={() => setShowBulkModal(true)}
          onBulkMaintenance={() => setShowBulkModal(true)}
          onBulkQRGeneration={handleBulkQRGeneration}
          onBulkDelete={() => {
            if (window.confirm(`Are you sure you want to delete ${selectedRooms.length} rooms? This action cannot be undone.`)) {
              handleBulkOperation('delete');
            }
          }}
          onClearSelection={clearSelection}
        />
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Room Display */}
      {!loading && (
        <div className="admin-card">
          <div className="card-body">
            {rooms.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-door-open"></i>
                <h3>No Rooms Found</h3>
                <p>No rooms match your current filters. Try adjusting your search criteria or create a new room.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <i className="fas fa-plus"></i>
                  Create First Room
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="room-grid">
                {rooms.map(room => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    isSelected={selectedRooms.includes(room.id)}
                    onSelect={toggleRoomSelection}
                    onEdit={handleEditRoom}
                    onToggleStatus={handleToggleAvailability}
                    onSetMaintenance={handleMaintenanceClick}
                    onDuplicate={handleDuplicateRoom}
                    onCalendar={handleCalendarClick}
                    onDelete={handleDeleteConfirm}
                    onQRUpdated={handleQRUpdated}
                    onQRGenerated={handleQRGenerated}
                    onQRError={handleQRError}
                    qrProcessing={qrProcessing}
                  />
                ))}
              </div>
            ) : (
              <RoomList
                rooms={rooms}
                selectedRooms={selectedRooms}
                onSelect={toggleRoomSelection}
                onSelectAll={selectAllRooms}
                onEdit={handleEditRoom}
                onToggleStatus={handleToggleAvailability}
                onSetMaintenance={handleMaintenanceClick}
                onDuplicate={handleDuplicateRoom}
                onCalendar={handleCalendarClick}
                onDelete={handleDeleteConfirm}
                onQRUpdated={handleQRUpdated}
                onQRGenerated={handleQRGenerated}
                onQRError={handleQRError}
                qrProcessing={qrProcessing}
              />
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <RoomFormModal
        show={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedRoom(null);
        }}
        onSubmit={handleCreateRoom}
        equipment={equipment}
        title="Create New Room"
        loading={loading}
        onSaveDraft={saveDraft}
        initialData={roomDraft}
      />

      <RoomFormModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRoom(null);
        }}
        onSubmit={(data) => handleUpdateRoom(selectedRoom.id, data)}
        room={selectedRoom}
        equipment={equipment}
        title="Edit Room"
        loading={loading}
      />

      <MaintenanceModal
        show={showMaintenanceModal}
        onClose={() => {
          setShowMaintenanceModal(false);
          setSelectedRoom(null);
        }}
        onSubmit={handleSetMaintenance}
        room={selectedRoom}
        loading={loading}
      />

      <BulkOperationModal
        show={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSubmit={handleBulkOperationSubmit}
        selectedCount={selectedRooms.length}
        loading={loading}
        onBulkQRGeneration={handleBulkQRGeneration}
      />

      <TemplateModal
        show={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSubmit={handleCreateTemplate}
        equipment={equipment}
        loading={loading}
      />

      {/* Maintenance Calendar Modal */}
      {showCalendar && calendarRoom && (
        <div className="modal-backdrop">
          <div className="modal-container large-modal">
            <div className="modal-header">
              <h3>Maintenance Calendar - {calendarRoom.name}</h3>
              <button 
                className="close-button" 
                onClick={() => {
                  setShowCalendar(false);
                  setCalendarRoom(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <MaintenanceCalendar
                room={calendarRoom}
                onSetMaintenance={handleSetMaintenance}
                onClearMaintenance={handleClearMaintenance}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDashboard;
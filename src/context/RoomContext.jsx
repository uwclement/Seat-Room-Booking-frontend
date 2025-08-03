import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getAllRooms,
  getAllEquipment,
  getAllTemplates,
  createRoom,
  updateRoom,
  deleteRoom,
  toggleRoomAvailability,
  setMaintenanceWindow,
  clearMaintenanceWindow,
  performBulkOperation,
  filterRooms,
  searchRooms,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  toggleEquipmentAvailability,
  createTemplate,
  createRoomFromTemplate,
  deleteTemplate,
  addEquipmentToRoom,
  removeEquipmentFromRoom
} from '../api/rooms';

export const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const { isAuthenticated, isAdmin, isLibrarian } = useAuth();
  
  // State for room management
  const [rooms, setRooms] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter and search state
  const [filters, setFilters] = useState({
    category: '',
    available: '',
    minCapacity: '',
    maxCapacity: '',
    building: '',
    floor: '',
    department: '',
    requiresApproval: ''
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Modal and UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Auto-save draft state
  const [roomDraft, setRoomDraft] = useState(null);
  const [isDraftSaved, setIsDraftSaved] = useState(true);

  // QR Code related state
  const [qrProcessing, setQrProcessing] = useState(false);
  const [qrError, setQrError] = useState('');
  const [qrSuccess, setQrSuccess] = useState('');

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin() && !isLibrarian ()) return;
    
    setLoading(true);
    setError('');
    try {
      const [roomsData, equipmentData, templatesData] = await Promise.all([
        getAllRooms(),
        getAllEquipment(),
        getAllTemplates()
      ]);
      setRooms(roomsData);
      setEquipment(equipmentData);
      setTemplates(templatesData);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch data. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch rooms with filters
  const fetchFilteredRooms = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin() && !isLibrarian ()) return;
    
    setLoading(true);
    try {
      let roomsData;
      if (searchKeyword) {
        roomsData = await searchRooms(searchKeyword);
      } else {
        const activeFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        );
        if (Object.keys(activeFilters).length > 0) {
          roomsData = await filterRooms(activeFilters);
        } else {
          roomsData = await getAllRooms();
        }
      }
      setRooms(roomsData);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Failed to fetch rooms. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, filters, searchKeyword]);

  // Room selection handlers
  const toggleRoomSelection = (roomId) => {
    setSelectedRooms(prevSelected => {
      if (prevSelected.includes(roomId)) {
        return prevSelected.filter(id => id !== roomId);
      } else {
        return [...prevSelected, roomId];
      }
    });
  };

  const selectAllRooms = () => {
    setSelectedRooms(rooms.map(room => room.id));
  };

  const clearSelection = () => {
    setSelectedRooms([]);
  };

  // Room CRUD operations
  const handleCreateRoom = async (roomData) => {
    setLoading(true);
    setError('');
    try {
      const newRoom = await createRoom(roomData);
      setRooms(prevRooms => [newRoom, ...prevRooms]);
      setSuccess('Room created successfully');
      setShowCreateModal(false);
      setRoomDraft(null);
      setIsDraftSaved(true);
      return newRoom;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
      throw err;
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleUpdateRoom = async (id, roomData) => {
    setLoading(true);
    setError('');
    try {
      const updatedRoom = await updateRoom(id, roomData);
      setRooms(prevRooms => 
        prevRooms.map(room => room.id === id ? updatedRoom : room)
      );
      setSuccess('Room updated successfully');
      setShowEditModal(false);
      setSelectedRoom(null);
      return updatedRoom;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update room');
      throw err;
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDeleteRoom = async (id) => {
    setLoading(true);
    setError('');
    try {
      await deleteRoom(id);
      setRooms(prevRooms => prevRooms.filter(room => room.id !== id));
      setSuccess('Room deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete room');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDuplicateRoom = async (room) => {
    const duplicateData = {
      ...room,
      roomNumber: `${room.roomNumber}-COPY`,
      name: `${room.name} (Copy)`,
      equipmentIds: room.equipment?.map(eq => eq.id) || []
    };
    delete duplicateData.id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    delete duplicateData.equipment;
    
    return handleCreateRoom(duplicateData);
  };

  // Room status operations
  const handleToggleAvailability = async (id) => {
    setLoading(true);
    try {
      const updatedRoom = await toggleRoomAvailability(id);
      setRooms(prevRooms => 
        prevRooms.map(room => room.id === id ? updatedRoom : room)
      );
      setSuccess('Room status updated successfully');
    } catch (err) {
      setError('Failed to update room status');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleSetMaintenance = async (id, startTime, endTime, notes) => {
    setLoading(true);
    try {
      const updatedRoom = await setMaintenanceWindow(id, startTime, endTime, notes);
      setRooms(prevRooms => 
        prevRooms.map(room => room.id === id ? updatedRoom : room)
      );
      setSuccess('Maintenance window set successfully');
      setShowMaintenanceModal(false);
    } catch (err) {
      setError('Failed to set maintenance window');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleClearMaintenance = async (id) => {
    setLoading(true);
    try {
      const updatedRoom = await clearMaintenanceWindow(id);
      setRooms(prevRooms => 
        prevRooms.map(room => room.id === id ? updatedRoom : room)
      );
      setSuccess('Maintenance window cleared successfully');
    } catch (err) {
      setError('Failed to clear maintenance window');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Equipment operations
  const handleAddEquipment = async (roomId, equipmentIds) => {
    setLoading(true);
    try {
      const updatedRoom = await addEquipmentToRoom(roomId, equipmentIds);
      setRooms(prevRooms => 
        prevRooms.map(room => room.id === roomId ? updatedRoom : room)
      );
      setSuccess('Equipment added successfully');
    } catch (err) {
      setError('Failed to add equipment');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleRemoveEquipment = async (roomId, equipmentIds) => {
    setLoading(true);
    try {
      const updatedRoom = await removeEquipmentFromRoom(roomId, equipmentIds);
      setRooms(prevRooms => 
        prevRooms.map(room => room.id === roomId ? updatedRoom : room)
      );
      setSuccess('Equipment removed successfully');
    } catch (err) {
      setError('Failed to remove equipment');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Bulk operations
  const handleBulkOperation = async (operation, additionalData = {}) => {
    setLoading(true);
    setError('');
    try {
      await performBulkOperation({
        roomIds: selectedRooms,
        operation,
        ...additionalData
      });
      await fetchFilteredRooms();
      setSuccess(`Bulk ${operation} completed successfully`);
      setShowBulkModal(false);
      clearSelection();
    } catch (err) {
      setError(`Failed to perform bulk ${operation}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Template operations
  const handleCreateTemplate = async (templateData) => {
    setLoading(true);
    try {
      const newTemplate = await createTemplate(templateData);
      setTemplates(prevTemplates => [newTemplate, ...prevTemplates]);
      setSuccess('Template created successfully');
      setShowTemplateModal(false);
    } catch (err) {
      setError('Failed to create template');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleCreateRoomFromTemplate = async (templateId, roomNumber, name) => {
    setLoading(true);
    try {
      const newRoom = await createRoomFromTemplate(templateId, roomNumber, name);
      setRooms(prevRooms => [newRoom, ...prevRooms]);
      setSuccess('Room created from template successfully');
    } catch (err) {
      setError('Failed to create room from template');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Equipment CRUD operations
  const handleCreateEquipment = async (equipmentData) => {
    setLoading(true);
    try {
      const newEquipment = await createEquipment(equipmentData);
      setEquipment(prevEquipment => [newEquipment, ...prevEquipment]);
      setSuccess('Equipment created successfully');
    } catch (err) {
      setError('Failed to create equipment');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleUpdateEquipment = async (id, equipmentData) => {
    setLoading(true);
    try {
      const updatedEquipment = await updateEquipment(id, equipmentData);
      setEquipment(prevEquipment => 
        prevEquipment.map(eq => eq.id === id ? updatedEquipment : eq)
      );
      setSuccess('Equipment updated successfully');
    } catch (err) {
      setError('Failed to update equipment');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDeleteEquipment = async (id) => {
    setLoading(true);
    try {
      await deleteEquipment(id);
      setEquipment(prevEquipment => prevEquipment.filter(eq => eq.id !== id));
      setSuccess('Equipment deleted successfully');
    } catch (err) {
      setError('Failed to delete equipment');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Auto-save draft functionality
  const saveDraft = (draftData) => {
    setRoomDraft(draftData);
    setIsDraftSaved(false);
    localStorage.setItem('roomDraft', JSON.stringify(draftData));
  };

  const loadDraft = () => {
    const saved = localStorage.getItem('roomDraft');
    if (saved) {
      setRoomDraft(JSON.parse(saved));
      setIsDraftSaved(false);
    }
  };

  const clearDraft = () => {
    setRoomDraft(null);
    setIsDraftSaved(true);
    localStorage.removeItem('roomDraft');
  };

  // QR Code Update handler - Enhanced version
  const handleQRUpdate = (roomId, qrData) => {
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === roomId 
          ? { ...room, ...qrData }
          : room
      )
    );
  };

  // QR Code batch update handler
  const handleBulkQRUpdate = (qrUpdates) => {
    setRooms(prevRooms => 
      prevRooms.map(room => {
        const update = qrUpdates.find(update => update.roomId === room.id);
        return update ? { ...room, ...update.qrData } : room;
      })
    );
  };

  // QR Code processing state handlers
  const setQRProcessing = (processing) => {
    setQrProcessing(processing);
  };

  const setQRError = (error) => {
    setQrError(error);
    setTimeout(() => setQrError(''), 5000);
  };

  const setQRSuccess = (message) => {
    setQrSuccess(message);
    setTimeout(() => setQrSuccess(''), 3000);
  };

  // Clear QR messages
  const clearQRMessages = () => {
    setQrError('');
    setQrSuccess('');
  };

  // Load data when authentication status changes
  useEffect(() => {
    if (isAuthenticated() && isAdmin() || isLibrarian()) {
      fetchAllData();
      loadDraft();
    }
  }, [isAuthenticated, isAdmin, fetchAllData]);

  // Refetch rooms when filters change
  useEffect(() => {
    fetchFilteredRooms();
  }, [fetchFilteredRooms]);

  const contextValue = {
    // State
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
    
    // Room operations
    handleCreateRoom,
    handleUpdateRoom,
    handleDeleteRoom,
    handleDuplicateRoom,
    handleToggleAvailability,
    handleSetMaintenance,
    handleClearMaintenance,
    
    // Equipment operations
    handleAddEquipment,
    handleRemoveEquipment,
    handleCreateEquipment,
    handleUpdateEquipment,
    handleDeleteEquipment,
    
    // Template operations
    handleCreateTemplate,
    handleCreateRoomFromTemplate,
    
    // Bulk operations
    handleBulkOperation,
    
    // Selection operations
    toggleRoomSelection,
    selectAllRooms,
    clearSelection,
    
    // UI operations
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
    
    // Draft operations
    saveDraft,
    loadDraft,
    clearDraft,
    
    // Data refresh
    fetchAllData,
    fetchFilteredRooms,

    // QR code operations
    handleQRUpdate,
    handleBulkQRUpdate,
    setQRProcessing,
    setQRError,
    setQRSuccess,
    clearQRMessages
  };

  return (
    <RoomContext.Provider value={contextValue}>
      {children}
    </RoomContext.Provider>
  );
};
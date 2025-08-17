import api from './axiosConfig';

const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Equipment Unit Management
export const getAllEquipmentUnits = async () => {
  return safeApiCall(() => api.get('/equipment-admin/equipment-units'));
};

export const createEquipmentUnit = async (unitData) => {
  return safeApiCall(() => api.post('/equipment-admin/equipment-units', unitData));
};

export const getAvailableUnitsForEquipment = async (equipmentId) => {
  return safeApiCall(() => api.get(`/equipment-admin/equipment-units/available/${equipmentId}`));
};

// Assignment Management
export const assignEquipmentUnit = async (assignmentData) => {
  return safeApiCall(() => api.post('/equipment-admin/equipment-units/assign', assignmentData));
};

export const removeAssignment = async (assignmentId, returnReason) => {
  return safeApiCall(() => api.put(`/equipment-admin/equipment-units/assignments/${assignmentId}/remove?returnReason=${encodeURIComponent(returnReason)}`));
};

export const getActiveAssignments = async () => {
  return safeApiCall(() => api.get('/equipment-admin/equipment-units/assignments'));
};

export const getEquipmentSummary = async () => {
  return safeApiCall(() => api.get('/equipment-admin/equipment-units/summary'));
};

// Enhanced Equipment Request Flow
export const getAvailableUnitsForRequest = async (equipmentId) => {
  return safeApiCall(() => api.get(`/equipment-admin/equipment/${equipmentId}/available-units`));
};

export const approveRequestWithSerial = async (requestId, approvalData) => {
  return safeApiCall(() => api.post(`/equipment-admin/equipment/requests/${requestId}/approve-with-serial`, approvalData));
};

export const returnEquipmentWithSerial = async (requestId, returnCondition, returnNotes = '') => {
  const params = new URLSearchParams();
  params.append('returnCondition', returnCondition);
  if (returnNotes) {
    params.append('returnNotes', returnNotes);
  }
  
  return safeApiCall(() => api.post(`/equipment-admin/equipment/requests/${requestId}/return?${params.toString()}`));
};

export const bulkApproveRequests = async (requestData) => {
  return safeApiCall(() => api.post('/equipment-admin/equipment/requests/bulk-approve', requestData));
};

export const checkEquipmentAvailability = async (equipmentId, quantity, startTime, endTime) => {
  const params = new URLSearchParams({
    quantity: quantity.toString(),
    startTime: startTime,
    endTime: endTime
  });
  
  return safeApiCall(() => api.get(`/equipment-admin/equipment/${equipmentId}/availability?${params.toString()}`));
};

// Fixed PDF Report Generation with Authentication
export const downloadEquipmentReport = async (reportType = 'INVENTORY', detailed = false, location = null) => {
  try {
    // Build URL with parameters
    const params = new URLSearchParams({
      reportType,
      detailed: detailed.toString()
    });
    
    if (location) {
      params.append('location', location);
    }
    
    // Use axios to make authenticated request
    const response = await api.get(`/equipment-admin/equipment-units/reports/pdf?${params}`, {
      responseType: 'blob' // Important for PDF download
    });
    
    // Create download link
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename
    const filename = `equipment_${reportType.toLowerCase()}_report_${detailed ? 'detailed' : 'summary'}.pdf`;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Report downloaded successfully' };
  } catch (error) {
    console.error('Error downloading report:', error);
    throw new Error('Failed to download report: ' + (error.response?.data?.message || error.message));
  }
};

// Preview equipment report in new tab with authentication
export const previewEquipmentReport = async (reportType = 'INVENTORY', detailed = false, location = null) => {
  try {
    // Build URL with parameters
    const params = new URLSearchParams({
      reportType,
      detailed: detailed.toString()
    });
    
    if (location) {
      params.append('location', location);
    }
    
    // Use axios to make authenticated request
    const response = await api.get(`/equipment-admin/equipment-units/reports/pdf?${params}`, {
      responseType: 'blob' // Important for PDF preview
    });
    
    // Create blob URL and open in new tab
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const newTab = window.open(url, '_blank');
    
    // Clean up URL after a delay
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
    
    return { success: true, message: 'Report opened in new tab' };
  } catch (error) {
    console.error('Error previewing report:', error);
    throw new Error('Failed to preview report: ' + (error.response?.data?.message || error.message));
  }
};

// Admin report download (for admins accessing other locations)
export const downloadAdminEquipmentReport = async (location, reportType = 'INVENTORY', detailed = false) => {
  try {
    // Build URL with parameters
    const params = new URLSearchParams({
      location,
      reportType,
      detailed: detailed.toString()
    });
    
    // Use axios to make authenticated request to admin endpoint
    const response = await api.get(`/equipment-admin/equipment-units/reports/pdf/admin?${params}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename
    const filename = `equipment_${reportType.toLowerCase()}_report_${location.toLowerCase()}_${detailed ? 'detailed' : 'summary'}.pdf`;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Admin report downloaded successfully' };
  } catch (error) {
    console.error('Error downloading admin report:', error);
    throw new Error('Failed to download admin report: ' + (error.response?.data?.message || error.message));
  }
};

// Legacy function for backward compatibility (now redirects to new function)
export const generateEquipmentReport = async (reportType = 'INVENTORY', detailed = false, location = null) => {
  console.warn('generateEquipmentReport is deprecated. Use downloadEquipmentReport or previewEquipmentReport instead.');
  return downloadEquipmentReport(reportType, detailed, location);
};

// Equipment Unit Status Updates
export const updateEquipmentUnitStatus = async (unitId, statusData) => {
  return safeApiCall(() => api.put(`/equipment-admin/equipment-units/${unitId}/status`, statusData));
};

// Search and Filter
export const searchEquipmentUnits = async (keyword) => {
  return safeApiCall(() => api.get(`/equipment-admin/equipment-units/search?keyword=${encodeURIComponent(keyword)}`));
};

// Utility functions for frontend
export const formatAssignmentType = (type) => {
  const typeMap = {
    'STAFF_ASSIGNMENT': 'Staff Assignment',
    'ROOM_ASSIGNMENT': 'Room Assignment', 
    'LOCATION_ASSIGNMENT': 'Location Assignment',
    'REQUEST_ASSIGNMENT': 'Request Assignment'
  };
  return typeMap[type] || type;
};

export const formatUnitStatus = (status) => {
  const statusMap = {
    'AVAILABLE': 'Available',
    'ASSIGNED': 'Assigned',
    'IN_REQUEST': 'In Use',
    'MAINTENANCE': 'Maintenance',
    'DAMAGED': 'Damaged',
    'LOST': 'Lost'
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status) => {
  const colorMap = {
    'AVAILABLE': 'green',
    'ASSIGNED': 'blue', 
    'IN_REQUEST': 'orange',
    'MAINTENANCE': 'yellow',
    'DAMAGED': 'red',
    'LOST': 'gray'
  };
  return colorMap[status] || 'gray';
};
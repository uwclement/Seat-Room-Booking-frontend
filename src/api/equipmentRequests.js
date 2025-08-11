import api from './axiosConfig';

const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Equipment Request Management
export const createEquipmentRequest = async (requestData) => {
  return safeApiCall(() => api.post('/equipment-requests', requestData));
};

export const getMyEquipmentRequests = async () => {
  return safeApiCall(() => api.get('/equipment-requests/my-requests'));
};

export const escalateRequest = async (requestId) => {
  return safeApiCall(() => api.post(`/equipment-requests/${requestId}/escalate`));
};

// Equipment Admin functions
export const getPendingEquipmentRequests = async () => {
  return safeApiCall(() => api.get('/equipment-requests/pending'));
};

export const approveEquipmentRequest = async (requestId, approvalData) => {
  return safeApiCall(() => api.post(`/equipment-requests/${requestId}/approve`, approvalData));
};

// HOD functions
export const getEscalatedRequests = async () => {
  return safeApiCall(() => api.get('/equipment-requests/escalated'));
};

export const hodReviewRequest = async (requestId, reviewData) => {
  return safeApiCall(() => api.post(`/equipment-requests/${requestId}/hod-review`, reviewData));
};

// Public endpoints
export const getPublicAvailableEquipment = async () => {
  return safeApiCall(() => api.get('/public/equipment/available'));
};

export const getPublicStudentEquipment = async () => {
  return safeApiCall(() => api.get('/public/equipment/student-allowed'));
};

export const getPublicLabClasses = async () => {
  return safeApiCall(() => api.get('/public/lab-classes/available'));
};

export const getPublicActiveCourses = async () => {
  return safeApiCall(() => api.get('/public/courses/active'));
};


// Suggestion Response (Professor)
export const respondToSuggestion = async (requestId, responseData) => {
  console.log('Sending suggestion response:', responseData); // Debug log
  return safeApiCall(() => api.post(`/equipment-requests/${requestId}/respond-suggestion`, {
    suggestionAcknowledged: responseData.suggestionAcknowledged,
    suggestionResponseReason: responseData.suggestionResponseReason || null
  }));
};

// Extension Request (Professor)
export const requestExtension = async (requestId, extensionData) => {
  console.log('Sending extension request:', extensionData); // Debug log
  return safeApiCall(() => api.post(`/equipment-requests/${requestId}/request-extension`, {
    extensionHoursRequested: extensionData.extensionHoursRequested,
    extensionReason: extensionData.extensionReason
  }));
};

// Equipment Return (Equipment Admin)
export const markEquipmentReturned = async (requestId, returnData) => {
  console.log('Marking equipment returned:', returnData); // Debug log
  return safeApiCall(() => api.post(`/equipment-requests/${requestId}/mark-returned`, {
    returnCondition: returnData.returnCondition,
    returnNotes: returnData.returnNotes || null
  }));
};

// Handle Extension (Equipment Admin)
export const handleExtensionRequest = async (requestId, approvalData) => {
  console.log('Handling extension request:', approvalData); // Debug log
  return safeApiCall(() => api.post(`/equipment-requests/${requestId}/handle-extension`, {
    approved: approvalData.approved,
    rejectionReason: approvalData.rejectionReason || null
  }));
}

// Get Active Requests (Equipment Admin)
export const getActiveRequests = async () => {
  return safeApiCall(() => api.get('/equipment-requests/active'));
};

// Get Extension Requests (Equipment Admin)
export const getExtensionRequests = async () => {
  return safeApiCall(() => api.get('/equipment-requests/extension-requests'));
};

// Cancel Request (Professor)
export const cancelRequest = async (requestId) => {
  return safeApiCall(() => api.post(`/equipment-requests/${requestId}/cancel`));
};

// Complete Request (Equipment Admin)
export const completeRequest = async (requestId) => {
  return safeApiCall(() => api.post(`/equipment-requests/${requestId}/complete`));
};
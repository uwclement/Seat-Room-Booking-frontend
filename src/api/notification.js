import api from './axiosConfig';

// Get all notifications
export const fetchNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

// Mark a specific notification as read
export const markNotificationAsRead = async (id) => {
  const response = await api.post(`/notifications/${id}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await api.post('/notifications/mark-all-read');
  return response.data;
};

// Create authenticated SSE connection for JWT
export const createAuthenticatedSSEConnection = (onMessage, onError, onOpen) => {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('token');
    if (!token) {
      reject(new Error('No authentication token found'));
      return;
    }

    // Pass JWT token as query parameter since SSE doesn't support headers
    const baseUrl = process.env.REACT_APP_API_URL || 'http://librarybackend.up.railway.app';
    const sseUrl = `${baseUrl}/api/notifications/stream?token=${encodeURIComponent(token)}`;
    
    try {
      const eventSource = new EventSource(sseUrl);
      
      eventSource.onopen = (event) => {
        console.log('SSE connection opened');
        if (onOpen) onOpen(event);
        resolve(eventSource);
      };
      
      eventSource.onmessage = (event) => {
        if (onMessage) onMessage(event);
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        
        // Check if error might be due to authentication
        if (error.target.readyState === EventSource.CLOSED) {
          // Connection closed, possibly due to authentication failure
          if (onError) onError(error);
        }
      };
      
    } catch (error) {
      reject(error);
    }
  });
};
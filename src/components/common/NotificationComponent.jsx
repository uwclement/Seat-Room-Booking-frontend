import React, { useState, useEffect, useRef } from 'react';
import { Badge, Button, List, Tabs, Modal, message, Spin, Typography, Empty } from 'antd';
import { BellOutlined, CheckOutlined, DotChartOutlined } from '@ant-design/icons';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createAuthenticatedSSEConnection,
} from '../../api/notification';
import './../../assets/css/NotificationComponent.css';

const { TabPane } = Tabs;
const { Text } = Typography;

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [eventSource, setEventSource] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    loadNotifications();
    connectToSSE();
    
    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const loadNotifications = async () => {
  setLoading(true);
  try {
    const data = await fetchNotifications();

    // Deduplicate notifications based on `id`
    const unique = Array.from(new Map(data.map(n => [n.id, n])).values());

    setNotifications(unique);

    const unread = unique.filter((n) => !n.read).length;
    setUnreadCount(unread);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else {
      message.error('Failed to load notifications');
    }
  } finally {
    setLoading(false);
  }
};


  const connectToSSE = async () => {
    try {
      setConnectionStatus('connecting');
      
      const newEventSource = await createAuthenticatedSSEConnection(
        // onMessage
        (event) => {
          console.log('🔥 Received new notification:', event);
          try {
            const newNotification = JSON.parse(event.data);
            
            // Add notification to state
            setNotifications((prev) => {
            const exists = prev.some((n) => n.id === newNotification.id);
            if (exists) return prev;
            return [newNotification, ...prev];
            });

            setUnreadCount((prev) => prev + 1);
            
            // Show notification popup
            showNotificationPopup(newNotification);
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        },
        // onError
        (error) => {
          console.error('SSE error:', error);
          setConnectionStatus('error');
          
          // Check if error might be authentication related
          if (error.target && error.target.readyState === EventSource.CLOSED) {
            // Connection was closed, might be due to auth failure
            // Check if token still exists
            const token = localStorage.getItem('token');
            if (!token) {
              window.location.href = '/login';
            } else {
              handleConnectionError();
            }
          }
        },
        // onOpen
        () => {
          console.log('SSE connection opened');
          setConnectionStatus('connected');
          reconnectAttempts.current = 0;
        }
      );

      setEventSource(newEventSource);
    } catch (error) {
      console.error('Failed to connect to SSE:', error);
      setConnectionStatus('error');
      
      // Check if error is due to authentication
      if (error.message === 'No authentication token found') {
        message.error('Authentication required. Please log in again.');
        window.location.href = '/login';
      } else {
        handleConnectionError();
      }
    }
  };

  const handleConnectionError = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }

    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current++;
      const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
      
      setConnectionStatus('reconnecting');
      setTimeout(() => {
        connectToSSE();
      }, delay);
    } else {
      message.error('Failed to connect to notification service');
      setConnectionStatus('failed');
    }
  };

  const showNotificationPopup = (notification) => {
    // Show a more prominent notification
    const notificationComponent = (
      <div>
        <strong>{notification.title}</strong>
        <p>{notification.message}</p>
      </div>
    );

    message.open({
      content: notificationComponent,
      duration: 5,
      type: 'info',
      onClick: () => {
        if (!notification.read) {
          handleMarkAsRead(notification.id);
        }
      }
    });
  };

  const handleMarkAsRead = async (id) => {
    try {
      // Convert string ID to number for backend
      const notificationId = parseInt(id);
      await markNotificationAsRead(notificationId);
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        message.error('Failed to mark notification as read');
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      message.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        message.error('Failed to mark all as read');
      }
    }
  };

  const handleModalOpen = () => {
    setVisible(true);
    loadNotifications(); // Refresh each time modal opens
  };

  const handleModalClose = () => {
    setVisible(false);
  };

  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case 'WAITLIST':
        return '🪑';
      case 'NO_SHOW':
        return '❌';
      case 'LIBRARY_INFO':
        return '📚';
      case 'SYSTEM':
        return '⚙️';
      case 'CHECK_IN_WARNING':
        return '⚠️';
      default:
        return '📢';
    }
  };

  const getNotificationPriority = (type) => {
    const priorities = {
      'CHECK_IN_WARNING': 'high',
      'NO_SHOW': 'high',
      'WAITLIST': 'medium',
      'LIBRARY_INFO': 'low',
      'SYSTEM': 'low'
    };
    return priorities[type] || 'low';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotificationItem = (notification) => {
    const priority = getNotificationPriority(notification.type);
    const isExpired = notification.expirationTime && new Date(notification.expirationTime) < new Date();
    
    const handleClick = () => {
      if (!notification.read) {
        handleMarkAsRead(notification.id);
      }

      // Handle navigation based on metadata
      switch (notification.type) {
        case 'WAITLIST':
          // Extract seat info from message if available
          const seatMatch = notification.message.match(/Seat (\w+)/);
          if (seatMatch) {
            window.location.href = `/seats?seatNumber=${seatMatch[1]}`;
          }
          break;
        case 'CHECK_IN_WARNING':
          window.location.href = '/my-bookings';
          break;
        default:
          break;
      }
    };

    return (
      <List.Item
        onClick={handleClick}
        className={`notification-item ${
          notification.read ? 'notification-read' : 'notification-unread'
        } ${priority}-priority ${isExpired ? 'expired' : ''}`}
        actions={
          !notification.read
            ? [
                <Button
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notification.id);
                  }}
                >
                  Mark Read
                </Button>,
              ]
            : []
        }
      >
        <List.Item.Meta
          avatar={
            <div className={`notification-icon ${priority}-priority`}>
              {getNotificationTypeIcon(notification.type)}
            </div>
          }
          title={
            <div className="notification-title">
              {notification.title}
              {!notification.read && <Badge status="processing" />}
            </div>
          }
          description={
            <div>
              <p className="notification-message">{notification.message}</p>
              <div className="notification-meta">
                <Text type="secondary" className="notification-time">
                  {formatTimestamp(notification.timestamp)}
                </Text>
                <Text type="secondary" className="notification-type">
                  {notification.type.replace('_', ' ').toLowerCase()}
                </Text>
                {isExpired && (
                  <Text type="danger" className="notification-expired">
                    Expired
                  </Text>
                )}
              </div>
            </div>
          }
        />
      </List.Item>
    );
  };

  return (
    <>
      <Badge count={unreadCount} overflowCount={99}>
        <Button
          icon={<BellOutlined />}
          onClick={handleModalOpen}
          className={`notification-button ${connectionStatus}`}
        />
      </Badge>

      <Modal
        title={
          <div className="notification-modal-title">
            <span>Notifications</span>
            <div className="connection-status">
              <DotChartOutlined 
                style={{ 
                  color: connectionStatus === 'connected' ? '#52c41a' : '#ff4d4f' 
                }} 
              />
              <Text type="secondary" style={{ fontSize: '12px', marginLeft: '4px' }}>
                {connectionStatus === 'connected' ? 'Live' : 'Offline'}
              </Text>
            </div>
          </div>
        }
        visible={visible}
        onCancel={handleModalClose}
        footer={[
          <Button 
            key="markAll" 
            onClick={handleMarkAllAsRead} 
            disabled={unreadCount === 0}
            icon={<CheckOutlined />}
          >
            Mark All as Read ({unreadCount})
          </Button>,
          <Button key="close" type="primary" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
        width={700}
        className="notification-modal"
      >
        <Tabs defaultActiveKey="all" onChange={loadNotifications}>
          <TabPane tab={`All (${notifications.length})`} key="all">
            <Spin spinning={loading}>
              <List
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={renderNotificationItem}
                locale={{ 
                  emptyText: (
                    <Empty 
                      description="No notifications yet" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )
                }}
                pagination={notifications.length > 10 ? { pageSize: 10 } : false}
              />
            </Spin>
          </TabPane>
          <TabPane 
            tab={`Library Info (${notifications.filter(n => n.type === 'LIBRARY_INFO').length})`} 
            key="library"
          >
            <Spin spinning={loading}>
              <List
                itemLayout="horizontal"
                dataSource={notifications.filter((n) => n.type === 'LIBRARY_INFO')}
                renderItem={renderNotificationItem}
                locale={{ 
                  emptyText: (
                    <Empty 
                      description="No library notifications" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )
                }}
              />
            </Spin>
          </TabPane>
          <TabPane 
            tab={`Bookings (${notifications.filter(n => ['NO_SHOW', 'WAITLIST', 'CHECK_IN_WARNING'].includes(n.type)).length})`}
            key="bookings"
          >
            <Spin spinning={loading}>
              <List
                itemLayout="horizontal"
                dataSource={notifications.filter(
                  (n) => ['NO_SHOW', 'WAITLIST', 'CHECK_IN_WARNING'].includes(n.type)
                )}
                renderItem={renderNotificationItem}
                locale={{ 
                  emptyText: (
                    <Empty 
                      description="No booking notifications" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )
                }}
              />
            </Spin>
          </TabPane>
        </Tabs>
      </Modal>
    </>
  );
};

export default NotificationComponent;
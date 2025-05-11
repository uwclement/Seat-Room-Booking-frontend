import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge, Button, List, Tabs, Modal, message } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import './../../assets/css/NotificationComponent.css';

const { TabPane } = Tabs;

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load notifications when the component mounts
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
      
      // Count unread notifications
      const unread = response.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      message.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.post(`/api/notifications/${id}/read`);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('/api/notifications/mark-all-read');
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({ ...n, read: true }))
      );
      
      // Update unread count
      setUnreadCount(0);
      
      message.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      message.error('Failed to mark all as read');
    }
  };

  const showModal = () => {
    setVisible(true);
    fetchNotifications(); // Refresh notifications when opening the modal
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const renderNotificationItem = (notification) => {
    const handleClick = () => {
      if (!notification.read) {
        markAsRead(notification.id);
      }
      
      // Handle action based on notification type
      switch (notification.type) {
        case 'WAITLIST':
          // Navigate to booking page with pre-filled data
          window.location.href = `/seats?seatId=${notification.metadata.seatId}`;
          break;
        case 'ROOM_SHARING':
          // Handle room sharing invitation
          break;
        default:
          // Just mark as read for other types
          break;
      }
    };
    
    return (
      <List.Item 
        onClick={handleClick}
        className={notification.read ? 'notification-read' : 'notification-unread'}
      >
        <List.Item.Meta
          title={notification.title}
          description={notification.message}
        />
        <div className="notification-time">
          {new Date(notification.timestamp).toLocaleString()}
        </div>
      </List.Item>
    );
  };

  return (
    <>
      <Badge count={unreadCount} overflowCount={99}>
        <Button 
          icon={<BellOutlined />} 
          onClick={showModal}
          className="notification-button"
        />
      </Badge>
      
      <Modal
        title="Notifications"
        visible={visible}
        onCancel={handleCancel}
        footer={[
          <Button key="markAll" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Mark All as Read
          </Button>,
          <Button key="close" type="primary" onClick={handleCancel}>
            Close
          </Button>
        ]}
        width={600}
      >
        <Tabs defaultActiveKey="all">
          <TabPane tab="All" key="all">
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={notifications}
              renderItem={renderNotificationItem}
              locale={{ emptyText: "No notifications" }}
            />
          </TabPane>
          <TabPane tab="Library Info" key="library">
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={notifications.filter(n => n.type === 'LIBRARY_INFO')}
              renderItem={renderNotificationItem}
              locale={{ emptyText: "No library notifications" }}
            />
          </TabPane>
          <TabPane tab="Bookings" key="bookings">
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={notifications.filter(n => 
                n.type === 'NO_SHOW' || n.type === 'WAITLIST'
              )}
              renderItem={renderNotificationItem}
              locale={{ emptyText: "No booking notifications" }}
            />
          </TabPane>
        </Tabs>
      </Modal>
    </>
  );
};

export default NotificationComponent;
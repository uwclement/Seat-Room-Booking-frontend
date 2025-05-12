// src/components/NotificationComponent.js
import React, { useState, useEffect } from 'react';
import { Badge, Button, List, Tabs, Modal, message } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../api/notification';
import './../../assets/css/NotificationComponent.css';

const { TabPane } = Tabs;

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      const unread = data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      message.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
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
      message.error('Failed to mark all as read');
    }
  };

  const handleModalOpen = () => {
    setVisible(true);
    loadNotifications(); // refresh each time modal opens
  };

  const handleModalClose = () => {
    setVisible(false);
  };

  const renderNotificationItem = (notification) => {
    const handleClick = () => {
      if (!notification.read) handleMarkAsRead(notification.id);

      switch (notification.type) {
        case 'WAITLIST':
          window.location.href = `/seats?seatId=${notification.metadata?.seatId}`;
          break;
        case 'ROOM_SHARING':
          // Custom logic
          break;
        default:
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
          onClick={handleModalOpen}
          className="notification-button"
        />
      </Badge>

      <Modal
        title="Notifications"
        visible={visible}
        onCancel={handleModalClose}
        footer={[
          <Button key="markAll" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            Mark All as Read
          </Button>,
          <Button key="close" type="primary" onClick={handleModalClose}>
            Close
          </Button>,
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
              locale={{ emptyText: 'No notifications' }}
            />
          </TabPane>
          <TabPane tab="Library Info" key="library">
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={notifications.filter((n) => n.type === 'LIBRARY_INFO')}
              renderItem={renderNotificationItem}
              locale={{ emptyText: 'No library notifications' }}
            />
          </TabPane>
          <TabPane tab="Bookings" key="bookings">
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={notifications.filter(
                (n) => n.type === 'NO_SHOW' || n.type === 'WAITLIST'
              )}
              renderItem={renderNotificationItem}
              locale={{ emptyText: 'No booking notifications' }}
            />
          </TabPane>
        </Tabs>
      </Modal>
    </>
  );
};

export default NotificationComponent;

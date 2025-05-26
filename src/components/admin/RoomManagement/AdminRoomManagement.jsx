import React from 'react';
import { RoomProvider } from '../../../context/RoomContext';
import RoomDashboard from '../../rooms/RoomDashboard';
import AdminSidebar from '../../common/AdminSidebar';

const AdminRoomManagement = () => {
  return (
    <RoomProvider>
      <div className="admin-page-container">
        <AdminSidebar activePage="rooms" />
        <RoomDashboard />
      </div>
    </RoomProvider>
  );
};

export default AdminRoomManagement;
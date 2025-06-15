import React from 'react';
import { QRCodeProvider } from '../../context/QRCodeContext';
import AdminSidebar from '../../components/common/AdminSidebar';
import SeatDashboard from '../../components/admin/SeatManagement/SeatDashboard';

const AdminSeatManagement = () => {
  return (
    <QRCodeProvider>
      <div className="admin-page-container">
        <AdminSidebar activePage="seats" />
        <SeatDashboard />
      </div>
    </QRCodeProvider>
  );
};

export default AdminSeatManagement;
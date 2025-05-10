import React from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import SeatFilters from '../../components/admin/SeatManagement/SeatFilters';
import SeatActions from '../../components/admin/SeatManagement/SeatActions';
import SeatList from '../../components/admin/SeatManagement/SeatList';
import Alert from '../../components/common/Alert';
import AdminSidebar from '../../components/common/AdminSidebar';
import ActionButton from '../../components/common/ActionButton';
import '../../assets/css/admin.css';

const SeatManagement = () => {
  const { error, success, setError } = useAdmin();

  return (
    <div className="admin-page-container">
      <AdminSidebar activePage="seats" />
      
      <div className="admin-content">
        <div className="admin-header">
          <h1>Seat Management</h1>
          <p className="admin-subtitle">
            Manage library seats, change properties, and set maintenance status
          </p>
        </div>

        {error && (
          <Alert
            type="danger"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => {}}
            autoClose={true}
          />
        )}

        <div className="admin-card">
          <div className="card-header">
            <h2>Seat Operations</h2>
          </div>
          <div className="card-body">
            <SeatFilters />
            <SeatActions />
            <SeatList />
          </div>
        </div>
        
        <ActionButton />
      </div>
    </div>
  );
};

export default SeatManagement;
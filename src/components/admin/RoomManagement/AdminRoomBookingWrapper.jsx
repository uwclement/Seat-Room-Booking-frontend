import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminRoomBooking } from '../../../context/AdminRoomBookingContext';
import AdminRoomBookingManagement from './AdminRoomBookingManagement';
import AdminSidebar from '../../common/AdminSidebar';
const AdminRoomBookingWrapper = ({ initialView }) => {
  const { setViewMode } = useAdminRoomBooking();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check URL parameters for view mode
    const viewParam = searchParams.get('view');
    const viewToSet = viewParam || initialView || 'all';
    
    // Set the view mode based on URL parameter or initial view prop
    if (['all', 'pending', 'warnings'].includes(viewToSet)) {
      setViewMode(viewToSet);
    }
  }, [searchParams, initialView, setViewMode]);

  return 
  <RoomProvider>
    <AdminRoomBookingManagement />   
 </RoomProvider>
  ;
};

export default AdminRoomBookingWrapper;
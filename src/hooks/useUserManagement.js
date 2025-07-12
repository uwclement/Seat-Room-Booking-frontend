import { useContext } from 'react';
import { UserManagementContext } from '../context/UserManagementContext';

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  
  if (!context) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  
  return context;
};
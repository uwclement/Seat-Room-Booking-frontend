import { useContext } from 'react';
import { RoomContext } from '../context/RoomContext';

export const useRoom = () => {
  const context = useContext(RoomContext);
  
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  
  return context;
};
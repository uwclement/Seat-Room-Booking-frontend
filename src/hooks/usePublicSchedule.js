import { useContext } from 'react';
import { PublicScheduleContext } from '../context/PublicScheduleContext';

export const usePublicSchedule = () => {
  return useContext(PublicScheduleContext);
};
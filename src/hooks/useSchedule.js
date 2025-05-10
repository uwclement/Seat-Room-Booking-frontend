import { useContext } from 'react';
import { ScheduleContext } from '../context/ScheduleContext';

export const useSchedule = () => {
  return useContext(ScheduleContext);
};
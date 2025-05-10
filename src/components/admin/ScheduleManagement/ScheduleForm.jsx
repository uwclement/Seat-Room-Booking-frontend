import React, { useState } from 'react';
import { useSchedule } from '../../../hooks/useSchedule';

const ScheduleForm = () => {
  const { regularSchedule, handleUpdateDaySchedule, loading } = useSchedule();
  
  const [editingDay, setEditingDay] = useState(null);
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  
  const daysOfWeek = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' }
  ];
  
  const handleEditClick = (day) => {
    const schedule = regularSchedule.find(s => s.dayOfWeek === day.id);
    setEditingDay(day.id);
    setOpenTime(schedule ? schedule.openTime : '09:00');
    setCloseTime(schedule ? schedule.closeTime : '17:00');
  };
  
  const handleCancelEdit = () => {
    setEditingDay(null);
    setOpenTime('');
    setCloseTime('');
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Find the schedule item if it exists
    const schedule = regularSchedule.find(s => s.dayOfWeek === editingDay);
    
    handleUpdateDaySchedule(schedule ? schedule.id : null, {
      dayOfWeek: editingDay,
      openTime,
      closeTime
    });
    
    // Reset form
    setEditingDay(null);
    setOpenTime('');
    setCloseTime('');
  };
  
  return (
    <div className="schedule-form">
      <h3>Regular Library Hours</h3>
      
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Opens</th>
              <th>Closes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {daysOfWeek.map(day => {
              const schedule = regularSchedule.find(s => s.dayOfWeek === day.id);
              const isEditing = editingDay === day.id;
              
              return (
                <tr key={day.id}>
                  <td>{day.name}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="time"
                        className="form-control"
                        value={openTime}
                        onChange={(e) => setOpenTime(e.target.value)}
                        required
                      />
                    ) : (
                      schedule ? schedule.openTime : 'Closed'
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="time"
                        className="form-control"
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                        required
                      />
                    ) : (
                      schedule ? schedule.closeTime : 'Closed'
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <div className="form-actions">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={handleSubmit}
                          disabled={loading}
                        >
                          Save
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={handleCancelEdit}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEditClick(day)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleForm;
import React from 'react';

const TimePicker = ({ value, onChange }) => {
  return (
    <input
      type="time"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
};

export default TimePicker;

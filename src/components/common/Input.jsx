import React from 'react';

const Input = ({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  className = '',
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`form-control ${error ? 'error' : ''}`}
      />
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default Input;
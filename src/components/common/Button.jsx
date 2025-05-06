import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  fullWidth = false,
  disabled = false,
  onClick
}) => {
  const baseClass = 'btn';
  const variantClass = variant ? `btn-${variant}` : '';
  const widthClass = fullWidth ? 'btn-block' : '';
  
  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${widthClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
import React from 'react';

const Button = ({ children, variant = 'primary', type = 'button', onClick, disabled = false, className = '' }) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-videobelajar-green text-white hover:bg-green-600 focus:ring-videobelajar-green',
    secondary: 'bg-videobelajar-light-green text-white hover:bg-green-500 focus:ring-videobelajar-light-green',
    outline: 'border-2 border-videobelajar-green text-videobelajar-green hover:bg-videobelajar-green hover:text-white focus:ring-videobelajar-green',
    google: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;

import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'upload';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  // Base classes for all buttons
  const baseClasses = "px-4 py-2 rounded transition-colors";
  
  // Variant-specific classes
  const variantClasses = {
    primary: "bg-green-500 w-1/4 hover:bg-green-600 text-white",
    secondary: "bg-blue-500 w-1/4 hover:bg-blue-600 text-white",
    danger: "bg-red-500 w-1/4 hover:bg-red-600 text-white",
    upload: "bg-blue-500 hover:bg-blue-600 text-white" // New variant for upload button
  };

  // Combine all classes
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button 
      className={buttonClasses} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;


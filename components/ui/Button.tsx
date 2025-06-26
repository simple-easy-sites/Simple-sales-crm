import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 flex items-center justify-center shadow-sm';
  
  // B&W Theme Adjustments
  const variantStyles = {
    primary: 'bg-primary-800 hover:bg-primary-900 text-white focus:ring-primary-700', // Dark bg, light text
    secondary: 'bg-background hover:bg-gray-100 text-gray-800 focus:ring-primary-700 border border-gray-300', // Light bg, dark text, dark border
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500', // Danger remains colored
    ghost: 'bg-transparent hover:bg-gray-100 text-primary-700 focus:ring-primary-700' // Minimal, dark text
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabledStyles = 'disabled:opacity-60 disabled:cursor-not-allowed';
  // Loading icon color should contrast with button background
  const loadingIconColor = (variant === 'primary' || variant === 'danger') ? 'text-white' : 'text-primary-700';


  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className || ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${loadingIconColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
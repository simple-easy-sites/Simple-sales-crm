
import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'danger';
}

const Badge: React.FC<BadgeProps> = ({ className, variant = 'info', ...props }) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';
  
  const variantClasses = {
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className ?? ''}`}
      {...props}
    />
  );
};

export { Badge };

import React from 'react';
import { Icons } from './Icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', isLoading = false, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 dark:focus:ring-offset-dark-bg disabled:opacity-50 disabled:pointer-events-none';
    
    const variantClasses = {
      primary: 'bg-brand-blue text-white hover:bg-brand-blue/90',
      secondary: 'bg-slate-200 dark:bg-slate-800 text-light-text dark:text-dark-text hover:bg-slate-300 dark:hover:bg-slate-700',
      ghost: 'hover:bg-slate-200 dark:hover:bg-slate-800',
    };
    
    const sizeClasses = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
    };

    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className ?? ''}`}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading && <Icons.Spinner className="animate-spin -ml-1 mr-3 h-5 w-5" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
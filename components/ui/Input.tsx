import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm 
                   focus:outline-none focus:ring-primary-700 focus:border-primary-700 sm:text-sm
                   bg-background border-gray-300 text-gray-900 placeholder-gray-400
                   ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'} 
                   ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                   ${className || ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
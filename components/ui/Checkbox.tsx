import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, id, error, className, ...props }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <input
          id={id}
          type="checkbox"
          className={`h-4 w-4 text-primary-700 border-gray-400 rounded focus:ring-primary-700 bg-white ${className || ''}`}
          {...props}
        />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-800"> {/* Changed text color */}
          {label}
        </label>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number | boolean; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, id, error, options, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-md shadow-sm 
                   focus:outline-none focus:ring-primary-700 focus:border-primary-700 sm:text-sm
                   bg-background border-gray-300 text-gray-900
                   ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
                   ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                   ${className || ''}`}
        {...props}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)} className="text-gray-900">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
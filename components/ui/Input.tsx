
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string; // id is now required for label association
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, label, id, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-light-bg dark:bg-dark-bg px-3 py-2 text-sm text-light-text dark:text-dark-text placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-light-bg dark:focus:ring-offset-dark-bg disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ''}`}
        ref={ref}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';

export { Input };

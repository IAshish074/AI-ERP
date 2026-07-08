import React from 'react';

export const Input = ({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  className = '',
  icon: Icon,
  required = false,
  ...props
}) => {
  return (
    <div className={`flex flex-col space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="text-sm font-medium text-zinc-300 flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-zinc-500 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full bg-zinc-900 border ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-zinc-800 focus:ring-primary focus:border-transparent'
          } rounded-xl px-4 py-2.5 ${Icon ? 'pl-10' : ''} text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-50`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default Input;

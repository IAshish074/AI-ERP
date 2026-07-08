import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export const SearchBox = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  className = '',
  ...props
}) => {
  return (
    <div className={`relative flex items-center w-full max-w-md ${className}`}>
      <div className="absolute left-3 text-zinc-500 pointer-events-none">
        <FiSearch className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-zinc-900 border border-zinc-800 focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-zinc-500 transition-all"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 p-1 rounded-full text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBox;

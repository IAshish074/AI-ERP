import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin`}
        style={{ borderColor: 'rgba(59, 130, 246, 0.2)', borderTopColor: '#3B82F6' }}
      />
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="w-1/3 h-4 bg-zinc-800 rounded"></div>
      <div className="w-8 h-8 bg-zinc-800 rounded-lg"></div>
    </div>
    <div className="w-2/3 h-8 bg-zinc-800 rounded"></div>
    <div className="w-1/2 h-3 bg-zinc-800 rounded"></div>
  </div>
);

export const ProductCardSkeleton = () => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-square bg-zinc-800 w-full"></div>
    <div className="p-4 space-y-3">
      <div className="w-1/3 h-3 bg-zinc-800 rounded"></div>
      <div className="w-3/4 h-5 bg-zinc-800 rounded"></div>
      <div className="w-1/2 h-4 bg-zinc-800 rounded"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="w-1/4 h-4 bg-zinc-800 rounded"></div>
        <div className="w-1/3 h-5 bg-zinc-800 rounded-full"></div>
      </div>
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="border-b border-zinc-800 animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
      </td>
    ))}
  </tr>
);

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-3">
      <Spinner size="lg" />
      <p className="text-zinc-400 text-sm animate-pulse">Loading dashboard modules...</p>
    </div>
  </div>
);

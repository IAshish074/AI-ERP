import React from 'react';

export const EmptyState = ({
  icon: Icon,
  title = 'No records found',
  description = 'Try adjusting your filters or search terms.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl min-h-[300px]">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800/80 text-zinc-400 mb-4 border border-zinc-700">
        {Icon ? <Icon className="w-8 h-8" /> : (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm max-w-md mb-6">{description}</p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

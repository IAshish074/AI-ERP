import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Logic for showing dots
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      if (start > 2) pages.push('...');
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) pages.push('...');
      
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={`flex items-center justify-between px-2 py-4 border-t border-zinc-800/80 ${className}`}>
      {/* Small mobile text */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-zinc-800 text-sm font-medium rounded-xl text-zinc-350 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-zinc-800 text-sm font-medium rounded-xl text-zinc-350 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          Next
        </button>
      </div>

      {/* Responsive layout */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">
            Page <span className="font-semibold text-white">{currentPage}</span> of{' '}
            <span className="font-semibold text-white">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px" aria-label="Pagination">
            {/* Prev Button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2.5 py-2 rounded-l-xl border border-zinc-800 bg-zinc-900 text-sm font-medium text-zinc-450 hover:bg-zinc-800 hover:text-white disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <span className="sr-only">Previous</span>
              <FiChevronLeft className="h-4 h-4" />
            </button>

            {/* Page Buttons */}
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`dots-${index}`}
                    className="relative inline-flex items-center px-4 py-2 border border-zinc-800 bg-zinc-900 text-sm font-medium text-zinc-500 pointer-events-none"
                  >
                    ...
                  </span>
                );
              }

              const isActive = page === currentPage;
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'z-10 bg-primary border-primary text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2.5 py-2 rounded-r-xl border border-zinc-800 bg-zinc-900 text-sm font-medium text-zinc-450 hover:bg-zinc-800 hover:text-white disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <span className="sr-only">Next</span>
              <FiChevronRight className="h-4 h-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;

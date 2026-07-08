import React from 'react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { TableRowSkeleton } from './Loader';
import EmptyState from './EmptyState';

export const Table = ({
  headers = [], // Array of { key, label, sortable, width }
  data = [],
  renderRow,
  loading = false,
  sortConfig = { key: null, direction: 'asc' },
  onSort,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  className = '',
}) => {
  const handleSort = (key) => {
    if (!onSort) return;
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    onSort(key, direction);
  };

  const getSortIcon = (header) => {
    if (!sortConfig || sortConfig.key !== header.key) return null;
    return sortConfig.direction === 'asc' ? (
      <FiArrowUp className="w-3.5 h-3.5 ml-1 text-primary" />
    ) : (
      <FiArrowDown className="w-3.5 h-3.5 ml-1 text-primary" />
    );
  };

  return (
    <div className={`w-full overflow-x-auto border border-zinc-800 bg-zinc-900/40 rounded-2xl ${className}`}>
      <table className="min-w-full divide-y divide-zinc-800">
        <thead className="bg-zinc-950/70">
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                scope="col"
                style={{ width: header.width }}
                className={`px-6 py-4.5 text-left text-xs font-semibold text-zinc-400 tracking-wider uppercase ${
                  header.sortable && onSort ? 'cursor-pointer hover:text-white select-none' : ''
                }`}
                onClick={() => header.sortable && onSort && handleSort(header.key)}
              >
                <div className="flex items-center">
                  {header.label}
                  {header.sortable && onSort && getSortIcon(header)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/80 bg-transparent">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRowSkeleton key={`skeleton-${idx}`} cols={headers.length} />
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12">
                <EmptyState
                  icon={emptyIcon}
                  title={emptyTitle || 'No records found'}
                  description={emptyDescription || 'There is no data to display here.'}
                />
              </td>
            </tr>
          ) : (
            data.map((item, index) => renderRow(item, index))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  className = '',
}) => {
  const styles = {
    default: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
    success: 'bg-green-500/10 text-green-400 border border-green-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant] || styles.default} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;

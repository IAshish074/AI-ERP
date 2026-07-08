import React from 'react';
import { motion } from 'framer-motion';
import { Spinner } from './Loader';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size = 'md',        // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary: 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 focus:ring-primary',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 focus:ring-zinc-600',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 focus:ring-red-500',
    success: 'bg-success hover:bg-green-600 text-white shadow-lg shadow-green-500/20 focus:ring-success',
    ghost: 'hover:bg-zinc-850 text-zinc-400 hover:text-white focus:ring-zinc-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return (
    <motion.button
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
      whileHover={disabled || loading ? {} : { scale: 1.01 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-2 border-white" />}
      {!loading && Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </motion.button>
  );
};

export default Button;

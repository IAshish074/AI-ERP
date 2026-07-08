import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glow = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md';
  const glowClasses = glow ? 'before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-primary before:to-success' : '';
  const clickClasses = onClick ? 'cursor-pointer hover:border-zinc-700' : '';

  if (onClick) {
    return (
      <motion.div
        whileHover={hoverEffect ? { scale: 1.01, translateY: -2 } : {}}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className={`${baseClasses} ${glowClasses} ${clickClasses} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${baseClasses} ${glowClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex justify-between items-center mb-4 pb-3 border-b border-zinc-800/60 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export default Card;

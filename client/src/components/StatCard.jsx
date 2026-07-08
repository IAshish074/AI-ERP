import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export const StatCard = ({
  title,
  value, // Numeric target value
  formatter = (val) => val,
  icon: Icon,
  iconColor = 'text-primary',
  trend = { value: 0, isPositive: true, text: '' },
  loading = false,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (loading || typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 1000; // 1s animation
    const stepTime = Math.abs(Math.floor(duration / end)) || 15;
    
    const timer = setInterval(() => {
      start += Math.ceil(end / 40); // Increment step
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, loading]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-3 w-2/3">
            <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
            <div className="h-8 bg-zinc-800 rounded w-3/4"></div>
          </div>
          <div className="w-10 h-10 bg-zinc-800 rounded-xl"></div>
        </div>
        <div className="h-3 bg-zinc-800 rounded w-5/6 mt-4"></div>
      </Card>
    );
  }

  const formattedValue = typeof value === 'number' ? formatter(displayValue) : value;

  return (
    <Card hoverEffect className="relative group overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
      
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</span>
          <h3 className="text-3xl font-bold text-white tracking-tight">{formattedValue}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-zinc-850 border border-zinc-800 ${iconColor} group-hover:border-zinc-700 transition-colors shadow-inner`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && trend.value !== 0 && (
        <div className="flex items-center mt-4 space-x-1.5 text-xs">
          <span className={`inline-flex items-center font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.isPositive ? (
              <FiTrendingUp className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <FiTrendingDown className="w-3.5 h-3.5 mr-0.5" />
            )}
            {trend.value}%
          </span>
          <span className="text-zinc-550">{trend.text}</span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;

import React from 'react';
import { Card, CardHeader, CardBody } from './Card';

export const ChartCard = ({
  title,
  subtitle,
  actions,
  children,
  className = '',
}) => {
  return (
    <Card className={`h-[380px] flex flex-col ${className}`}>
      <CardHeader className="mb-2">
        <div>
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </CardHeader>
      <CardBody className="flex-1 min-h-0 w-full relative">
        {children}
      </CardBody>
    </Card>
  );
};

export default ChartCard;

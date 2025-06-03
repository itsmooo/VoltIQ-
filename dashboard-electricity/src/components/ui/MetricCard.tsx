import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  trend,
  icon
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200 hover:shadow-md">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white truncate">
              {value}
            </p>
            {subtitle && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className="ml-4">
              {icon}
            </div>
          )}
        </div>
      </div>
      
      {change !== undefined && (
        <div className={`px-5 py-2 bg-gray-50 dark:bg-gray-700 text-xs flex items-center ${
          trend === 'up' 
            ? 'text-red-600 dark:text-red-400' 
            : trend === 'down' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span className="font-medium">
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span className="ml-1">
            vs previous period
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
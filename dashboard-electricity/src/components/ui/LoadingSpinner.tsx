import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} border-t-blue-500 border-blue-200 dark:border-blue-700 dark:border-t-blue-400 rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;
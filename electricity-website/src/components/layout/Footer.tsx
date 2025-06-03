import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div>
            <p>© 2025 PowerForecast. All rights reserved.</p>
          </div>
          <div>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
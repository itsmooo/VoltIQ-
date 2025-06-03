import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center transition-colors duration-200">
          <div className="rounded-full bg-red-100 dark:bg-red-900 p-3 mx-auto w-16 h-16 flex items-center justify-center">
            <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            404
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Page not found
          </p>
          
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="mt-6">
            <Link
              to="/"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Home size={16} className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
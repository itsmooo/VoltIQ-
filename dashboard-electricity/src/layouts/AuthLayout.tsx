import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow hover:shadow-md transition-all"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
      
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
      
      <footer className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>© 2025 PowerForecast. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
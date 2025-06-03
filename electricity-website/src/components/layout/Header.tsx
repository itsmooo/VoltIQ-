import React from 'react';
import { Menu, Bell, Sun, Moon, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { mockAlerts } from '../../data/mockData';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  const unreadAlerts = mockAlerts.filter(alert => !alert.acknowledged).length;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10 transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              type="button"
              className="px-4 text-gray-500 dark:text-gray-400 md:hidden focus:outline-none"
              onClick={onMenuClick}
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">PowerForecast</span>
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            {/* Notifications */}
            <div className="relative ml-3">
              <button
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
                aria-label="View notifications"
              >
                <Bell size={20} />
                {unreadAlerts > 0 && (
                  <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {unreadAlerts}
                  </span>
                )}
              </button>
            </div>
            
            {/* Profile dropdown */}
            <div className="relative ml-3">
              <div className="flex items-center">
                <button className="flex text-sm rounded-full focus:outline-none">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <User size={16} />
                  </div>
                </button>
                <div className="ml-2 hidden md:flex flex-col">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
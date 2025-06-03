import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Save, Bell, Lock, User, Users, Database, Mail } from 'lucide-react';
import PageTitle from '../components/ui/PageTitle';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('account');
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    appNotifications: true,
    dailySummary: false,
    weeklyReport: true,
    criticalAlerts: true,
  });
  
  const handleNotificationChange = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="space-y-6">
      <PageTitle title="Settings" subtitle="Manage your account and application preferences" />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-200">
        {/* Settings Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('account')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'account'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <User size={16} className="inline mr-2" />
              Account
            </button>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Bell size={16} className="inline mr-2" />
              Notifications
            </button>
            
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Lock size={16} className="inline mr-2" />
              Security
            </button>
            
            <button
              onClick={() => setActiveTab('team')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'team'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Users size={16} className="inline mr-2" />
              Team
            </button>
            
            <button
              onClick={() => setActiveTab('data')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'data'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Database size={16} className="inline mr-2" />
              Data Settings
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Account Information</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update your account information and preferences.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    defaultValue={user?.name}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    defaultValue={user?.email}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    id="role"
                    defaultValue={user?.role}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 dark:bg-gray-600 dark:text-gray-300"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mt-6">Preferences</h3>
                
                <div className="mt-4">
                  <div className="flex items-center">
                    <input
                      id="theme-toggle"
                      name="theme-toggle"
                      type="checkbox"
                      checked={theme === 'dark'}
                      onChange={toggleTheme}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="theme-toggle" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Dark Mode
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Save size={16} className="inline mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          )}
          
          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Notification Settings</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Configure how and when you receive notifications.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Mail size={16} className="mr-2" />
                    Email Notifications
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="email-alerts" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Alert Emails
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Receive emails for important alerts
                        </p>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          id="email-alerts"
                          checked={notificationSettings.emailAlerts}
                          onChange={() => handleNotificationChange('emailAlerts')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="daily-summary" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Daily Summary
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Daily consumption summary email
                        </p>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          id="daily-summary"
                          checked={notificationSettings.dailySummary}
                          onChange={() => handleNotificationChange('dailySummary')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="weekly-report" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Weekly Report
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Weekly consumption and forecast report
                        </p>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          id="weekly-report"
                          checked={notificationSettings.weeklyReport}
                          onChange={() => handleNotificationChange('weeklyReport')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Bell size={16} className="mr-2" />
                    In-App Notifications
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="app-notifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          App Notifications
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Enable in-app notifications
                        </p>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          id="app-notifications"
                          checked={notificationSettings.appNotifications}
                          onChange={() => handleNotificationChange('appNotifications')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="critical-alerts" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Critical Alerts
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Notifications for critical issues
                        </p>
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          id="critical-alerts"
                          checked={notificationSettings.criticalAlerts}
                          onChange={() => handleNotificationChange('criticalAlerts')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Save size={16} className="inline mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          )}
          
          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Security Settings</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage your password and security preferences.
                </p>
              </div>
              
              <div>
                <h4 className="text-md font-medium">Change Password</h4>
                <div className="mt-3 space-y-4">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="current-password"
                      id="current-password"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="new-password"
                      id="new-password"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirm-password"
                      id="confirm-password"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-medium">Two-Factor Authentication</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add an extra layer of security to your account.
                </p>
                
                <div className="mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Enable Two-Factor Authentication
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Other tabs would be implemented similarly */}
          {(activeTab === 'team' || activeTab === 'data') && (
            <div className="py-6 text-center text-gray-500 dark:text-gray-400">
              <p>This section is under development.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
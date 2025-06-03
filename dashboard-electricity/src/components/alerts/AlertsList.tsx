import React from 'react';
import { Alert } from '../../types/dataTypes';
import { AlertTriangle, Info, AlertCircle, Check, ChevronRight } from 'lucide-react';
import { mockAlerts } from '../../data/mockData';

interface AlertsListProps {
  limit?: number;
}

const AlertsList: React.FC<AlertsListProps> = ({ limit }) => {
  // Get alerts, applying the limit if provided
  const alerts = limit ? mockAlerts.slice(0, limit) : mockAlerts;

  // Format date relative to now
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  // Icon based on alert type
  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="text-yellow-500\" size={18} />;
      case 'info':
        return <Info className="text-blue-500" size={18} />;
      case 'critical':
        return <AlertCircle className="text-red-500" size={18} />;
      default:
        return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No alerts to display
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {alerts.map((alert) => (
            <li key={alert.id} className="py-3">
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                  {getIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {alert.message}
                    </p>
                    {alert.acknowledged && (
                      <span className="ml-2 flex-shrink-0">
                        <Check className="text-green-500" size={16} />
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(alert.timestamp)}
                  </p>
                </div>
                <div className="ml-3">
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {limit && mockAlerts.length > limit && (
        <div className="pt-2">
          <a 
            href="#" 
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            View all alerts
          </a>
        </div>
      )}
    </div>
  );
};

export default AlertsList;
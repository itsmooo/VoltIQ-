import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PlayCircle, Calendar, ChevronDown, AlertTriangle } from 'lucide-react';

// Components
import ForecastChart from '../components/charts/ForecastChart';
import ForecastTable from '../components/tables/ForecastTable';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageTitle from '../components/ui/PageTitle';

const Forecasting: React.FC = () => {
  const { forecastData, updateForecast, isLoading } = useData();
  const [forecastDays, setForecastDays] = useState(7);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleUpdateForecast = () => {
    updateForecast({ days: forecastDays });
  };

  return (
    <div className="space-y-6">
      <PageTitle title="Forecasting" subtitle="Generate and analyze electricity consumption forecasts" />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <h2 className="text-lg font-medium mb-4">Forecast Parameters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <label htmlFor="forecastDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Forecast Period (Days)
            </label>
            <select
              id="forecastDays"
              value={forecastDays}
              onChange={(e) => setForecastDays(Number(e.target.value))}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value={3}>3 Days</option>
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Region
            </label>
            <select
              id="region"
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              defaultValue="regionA"
            >
              <option value="regionA">Region A</option>
              <option value="regionB">Region B</option>
              <option value="regionC">Region C</option>
              <option value="all">All Regions</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Source
            </label>
            <select
              id="source"
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              defaultValue="all"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="all">All Sources</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Forecast Model
            </label>
            <select
              id="model"
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              defaultValue="standard"
            >
              <option value="standard">Standard Model</option>
              <option value="advanced">Advanced ML Model</option>
              <option value="weather">Weather-Enhanced</option>
              <option value="ensemble">Ensemble Model</option>
            </select>
          </div>
        </div>
        
        {/* Advanced Parameters (Toggle) */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <ChevronDown
              size={16}
              className={`mr-1 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            />
            {showAdvanced ? 'Hide Advanced Parameters' : 'Show Advanced Parameters'}
          </button>
          
          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confidence Interval
                </label>
                <select
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  defaultValue="95"
                >
                  <option value="90">90%</option>
                  <option value="95">95%</option>
                  <option value="99">99%</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Seasonality Adjustment
                </label>
                <select
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  defaultValue="auto"
                >
                  <option value="none">None</option>
                  <option value="auto">Automatic</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Anomaly Detection
                </label>
                <select
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  defaultValue="standard"
                >
                  <option value="disabled">Disabled</option>
                  <option value="standard">Standard</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center text-yellow-600 dark:text-yellow-400 mb-4 sm:mb-0">
            <AlertTriangle size={20} className="mr-2" />
            <span className="text-sm">Forecast accuracy decreases with longer time periods</span>
          </div>
          
          <button
            onClick={handleUpdateForecast}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Generating...</span>
              </>
            ) : (
              <>
                <PlayCircle size={16} className="mr-2" />
                <span>Generate Forecast</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {isLoading && forecastData.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Forecast Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
            <h2 className="text-lg font-medium mb-4">Forecast Visualization</h2>
            <div className="h-80">
              <ForecastChart data={forecastData} showConfidenceInterval />
            </div>
          </div>
          
          {/* Forecast Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Forecast Details</h2>
              <button className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                <Calendar size={16} className="mr-1" />
                Export to Calendar
              </button>
            </div>
            <ForecastTable data={forecastData} />
          </div>
        </>
      )}
    </div>
  );
};

export default Forecasting;
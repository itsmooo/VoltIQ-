import React, { useEffect } from 'react';
import { useData } from '../context/DataContext';
import { ArrowUp, ArrowDown, RefreshCw, AlertTriangle } from 'lucide-react';
import EnergyPredictor from '../components/EnergyPredictor';

// Components
import ConsumptionChart from '../components/charts/ConsumptionChart';
import WeatherChart from '../components/charts/WeatherChart';
import ForecastChart from '../components/charts/ForecastChart';
import MetricCard from '../components/ui/MetricCard';
import PageTitle from '../components/ui/PageTitle';
import AlertsList from '../components/alerts/AlertsList';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { consumptionData, forecastData, weatherData, isLoading, refreshData } = useData();

  useEffect(() => {
    // Fetch data on initial load
    refreshData();
  }, []);

  // Calculate metrics
  const currentConsumption = consumptionData.length > 0 
    ? consumptionData[consumptionData.length - 1].value 
    : 0;
  
  const previousConsumption = consumptionData.length > 1 
    ? consumptionData[consumptionData.length - 2].value 
    : 0;
  
  const consumptionChange = previousConsumption ? 
    ((currentConsumption - previousConsumption) / previousConsumption) * 100 
    : 0;

  const todayForecast = forecastData.length > 0 ? forecastData[0].predictedValue : 0;
  const weekForecast = forecastData.slice(0, 7).reduce((sum, item) => sum + item.predictedValue, 0);
  
  const averageTemperature = weatherData.length > 0
    ? weatherData.reduce((sum, item) => sum + item.temperature, 0) / weatherData.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <PageTitle title="Dashboard" subtitle="Overview of electricity consumption and forecasts" />
        
        <button 
          onClick={() => refreshData()}
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Refreshing...</span>
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              <span className="ml-2">Refresh Data</span>
            </>
          )}
        </button>
      </div>

      {isLoading && consumptionData.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Current Consumption" 
              value={`${currentConsumption.toFixed(2)} kWh`}
              change={consumptionChange}
              icon={consumptionChange >= 0 ? <ArrowUp className="text-red-500" /> : <ArrowDown className="text-green-500" />}
              trend={consumptionChange >= 0 ? 'up' : 'down'}
            />
            
            <MetricCard 
              title="Today's Forecast" 
              value={`${todayForecast.toFixed(2)} kWh`}
              subtitle="Predicted consumption"
            />
            
            <MetricCard 
              title="7-Day Forecast" 
              value={`${weekForecast.toFixed(2)} kWh`}
              subtitle="Total for next 7 days"
            />
            
            <MetricCard 
              title="Average Temperature" 
              value={`${averageTemperature.toFixed(1)}°C`}
              subtitle="Last 30 days"
              icon={<AlertTriangle className="text-yellow-500" />}
            />
          </div>

          {/* Energy Predictor */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200 mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Energy Consumption Predictor</h3>
            <EnergyPredictor />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Consumption Trends</h3>
              <div className="h-80">
                <ConsumptionChart data={consumptionData} />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Consumption Forecast</h3>
              <div className="h-80">
                <ForecastChart data={forecastData} />
              </div>
            </div>
          </div>

          {/* Additional sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Weather Correlation</h3>
              <div className="h-64">
                <WeatherChart data={weatherData} />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Alerts</h3>
              <AlertsList limit={5} />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Energy Predictor</h3>
              <EnergyPredictor />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
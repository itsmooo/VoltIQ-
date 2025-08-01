import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { ArrowUp, ArrowDown, RefreshCw, AlertTriangle, DollarSign, TrendingUp, Clock, Brain } from 'lucide-react';
import EnergyPredictor from '../components/EnergyPredictor';

// Components
import ConsumptionChart from '../components/charts/ConsumptionChart';
import WeatherChart from '../components/charts/WeatherChart';
import ForecastChart from '../components/charts/ForecastChart';
import MetricCard from '../components/ui/MetricCard';
import PageTitle from '../components/ui/PageTitle';
import AlertsList from '../components/alerts/AlertsList';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface PredictionResult {
  success: boolean;
  prediction: number;
  confidence: number;
  unit: string;
  model_type: string;
  features_used: number;
  timestamp: string;
  error?: string;
}

const Dashboard: React.FC = () => {
  const { consumptionData, forecastData, weatherData, isLoading, refreshData } = useData();
  const [latestPrediction, setLatestPrediction] = useState<PredictionResult | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<PredictionResult[]>([]);

  useEffect(() => {
    // Fetch data on initial load
    refreshData();
  }, []);

  // Handle prediction completion from EnergyPredictor
  const handlePredictionComplete = (prediction: PredictionResult) => {
    setLatestPrediction(prediction);
    if (prediction.success) {
      setPredictionHistory(prev => [...prev, prediction]);
    }
  };

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

  // Calculate cost based on prediction (assuming $0.12 per kWh)
  const electricityRate = 0.12; // $ per kWh
  const predictedCost = latestPrediction?.success ? latestPrediction.prediction * electricityRate : todayForecast * electricityRate;
  const actualCost = currentConsumption * electricityRate;
  const costSavings = actualCost - predictedCost;

  // Find peak hour from consumption data
  const peakHour = consumptionData.length > 0 
    ? consumptionData.reduce((peak, current) => 
        current.value > peak.value ? current : peak
      ).timestamp
    : null;

  const formatPeakHour = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Calculate energy saved (difference between actual and predicted)
  const energySaved = latestPrediction?.success 
    ? Math.abs(currentConsumption - latestPrediction.prediction)
    : Math.abs(currentConsumption - todayForecast);

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
          <EnergyPredictor onPredictionComplete={handlePredictionComplete} />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Consumption Trends</h3>
              <div className="h-80">
                <ConsumptionChart 
                  data={consumptionData} 
                  predictionData={latestPrediction}
                />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Consumption Forecast</h3>
              <div className="h-80">
                <ForecastChart 
                  data={forecastData} 
                  showConfidenceInterval={true}
                  predictionData={latestPrediction}
                />
              </div>
            </div>
          </div>

          {/* Additional sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Weather Correlation</h3>
              <div className="h-64">
                <WeatherChart 
                  data={weatherData} 
                  predictionData={latestPrediction}
                />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Alerts</h3>
              <AlertsList limit={5} />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Actual Cost Today:</span>
                  </div>
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    ${actualCost.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {latestPrediction?.success ? 'Predicted Cost:' : 'Forecast Cost:'}
                    </span>
                  </div>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    ${predictedCost.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cost Difference:</span>
                  </div>
                  <span className={`font-medium ${costSavings >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {costSavings >= 0 ? '+' : ''}${costSavings.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Energy Saved:</span>
                  </div>
                  <span className="font-medium text-yellow-900 dark:text-yellow-100">
                    {energySaved.toFixed(2)} kWh
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Peak Hour Today:</span>
                  </div>
                  <span className="font-medium text-indigo-900 dark:text-indigo-100">
                    {peakHour ? formatPeakHour(peakHour) : 'N/A'}
                  </span>
                </div>
                
                {latestPrediction?.success && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Prediction Confidence:</span>
                    </div>
                    <span className="font-medium text-orange-900 dark:text-orange-100">
                      {latestPrediction.confidence.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
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

  // Calculate metrics with safe defaults
  // Use latest prediction as current consumption if available, otherwise use actual data
  const currentConsumption = latestPrediction?.success 
    ? (latestPrediction.prediction || 0)
    : (consumptionData && consumptionData.length > 0 
        ? consumptionData[consumptionData.length - 1]?.value || 0
        : 0);
  
  const previousConsumption = consumptionData && consumptionData.length > 1 
    ? consumptionData[consumptionData.length - 2]?.value || 0
    : 0;
  
  const consumptionChange = previousConsumption ? 
    ((currentConsumption - previousConsumption) / previousConsumption) * 100 
    : 0;

  // Use latest prediction for today's forecast if available, otherwise use forecast data
  const todayForecast = latestPrediction?.success 
    ? (latestPrediction.prediction || 0)
    : (forecastData && forecastData.length > 0 
        ? forecastData[0]?.predictedValue || 0 
        : 0);
  
  // Update week forecast to include the latest prediction for today
  const weekForecast = (() => {
    if (latestPrediction?.success) {
      // Use the latest prediction for today, then add next 6 days from forecast
      const todayPrediction = latestPrediction.prediction || 0;
      const nextSixDays = forecastData && forecastData.length > 0
        ? forecastData.slice(1, 7).reduce((sum, item) => sum + (item?.predictedValue || 0), 0)
        : 0;
      return todayPrediction + nextSixDays;
    } else {
      // Use original forecast data
      return forecastData && forecastData.length > 0
        ? forecastData.slice(0, 7).reduce((sum, item) => sum + (item?.predictedValue || 0), 0)
        : 0;
    }
  })();
  
  const averageTemperature = weatherData && weatherData.length > 0
    ? weatherData.reduce((sum, item) => sum + (item?.temperature || 0), 0) / weatherData.length
    : 0;

  // Calculate cost based on prediction (assuming $0.12 per kWh)
  const electricityRate = 0.12; // $ per kWh
  
  // Use the latest prediction if available, otherwise use forecast
  const predictedConsumption = latestPrediction?.success 
    ? (latestPrediction.prediction || 0)
    : (todayForecast || 0);
  
  const predictedCost = predictedConsumption * electricityRate;
  const actualCost = (currentConsumption || 0) * electricityRate;
  const costSavings = actualCost - predictedCost;

  // Find peak hour from consumption data
  const peakHour = consumptionData && consumptionData.length > 0 
    ? consumptionData.reduce((peak, current) => 
        (current?.value || 0) > (peak?.value || 0) ? current : peak
      )?.timestamp
    : null;

  const formatPeakHour = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Calculate energy saved (difference between actual and predicted)
  const energySaved = latestPrediction?.success 
    ? Math.abs((currentConsumption || 0) - (latestPrediction.prediction || 0))
    : Math.abs((currentConsumption || 0) - (todayForecast || 0));

  // Calculate monthly cost projections
  const monthlyActualCost = (currentConsumption || 0) * electricityRate * 30;
  const monthlyPredictedCost = predictedConsumption * electricityRate * 30;
  const monthlySavings = monthlyActualCost - monthlyPredictedCost;

  // Calculate efficiency percentage
  const efficiencyPercentage = latestPrediction?.success 
    ? Math.max(0, Math.min(100, 100 - Math.abs((currentConsumption || 0) - (latestPrediction.prediction || 0)) / (currentConsumption || 1) * 100))
    : 85; // Default efficiency when no prediction

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <PageTitle title="Dashboard" subtitle="Overview of electricity consumption and forecasts" />
        
        <button 
          onClick={() => refreshData()}
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <>
          {/* Metrics Cards */}
          {latestPrediction?.success && (
            <div className="col-span-full mb-2">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center">
                  <Brain className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    AI Prediction Active: Cards updated with latest prediction ({latestPrediction.confidence}% confidence)
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title={latestPrediction?.success ? "AI Prediction" : "Current Consumption"}
              value={`${(currentConsumption || 0).toFixed(2)} kWh`}
              change={consumptionChange}
              icon={consumptionChange >= 0 ? <ArrowUp className="text-red-500" /> : <ArrowDown className="text-green-500" />}
              trend={consumptionChange >= 0 ? 'up' : 'down'}
              subtitle={latestPrediction?.success ? `Confidence: ${latestPrediction.confidence}%` : undefined}
            />
            
            <MetricCard 
              title="Today's Forecast" 
              value={`${(todayForecast || 0).toFixed(2)} kWh`}
              subtitle={latestPrediction?.success ? "AI Predicted" : "Predicted consumption"}
            />
            
            <MetricCard 
              title="7-Day Forecast" 
              value={`${(weekForecast || 0).toFixed(2)} kWh`}
              subtitle={latestPrediction?.success ? "Includes AI prediction" : "Total for next 7 days"}
            />
            
            <MetricCard 
              title="Average Temperature" 
              value={`${(averageTemperature || 0).toFixed(1)}°C`}
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
                  data={consumptionData || []} 
                  predictionData={latestPrediction}
                />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Consumption Forecast</h3>
              <div className="h-80">
                <ForecastChart 
                  data={forecastData || []} 
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
                  data={weatherData || []} 
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
                    ${(actualCost || 0).toFixed(2)}
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
                    ${(predictedCost || 0).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cost Difference:</span>
                  </div>
                  <span className={`font-medium ${costSavings >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {costSavings >= 0 ? '+' : ''}${(costSavings || 0).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Projection:</span>
                  </div>
                  <span className="font-medium text-indigo-900 dark:text-indigo-100">
                    ${(monthlyPredictedCost || 0).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Peak Hour:</span>
                  </div>
                  <span className="font-medium text-yellow-900 dark:text-yellow-100">
                    {formatPeakHour(peakHour || '')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency:</span>
                  </div>
                  <span className="font-medium text-orange-900 dark:text-orange-100">
                    {(efficiencyPercentage || 0).toFixed(1)}%
                  </span>
                </div>
                
                {latestPrediction?.success && (
                  <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Model Confidence:</span>
                    </div>
                    <span className="font-medium text-teal-900 dark:text-teal-100">
                      {(latestPrediction.confidence || 0).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default Dashboard;
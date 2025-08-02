"use client"

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface PredictionForm {
  temperature: number;
  humidity: number;
  squareFootage: number;
  occupancy: number;
  hvacUsage: boolean;
  lightingUsage: boolean;
  renewableEnergy: number;
  dayOfWeek: number;
  holiday: boolean;
}

interface EnergyPredictorProps {
  onPredictionComplete?: (prediction: any) => void;
}

const EnergyPredictor: React.FC<EnergyPredictorProps> = ({ onPredictionComplete }) => {
  const { makePrediction, getModelInfo } = useData();
  const { user } = useAuth();
  const [formData, setFormData] = useState<PredictionForm>({
    temperature: 25,
    humidity: 50,
    squareFootage: 1500,
    occupancy: 5,
    hvacUsage: true,
    lightingUsage: true,
    renewableEnergy: 10,
    dayOfWeek: new Date().getDay(),
    holiday: false,
  });
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);

  const dayOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const predictionData = {
        ...formData,
        hvacUsage: formData.hvacUsage ? 1 : 0,
        lightingUsage: formData.lightingUsage ? 1 : 0,
        holiday: formData.holiday ? 1 : 0,
      };

      const result = await makePrediction(predictionData);
      setPrediction(result.prediction);
      
      // Notify parent component about the prediction
      if (onPredictionComplete) {
        onPredictionComplete({
          success: true,
          prediction: result.prediction,
          confidence: result.confidence || 95,
          unit: 'kWh',
          model_type: 'Ridge Regression',
          features_used: 40,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      setError('Failed to make prediction. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadModelInfo = async () => {
    try {
      const info = await getModelInfo();
      setModelInfo(info);
    } catch (err) {
      console.error('Failed to load model info:', err);
    }
  };

  React.useEffect(() => {
    loadModelInfo();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Energy Consumption Predictor</h2>
        {user && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Welcome, {user.name} ({user.role})
          </span>
        )}
      </div>

      {modelInfo && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors duration-200">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Model Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Model:</span> <span className="text-gray-900 dark:text-white">{modelInfo.model_name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Accuracy:</span> <span className="text-gray-900 dark:text-white">{modelInfo.accuracy}%</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Features:</span> <span className="text-gray-900 dark:text-white">{modelInfo.feature_count}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Last Updated:</span> <span className="text-gray-900 dark:text-white">{modelInfo.last_updated}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Temperature (°C)
            </label>
            <input
              type="number"
              name="temperature"
              value={formData.temperature}
              onChange={handleInputChange}
              min="0"
              max="50"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              required
            />
          </div>

          {/* Humidity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Humidity (%)
            </label>
            <input
              type="number"
              name="humidity"
              value={formData.humidity}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              required
            />
          </div>

          {/* Square Footage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Square Footage
            </label>
            <input
              type="number"
              name="squareFootage"
              value={formData.squareFootage}
              onChange={handleInputChange}
              min="100"
              max="10000"
              step="100"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              required
            />
          </div>

          {/* Occupancy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Occupancy
            </label>
            <input
              type="number"
              name="occupancy"
              value={formData.occupancy}
              onChange={handleInputChange}
              min="0"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              required
            />
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Day of Week
            </label>
            <select
              name="dayOfWeek"
              value={formData.dayOfWeek}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              required
            >
              {dayOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Renewable Energy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Renewable Energy (kWh)
            </label>
            <input
              type="number"
              name="renewableEnergy"
              value={formData.renewableEnergy}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              required
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="hvacUsage"
              checked={formData.hvacUsage}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900 dark:text-white">
              HVAC System Active
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="lightingUsage"
              checked={formData.lightingUsage}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900 dark:text-white">
              Lighting System Active
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="holiday"
              checked={formData.holiday}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900 dark:text-white">
              Holiday
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Making Prediction...' : 'Predict Energy Consumption'}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md transition-colors duration-200">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Prediction Result */}
      {prediction !== null && (
        <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg transition-colors duration-200">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Prediction Result</h3>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            {prediction.toFixed(2)} kWh
          </div>
          <p className="text-green-700 dark:text-green-300">
            Estimated energy consumption based on the provided parameters.
          </p>
          
          {/* Additional insights */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Estimated Cost:</span> <span className="text-gray-900 dark:text-white">${(prediction * 0.12).toFixed(2)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Efficiency Score:</span> <span className="text-gray-900 dark:text-white">{Math.max(0, Math.min(100, 100 - (prediction - 40) * 2)).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyPredictor;

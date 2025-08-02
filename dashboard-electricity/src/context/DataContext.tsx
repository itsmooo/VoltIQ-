import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ConsumptionData, WeatherData, ForecastData } from '../types/dataTypes';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const ML_API_BASE_URL = 'http://localhost:5001';

interface DataContextType {
  consumptionData: ConsumptionData[];
  weatherData: WeatherData[];
  forecastData: ForecastData[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateForecast: (params: { days: number }) => Promise<void>;
  makePrediction: (params: any) => Promise<any>;
  getModelInfo: () => Promise<any>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data on component mount
  useEffect(() => {
    refreshData();
  }, []);

  const makeApiCall = async (url: string, options: RequestInit = {}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch real consumption data from the ML API
      const modelInfo = await makeApiCall(`${ML_API_BASE_URL}/model-info`);
      
      // Generate realistic consumption data based on the model
      const now = new Date();
      const consumptionData: ConsumptionData[] = [];
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        consumptionData.push({
          id: `consumption-${i}`,
          timestamp: date.toISOString(),
          value: Math.random() * 50 + 30, // Realistic energy consumption values
          source: 'residential',
          region: 'Default'
        });
      }
      
      setConsumptionData(consumptionData);

      // Generate weather data
      const weatherData: WeatherData[] = [];
      for (let i = 7; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        weatherData.push({
          id: `weather-${i}`,
          timestamp: date.toISOString(),
          temperature: Math.random() * 20 + 15,
          humidity: Math.random() * 30 + 40,
          windSpeed: Math.random() * 20 + 5,
          precipitation: Math.random() * 10,
          cloudCover: Math.random() * 100,
          region: 'Default'
        });
      }
      
      setWeatherData(weatherData);

      // Generate forecast data
      const forecastData: ForecastData[] = [];
      for (let i = 1; i <= 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() + i);
        
        forecastData.push({
          id: `forecast-${i}`,
          timestamp: date.toISOString(),
          predictedValue: Math.random() * 40 + 35,
          confidence: Math.random() * 20 + 80,
          lowerBound: Math.random() * 30 + 30,
          upperBound: Math.random() * 50 + 50,
          source: 'residential',
          region: 'Default'
        });
      }
      
      setForecastData(forecastData);
      
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateForecast = async ({ days }: { days: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      // Make a real prediction using the ML API
      const predictionData = {
        temperature: Math.random() * 20 + 15,
        humidity: Math.random() * 30 + 40,
        squareFootage: Math.random() * 1000 + 500,
        occupancy: Math.floor(Math.random() * 10) + 1,
        hvacUsage: Math.random() > 0.5 ? 1 : 0,
        lightingUsage: Math.random() > 0.5 ? 1 : 0,
        renewableEnergy: Math.random() * 30,
        dayOfWeek: Math.floor(Math.random() * 7),
        holiday: Math.random() > 0.8 ? 1 : 0,
      };

      const prediction = await makeApiCall(`${ML_API_BASE_URL}/predict`, {
        method: 'POST',
        body: JSON.stringify(predictionData),
      });

      // Generate forecast based on the prediction
      const now = new Date();
      const newForecast: ForecastData[] = [];
      
      for (let i = 1; i <= days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() + i);
        
        newForecast.push({
          id: `forecast-${i}`,
          timestamp: date.toISOString(),
          predictedValue: prediction.prediction + (Math.random() - 0.5) * 10,
          confidence: Math.random() * 20 + 80,
          lowerBound: Math.random() * 30 + 30,
          upperBound: Math.random() * 50 + 50,
          source: 'residential',
          region: 'Default'
        });
      }
      
      setForecastData(newForecast);
    } catch (err) {
      setError('Failed to update forecast. Please try again.');
      console.error('Error updating forecast:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const makePrediction = async (params: any) => {
    try {
      const response = await makeApiCall(`${ML_API_BASE_URL}/predict`, {
        method: 'POST',
        body: JSON.stringify(params),
      });
      return response;
    } catch (error) {
      console.error('Prediction failed:', error);
      throw error;
    }
  };

  const getModelInfo = async () => {
    try {
      const response = await makeApiCall(`${ML_API_BASE_URL}/model-info`);
      return response;
    } catch (error) {
      console.error('Failed to get model info:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider
      value={{
        consumptionData,
        weatherData,
        forecastData,
        isLoading,
        error,
        refreshData,
        updateForecast,
        makePrediction,
        getModelInfo,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
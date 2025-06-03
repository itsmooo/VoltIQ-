import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ConsumptionData, WeatherData, ForecastData } from '../types/dataTypes';
import { mockConsumptionData, mockWeatherData, mockForecastData } from '../data/mockData';

interface DataContextType {
  consumptionData: ConsumptionData[];
  weatherData: WeatherData[];
  forecastData: ForecastData[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateForecast: (params: { days: number }) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>(mockConsumptionData);
  const [weatherData, setWeatherData] = useState<WeatherData[]>(mockWeatherData);
  const [forecastData, setForecastData] = useState<ForecastData[]>(mockForecastData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, these would be API calls to fetch the latest data
      setConsumptionData(mockConsumptionData);
      setWeatherData(mockWeatherData);
      setForecastData(mockForecastData);
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would be an API call to generate a new forecast
      // For now, we'll just use the mock data but simulate different forecast lengths
      const newForecast = mockForecastData.slice(0, days);
      setForecastData(newForecast);
    } catch (err) {
      setError('Failed to update forecast. Please try again.');
      console.error('Error updating forecast:', err);
    } finally {
      setIsLoading(false);
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
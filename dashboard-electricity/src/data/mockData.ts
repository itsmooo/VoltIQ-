import { ConsumptionData, WeatherData, ForecastData, Alert } from '../types/dataTypes';

// Helper function to generate dates for the past 30 days
const generateDates = (days: number) => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString());
  }
  
  return dates;
};

// Helper function to generate dates for future days
const generateFutureDates = (days: number) => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 1; i <= days; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString());
  }
  
  return dates;
};

// Generate past 30 days dates
const pastDates = generateDates(30);

// Generate mock consumption data
export const mockConsumptionData: ConsumptionData[] = pastDates.map((date, index) => ({
  id: `consumption-${index}`,
  timestamp: date,
  value: 1000 + Math.random() * 500 + (Math.sin(index / 7) * 200), // Base + random + weekly pattern
  source: index % 3 === 0 ? 'residential' : index % 3 === 1 ? 'commercial' : 'industrial',
  region: 'Region A',
}));

// Generate mock weather data
export const mockWeatherData: WeatherData[] = pastDates.map((date, index) => ({
  id: `weather-${index}`,
  timestamp: date,
  temperature: 15 + (Math.sin(index / 7) * 10) + (Math.random() * 3), // Base + seasonal + random
  humidity: 40 + (Math.cos(index / 7) * 20) + (Math.random() * 10),
  windSpeed: 5 + (Math.random() * 15),
  precipitation: Math.random() < 0.3 ? Math.random() * 10 : 0, // 30% chance of rain
  cloudCover: Math.random() * 100,
  region: 'Region A',
}));

// Generate future dates for forecasts (next 14 days)
const futureDates = generateFutureDates(14);

// Generate mock forecast data
export const mockForecastData: ForecastData[] = futureDates.map((date, index) => {
  const baseValue = 1100 + Math.random() * 400 + (Math.sin(index / 7) * 200);
  const confidence = 95 - (index * 3); // Confidence decreases with forecast distance
  const range = baseValue * (1 - confidence / 100) * 2; // Range based on confidence
  
  return {
    id: `forecast-${index}`,
    timestamp: date,
    predictedValue: baseValue,
    confidence,
    lowerBound: baseValue - range / 2,
    upperBound: baseValue + range / 2,
    source: index % 3 === 0 ? 'residential' : index % 3 === 1 ? 'commercial' : 'industrial',
    region: 'Region A',
  };
});

// Generate mock alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    type: 'warning',
    message: 'Unusual consumption spike detected in Region A',
    acknowledged: false,
  },
  {
    id: 'alert-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    type: 'info',
    message: 'Forecast accuracy improved by 5% with new model',
    acknowledged: true,
  },
  {
    id: 'alert-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    type: 'critical',
    message: 'Data feed interrupted for 15 minutes',
    acknowledged: true,
  },
];
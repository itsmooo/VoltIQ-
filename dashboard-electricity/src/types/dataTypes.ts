// Consumption data types
export interface ConsumptionData {
  id: string;
  timestamp: string;
  value: number; // kWh
  source: 'residential' | 'commercial' | 'industrial';
  region: string;
}

// Weather data types
export interface WeatherData {
  id: string;
  timestamp: string;
  temperature: number; // Celsius
  humidity: number; // Percentage
  windSpeed: number; // km/h
  precipitation: number; // mm
  cloudCover: number; // Percentage
  region: string;
}

// Forecast data types
export interface ForecastData {
  id: string;
  timestamp: string;
  predictedValue: number; // kWh
  confidence: number; // Percentage
  lowerBound: number; // kWh
  upperBound: number; // kWh
  source: 'residential' | 'commercial' | 'industrial';
  region: string;
}

// Alert types
export interface Alert {
  id: string;
  timestamp: string;
  type: 'warning' | 'info' | 'critical';
  message: string;
  acknowledged: boolean;
}
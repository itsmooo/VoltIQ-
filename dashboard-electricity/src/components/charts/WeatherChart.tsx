import React from 'react';
import { WeatherData } from '../../types/dataTypes';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

interface WeatherChartProps {
  data: WeatherData[];
  predictionData?: PredictionResult | null;
}

const WeatherChart: React.FC<WeatherChartProps> = ({ data, predictionData }) => {
  // Format dates for labels
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Process data for chart
  const labels = data.map(item => formatDate(item.timestamp));
  
  const datasets = [
    {
      label: 'Temperature (°C)',
      data: data.map(item => item.temperature),
      borderColor: 'rgb(239, 68, 68)', // Red
      backgroundColor: 'rgba(239, 68, 68, 0.5)',
      yAxisID: 'y',
      tension: 0.2,
      pointRadius: 2,
    },
    {
      label: 'Humidity (%)',
      data: data.map(item => item.humidity),
      borderColor: 'rgb(59, 130, 246)', // Blue
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      yAxisID: 'y1',
      tension: 0.2,
      pointRadius: 2,
    }
  ];

  // Add prediction correlation if available
  if (predictionData?.success) {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    labels.push(today);
    
    // Extend weather data with null for prediction point
    datasets[0].data = [...data.map(item => item.temperature), null];
    datasets[1].data = [...data.map(item => item.humidity), null];
    
    // Add prediction indicator
    datasets.push({
      label: `Prediction Impact (${predictionData.confidence.toFixed(1)}% confidence)`,
      data: [...Array(data.length).fill(null), predictionData.prediction / 10], // Scale down for visibility
      borderColor: 'rgb(16, 185, 129)', // Green
      backgroundColor: 'rgba(16, 185, 129, 0.3)',
      yAxisID: 'y',
      borderWidth: 3,
      borderDash: [10, 5],
      fill: false,
      tension: 0,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointStyle: 'circle',
    });
  }

  const chartData = {
    labels,
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          afterBody: (tooltipItems: any) => {
            if (predictionData?.success && tooltipItems[0].dataIndex === data.length) {
              return [
                `Predicted Consumption: ${predictionData.prediction.toFixed(2)} kWh`,
                `Model: ${predictionData.model_type}`,
                `Features: ${predictionData.features_used}`,
                `Timestamp: ${new Date(predictionData.timestamp).toLocaleString()}`
              ];
            }
            return [];
          }
        }
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: 'rgb(239, 68, 68)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Humidity (%)',
          color: 'rgb(59, 130, 246)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default WeatherChart;
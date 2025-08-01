import React from 'react';
import { ConsumptionData } from '../../types/dataTypes';
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
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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

interface ConsumptionChartProps {
  data: ConsumptionData[];
  predictionData?: PredictionResult | null;
}

const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ data, predictionData }) => {
  // Format dates for labels
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Process data for chart
  const labels = data.map(item => formatDate(item.timestamp));
  const datasets = [
    {
      label: 'Actual Consumption (kWh)',
      data: data.map(item => item.value),
      borderColor: 'rgb(59, 130, 246)', // Blue
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.2,
      pointRadius: 3,
      pointHoverRadius: 5,
    }
  ];

  // Add prediction data if available
  if (predictionData?.success) {
    // Add prediction point to the chart
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    labels.push(today);
    
    // Extend actual data with null for prediction point
    const actualData = [...data.map(item => item.value), null];
    datasets[0].data = actualData;
    
    // Add prediction dataset
    datasets.push({
      label: `Predicted (${predictionData.confidence.toFixed(1)}% confidence)`,
      data: [...Array(data.length).fill(null), predictionData.prediction],
      borderColor: 'rgb(16, 185, 129)', // Green
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 3,
      borderDash: [5, 5],
      fill: false,
      tension: 0,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointStyle: 'star',
    });
  }

  const chartData = {
    labels,
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          afterBody: (tooltipItems: any) => {
            if (predictionData?.success && tooltipItems[0].dataIndex === data.length) {
              return [
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
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Consumption (kWh)'
        }
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return <Line data={chartData} options={options} />;
};

export default ConsumptionChart;
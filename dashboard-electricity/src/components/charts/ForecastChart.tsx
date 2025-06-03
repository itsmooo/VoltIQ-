import React from 'react';
import { ForecastData } from '../../types/dataTypes';
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

interface ForecastChartProps {
  data: ForecastData[];
  showConfidenceInterval?: boolean;
}

const ForecastChart: React.FC<ForecastChartProps> = ({ data, showConfidenceInterval = false }) => {
  // Format dates for labels
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Process data for chart
  const labels = data.map(item => formatDate(item.timestamp));
  const predictedValues = data.map(item => item.predictedValue);
  
  const datasets = [
    {
      label: 'Forecast (kWh)',
      data: predictedValues,
      borderColor: 'rgb(16, 185, 129)', // Green
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      fill: false,
      tension: 0.2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }
  ];
  
  // Add confidence interval datasets if enabled
  if (showConfidenceInterval) {
    datasets.push(
      {
        label: 'Upper Bound',
        data: data.map(item => item.upperBound),
        borderColor: 'rgba(16, 185, 129, 0.3)',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Lower Bound',
        data: data.map(item => item.lowerBound),
        borderColor: 'rgba(16, 185, 129, 0.3)',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
        fill: '+1',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      }
    );
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
        labels: {
          filter: (item: any) => {
            // Hide confidence bound legends if they're not needed for clarity
            if (!showConfidenceInterval) return true;
            return item.text !== 'Upper Bound' && item.text !== 'Lower Bound';
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          afterTitle: (tooltipItems: any) => {
            if (!showConfidenceInterval) return '';
            
            const index = tooltipItems[0].dataIndex;
            const confidence = data[index].confidence;
            return `Confidence: ${confidence.toFixed(1)}%`;
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

export default ForecastChart;
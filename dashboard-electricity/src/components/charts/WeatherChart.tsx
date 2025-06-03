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

interface WeatherChartProps {
  data: WeatherData[];
}

const WeatherChart: React.FC<WeatherChartProps> = ({ data }) => {
  // Format dates for labels
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Process data for chart
  const labels = data.map(item => formatDate(item.timestamp));
  
  const chartData = {
    labels,
    datasets: [
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
    ],
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
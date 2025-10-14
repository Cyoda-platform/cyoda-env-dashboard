/**
 * Chart.js Configuration
 * Common configuration for all charts
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Default chart options
 */
export const defaultChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 15,
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 13,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false,
  },
};

/**
 * Bar chart options
 */
export const barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 15,
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false,
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
  },
};

/**
 * Color palette for charts
 */
export const chartColors = {
  primary: 'rgba(24, 144, 255, 1)',
  primaryLight: 'rgba(24, 144, 255, 0.2)',
  success: 'rgba(82, 196, 26, 1)',
  successLight: 'rgba(82, 196, 26, 0.2)',
  warning: 'rgba(250, 173, 20, 1)',
  warningLight: 'rgba(250, 173, 20, 0.2)',
  error: 'rgba(255, 77, 79, 1)',
  errorLight: 'rgba(255, 77, 79, 0.2)',
  purple: 'rgba(114, 46, 209, 1)',
  purpleLight: 'rgba(114, 46, 209, 0.2)',
  cyan: 'rgba(19, 194, 194, 1)',
  cyanLight: 'rgba(19, 194, 194, 0.2)',
};

/**
 * Format timestamp for chart labels
 */
export function formatChartTimestamp(timestamp: string | number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format value for chart display
 */
export function formatChartValue(value: number, unit?: string): string {
  if (unit === 'bytes') {
    return formatBytes(value);
  }
  if (unit === 'percentage') {
    return `${value.toFixed(2)}%`;
  }
  return value.toFixed(2);
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}


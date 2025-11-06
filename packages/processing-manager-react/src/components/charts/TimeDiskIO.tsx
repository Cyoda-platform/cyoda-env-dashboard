/**
 * Time Disk I/O Chart Component
 * Migrated from @cyoda/processing-manager/src/components/PmCharts/PmTimeDiskIO.vue
 */

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
  TimeScale,
  ChartOptions,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface IODataPoint {
  t: number | string;
  y: number;
}

interface TimeDiskIOProps {
  ioData?: IODataPoint[];
  swapData?: IODataPoint[];
  height?: number;
}

export default function TimeDiskIO({ 
  ioData = [], 
  swapData = [], 
  height = 300 
}: TimeDiskIOProps) {
  const chartData = {
    datasets: [
      {
        backgroundColor: 'rgba(255, 209, 0, .5)',
        borderColor: 'rgba(255, 209, 0, 1)',
        borderJoinStyle: 'miter' as const,
        borderWidth: 1,
        data: ioData,
        fill: false,
        label: 'Disk I/O',
        tension: 0,
        pointHitRadius: 10,
        pointRadius: 0,
      },
      {
        backgroundColor: 'rgba(204, 1, 153, .5)',
        borderColor: 'rgba(204, 1, 153, 1)',
        borderJoinStyle: 'miter' as const,
        borderWidth: 1,
        data: swapData,
        fill: false,
        label: 'Swap I/O',
        tension: 0,
        pointHitRadius: 10,
        pointRadius: 0,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: '#fbfbfb',
        bodyColor: '#32363C',
        borderColor: '#999',
        borderWidth: 0.5,
        caretPadding: 10,
        cornerRadius: 0,
        displayColors: false,
        position: 'nearest',
        titleColor: '#606469',
        padding: {
          x: 16,
          y: 10,
        },
      },
      legend: {
        display: false,
      },
    },
    animation: {
      duration: 0,
    },
    scales: {
      x: {
        type: 'time',
        grid: {
          display: false,
        },
        time: {
          displayFormats: {
            hour: 'HH:00',
            minute: 'HH:00',
          },
        },
        ticks: {
          source: 'data',
          autoSkip: true,
          autoSkipPadding: 75,
          maxRotation: 0,
          sampleSize: 5,
        },
      },
      y: {
        grid: {
          borderDash: [3, 6],
        },
        ticks: {
          beginAtZero: true,
          callback: function(value) {
            const numValue = typeof value === 'number' ? value : parseFloat(value as string);
            if (numValue >= 1000) {
              return `${(numValue / 1000).toFixed(1)}K`;
            }
            return value;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
}


/**
 * Time CPU Usage Chart Component
 * Migrated from @cyoda/processing-manager/src/components/PmCharts/PmTimeCpuUsage.vue
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

interface CpuDataPoint {
  t: number | string;
  y: number;
}

interface TimeCpuUsageProps {
  data?: CpuDataPoint[];
  height?: number;
}

export default function TimeCpuUsage({ data = [], height = 300 }: TimeCpuUsageProps) {
  const chartData = {
    datasets: [
      {
        backgroundColor: 'rgba(54, 131, 220, .5)',
        borderColor: 'rgba(54, 131, 220, 1)',
        borderJoinStyle: 'miter' as const,
        borderWidth: 1,
        data: data,
        fill: false,
        label: 'CPU %',
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


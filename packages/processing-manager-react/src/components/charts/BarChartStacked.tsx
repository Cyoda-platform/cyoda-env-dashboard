/**
 * Stacked Bar Chart Component
 * Migrated from @cyoda/processing-manager/src/components/PmCharts/PmBarChartStacked.vue
 */

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ResourceData {
  name: string;
  size: number;
  available: number;
}

interface BarChartStackedProps {
  resources?: ResourceData[];
  height?: number;
}

export default function BarChartStacked({ 
  resources = [], 
  height = 300 
}: BarChartStackedProps) {
  const chartData = {
    labels: resources.map((el) => el.name),
    datasets: [
      {
        label: 'Size',
        backgroundColor: '#3da3e8',
        data: resources.map((el) => el.size),
      },
      {
        label: 'Available',
        backgroundColor: '#fd6585',
        data: resources.map((el) => el.available),
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

